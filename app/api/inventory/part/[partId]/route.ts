import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partId: string }> }
) {
  try {
    const { partId } = await params

    if (!partId) {
      return NextResponse.json(
        { success: false, error: 'Part ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch the main part data
    const { data: part, error: partError } = await supabase
      .from('parts')
      .select('*')
      .eq('id', partId)
      .single()

    if (partError || !part) {
      console.error('Error fetching part:', partError)
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      )
    }

    // Fetch compatible vehicles (fitment)
    const { data: fitmentData, error: fitmentError } = await supabase
      .from('parts_fitment')
      .select('motorcycle_id')
      .eq('part_id', partId)

    if (fitmentError) {
      console.error('Error fetching fitment:', fitmentError)
    }

    // Fetch backup suppliers
    const { data: backupSuppliersData, error: backupError } = await supabase
      .from('parts_backup_suppliers')
      .select('*')
      .eq('part_id', partId)
      .order('created_at', { ascending: true })

    if (backupError) {
      console.error('Error fetching backup suppliers:', backupError)
    }

    // Fetch recent transactions for lifecycle tracking
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('parts_transactions')
      .select('*')
      .eq('part_id', partId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    // Extract compatible vehicle IDs
    const compatibleVehicles = fitmentData
      ? fitmentData.map((f: any) => f.motorcycle_id)
      : []

    // Transform backup suppliers to frontend format
    const secondarySuppliers = backupSuppliersData
      ? backupSuppliersData.map((supplier: any) => ({
          name: supplier.supplier_name,
          phone: supplier.supplier_phone,
          email: supplier.supplier_email,
          website: supplier.supplier_website,
          vendorSku: supplier.vendor_sku,
          leadTimeDays: supplier.lead_time_days,
          minimumOrderQuantity: supplier.minimum_order_quantity,
        }))
      : []

    // Extract lifecycle dates from transactions
    let lastRestocked: string | null = null
    let lastSoldDate: string | null = null
    let lastPurchaseDate: string | null = null

    if (transactionsData && transactionsData.length > 0) {
      const purchaseTx = transactionsData.find((tx: any) => tx.transaction_type === 'purchase')
      const saleTx = transactionsData.find((tx: any) => tx.transaction_type === 'sale')

      if (purchaseTx) {
        lastPurchaseDate = purchaseTx.created_at
        lastRestocked = purchaseTx.created_at
      }
      if (saleTx) {
        lastSoldDate = saleTx.created_at
      }
    }

    // Transform part data to match frontend interface
    const transformedPart = {
      id: part.id,
      partNumber: part.part_number,
      partName: part.part_name,
      category: part.category,
      make: part.make,
      model: part.model,
      usedFor: part.used_for,
      description: part.description,
      onHandStock: part.on_hand_stock,
      warehouseStock: part.warehouse_stock,
      lowStockThreshold: part.low_stock_threshold,
      purchasePrice: parseFloat(part.purchase_price),
      sellingPrice: parseFloat(part.selling_price),
      margin: parseFloat(part.profit_margin_pct || '0'),
      wholesalePrice: part.wholesale_price ? parseFloat(part.wholesale_price) : null,
      coreCharge: part.core_charge ? parseFloat(part.core_charge) : null,
      priceLastUpdated: null, // Not tracked in database yet
      sku: part.sku,
      oemPartNumber: part.oem_part_number,
      compatibleVehicles,
      weight: part.weight,
      dimensions: part.length || part.width || part.height
        ? {
            length: part.length ? parseFloat(part.length) : null,
            width: part.width ? parseFloat(part.width) : null,
            height: part.height ? parseFloat(part.height) : null,
          }
        : null,
      quantityPerPackage: part.quantity_per_package,
      isHazardous: part.is_hazardous,
      location: part.location,
      supplier: part.supplier,
      supplierPhone: part.supplier_phone,
      supplierEmail: part.supplier_email,
      supplierWebsite: part.supplier_website,
      vendorSku: part.vendor_sku,
      leadTimeDays: part.lead_time_days,
      minimumOrderQuantity: part.minimum_order_quantity,
      secondarySuppliers: secondarySuppliers.length > 0 ? secondarySuppliers : null,
      lastRestocked,
      dateAdded: part.created_at,
      lastSoldDate,
      lastPurchaseDate,
      batchNumber: part.batch_number,
      expirationDate: part.expiration_date,
      warrantyMonths: part.warranty_months,
      countryOfOrigin: part.country_of_origin,
      technicalDiagramUrl: part.technical_diagram_url,
      installationInstructionsUrl: part.installation_instructions_url,
      status: part.stock_status as 'in-stock' | 'low-stock' | 'out-of-stock',
    }

    return NextResponse.json({
      success: true,
      part: transformedPart,
    })
  } catch (error) {
    console.error('Error in part API route:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch part'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/part/[partId]
 *
 * Updates an existing part in the inventory
 *
 * Request body should contain the fields to update.
 * All 60+ data points from the Part interface are supported.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ partId: string }> }
) {
  try {
    const { partId } = await params

    if (!partId) {
      return NextResponse.json(
        { success: false, error: 'Part ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.partName || !body.partNumber || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Part name, part number, and category are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Prepare update data for main part table
    const partUpdateData: any = {
      part_name: body.partName,
      part_number: body.partNumber,
      category: body.category,
      make: body.make || null,
      model: body.model || null,
      used_for: body.usedFor || '',
      description: body.description || null,
      on_hand_stock: body.onHandStock ?? 0,
      warehouse_stock: body.warehouseStock ?? 0,
      low_stock_threshold: body.lowStockThreshold ?? 0,
      purchase_price: body.purchasePrice ?? 0,
      selling_price: body.sellingPrice ?? 0,
      profit_margin_pct: body.margin ?? 0,
      wholesale_price: body.wholesalePrice || null,
      core_charge: body.coreCharge || null,
      sku: body.sku || null,
      oem_part_number: body.oemPartNumber || null,
      weight: body.weight || null,
      length: body.dimensions?.length || null,
      width: body.dimensions?.width || null,
      height: body.dimensions?.height || null,
      quantity_per_package: body.quantityPerPackage || null,
      is_hazardous: body.isHazardous ?? false,
      location: body.location || null,
      supplier: body.supplier || null,
      supplier_phone: body.supplierPhone || null,
      supplier_email: body.supplierEmail || null,
      supplier_website: body.supplierWebsite || null,
      vendor_sku: body.vendorSku || null,
      lead_time_days: body.leadTimeDays || null,
      minimum_order_quantity: body.minimumOrderQuantity || null,
      batch_number: body.batchNumber || null,
      expiration_date: body.expirationDate || null,
      warranty_months: body.warrantyMonths || null,
      country_of_origin: body.countryOfOrigin || null,
      technical_diagram_url: body.technicalDiagramUrl || null,
      installation_instructions_url: body.installationInstructionsUrl || null,
      updated_at: new Date().toISOString(),
    }

    // Calculate stock status
    const totalStock = (body.onHandStock ?? 0) + (body.warehouseStock ?? 0)
    if (totalStock === 0) {
      partUpdateData.stock_status = 'out-of-stock'
    } else if (totalStock <= (body.lowStockThreshold ?? 0)) {
      partUpdateData.stock_status = 'low-stock'
    } else {
      partUpdateData.stock_status = 'in-stock'
    }

    // Update main part record
    const { data: updatedPart, error: updateError } = await supabase
      .from('parts')
      .update(partUpdateData)
      .eq('id', partId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating part:', updateError)
      return NextResponse.json(
        { success: false, error: `Failed to update part: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update compatible vehicles (fitment)
    if (body.compatibleVehicles !== undefined) {
      // Delete existing fitment records
      const { error: deleteFitmentError } = await supabase
        .from('parts_fitment')
        .delete()
        .eq('part_id', partId)

      if (deleteFitmentError) {
        console.error('Error deleting existing fitment:', deleteFitmentError)
      }

      // Insert new fitment records
      if (body.compatibleVehicles.length > 0) {
        const fitmentRecords = body.compatibleVehicles.map((motorcycleId: string) => ({
          part_id: partId,
          motorcycle_id: motorcycleId,
        }))

        const { error: insertFitmentError } = await supabase
          .from('parts_fitment')
          .insert(fitmentRecords)

        if (insertFitmentError) {
          console.error('Error inserting fitment:', insertFitmentError)
        }
      }
    }

    // Update backup suppliers if provided
    if (body.secondarySuppliers !== undefined) {
      // Delete existing backup suppliers
      const { error: deleteSuppliersError } = await supabase
        .from('parts_backup_suppliers')
        .delete()
        .eq('part_id', partId)

      if (deleteSuppliersError) {
        console.error('Error deleting backup suppliers:', deleteSuppliersError)
      }

      // Insert new backup suppliers
      if (body.secondarySuppliers.length > 0) {
        const supplierRecords = body.secondarySuppliers.map((supplier: any) => ({
          part_id: partId,
          supplier_name: supplier.name,
          supplier_phone: supplier.phone || null,
          supplier_email: supplier.email || null,
          supplier_website: supplier.website || null,
          vendor_sku: supplier.vendorSku || null,
          lead_time_days: supplier.leadTimeDays || null,
          minimum_order_quantity: supplier.minimumOrderQuantity || null,
        }))

        const { error: insertSuppliersError } = await supabase
          .from('parts_backup_suppliers')
          .insert(supplierRecords)

        if (insertSuppliersError) {
          console.error('Error inserting backup suppliers:', insertSuppliersError)
        }
      }
    }

    // Fetch updated part with all relations
    const { data: fitmentData } = await supabase
      .from('parts_fitment')
      .select('motorcycle_id')
      .eq('part_id', partId)

    const { data: backupSuppliersData } = await supabase
      .from('parts_backup_suppliers')
      .select('*')
      .eq('part_id', partId)
      .order('created_at', { ascending: true })

    // Transform response to match frontend format
    const compatibleVehicles = fitmentData
      ? fitmentData.map((f: any) => f.motorcycle_id)
      : []

    const secondarySuppliers = backupSuppliersData
      ? backupSuppliersData.map((supplier: any) => ({
          name: supplier.supplier_name,
          phone: supplier.supplier_phone,
          email: supplier.supplier_email,
          website: supplier.supplier_website,
          vendorSku: supplier.vendor_sku,
          leadTimeDays: supplier.lead_time_days,
          minimumOrderQuantity: supplier.minimum_order_quantity,
        }))
      : []

    const transformedPart = {
      id: updatedPart.id,
      partNumber: updatedPart.part_number,
      partName: updatedPart.part_name,
      category: updatedPart.category,
      make: updatedPart.make,
      model: updatedPart.model,
      usedFor: updatedPart.used_for,
      description: updatedPart.description,
      onHandStock: updatedPart.on_hand_stock,
      warehouseStock: updatedPart.warehouse_stock,
      lowStockThreshold: updatedPart.low_stock_threshold,
      purchasePrice: parseFloat(updatedPart.purchase_price),
      sellingPrice: parseFloat(updatedPart.selling_price),
      margin: parseFloat(updatedPart.profit_margin_pct || '0'),
      wholesalePrice: updatedPart.wholesale_price ? parseFloat(updatedPart.wholesale_price) : null,
      coreCharge: updatedPart.core_charge ? parseFloat(updatedPart.core_charge) : null,
      priceLastUpdated: null,
      sku: updatedPart.sku,
      oemPartNumber: updatedPart.oem_part_number,
      compatibleVehicles,
      weight: updatedPart.weight,
      dimensions: updatedPart.length || updatedPart.width || updatedPart.height
        ? {
            length: updatedPart.length ? parseFloat(updatedPart.length) : null,
            width: updatedPart.width ? parseFloat(updatedPart.width) : null,
            height: updatedPart.height ? parseFloat(updatedPart.height) : null,
          }
        : null,
      quantityPerPackage: updatedPart.quantity_per_package,
      isHazardous: updatedPart.is_hazardous,
      location: updatedPart.location,
      supplier: updatedPart.supplier,
      supplierPhone: updatedPart.supplier_phone,
      supplierEmail: updatedPart.supplier_email,
      supplierWebsite: updatedPart.supplier_website,
      vendorSku: updatedPart.vendor_sku,
      leadTimeDays: updatedPart.lead_time_days,
      minimumOrderQuantity: updatedPart.minimum_order_quantity,
      secondarySuppliers: secondarySuppliers.length > 0 ? secondarySuppliers : null,
      lastRestocked: body.lastRestocked || null,
      dateAdded: updatedPart.created_at,
      lastSoldDate: body.lastSoldDate || null,
      lastPurchaseDate: body.lastPurchaseDate || null,
      batchNumber: updatedPart.batch_number,
      expirationDate: updatedPart.expiration_date,
      warrantyMonths: updatedPart.warranty_months,
      countryOfOrigin: updatedPart.country_of_origin,
      technicalDiagramUrl: updatedPart.technical_diagram_url,
      installationInstructionsUrl: updatedPart.installation_instructions_url,
      status: updatedPart.stock_status as 'in-stock' | 'low-stock' | 'out-of-stock',
    }

    return NextResponse.json({
      success: true,
      part: transformedPart,
      message: 'Part updated successfully',
    })
  } catch (error) {
    console.error('Error in PUT part API route:', error)
    const message = error instanceof Error ? error.message : 'Failed to update part'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
