import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/inventory/add
 *
 * Adds a new part to the inventory
 *
 * Request Body:
 * - All part fields from the add part form
 *
 * Returns:
 * - success: boolean
 * - part: the created part object
 * - error: string (if failed)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the user's garage_id from session storage or auth
    // For now, we'll use the garage_id from the request body
    // In production, this should come from authentication
    const garageId = body.garageId

    if (!garageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Garage ID is required',
        },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS policies that reference non-existent garage_auth table
    const supabase = createAdminClient()

    // First, check if part with same part_number already exists
    const { data: existingPart, error: checkError } = await supabase
      .from('parts')
      .select('id, part_number, part_name')
      .eq('garage_id', garageId)
      .eq('part_number', body.partNumber)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is what we want
      console.error('Error checking for duplicate part:', checkError)
      throw new Error(`Failed to check for duplicate: ${checkError.message}`)
    }

    if (existingPart) {
      return NextResponse.json(
        {
          success: false,
          error: `A part with part number "${body.partNumber}" already exists`,
          existingPart: {
            id: existingPart.id,
            partNumber: existingPart.part_number,
            partName: existingPart.part_name,
          },
        },
        { status: 409 }
      )
    }

    // Calculate margin
    const margin =
      body.purchasePrice > 0
        ? ((body.sellingPrice - body.purchasePrice) / body.purchasePrice) * 100
        : 0

    // Determine stock status
    let stockStatus = 'in-stock'
    if (body.onHandStock === 0) {
      stockStatus = 'out-of-stock'
    } else if (body.onHandStock <= body.lowStockThreshold) {
      stockStatus = 'low-stock'
    }

    // Prepare the part data
    const partData = {
      garage_id: garageId,

      // Basic Information
      part_number: body.partNumber,
      part_name: body.partName,
      category: body.category,
      make: body.make || null,
      model: body.model || null,
      used_for: body.usedFor,
      description: body.description || null,

      // Stock Information
      on_hand_stock: body.onHandStock || 0,
      warehouse_stock: body.warehouseStock || 0,
      low_stock_threshold: body.lowStockThreshold || 5,
      stock_status: stockStatus,

      // Pricing
      purchase_price: body.purchasePrice || 0,
      selling_price: body.sellingPrice || 0,
      wholesale_price: body.wholesalePrice || null,
      core_charge: body.coreCharge || 0,
      profit_margin_pct: margin,

      // Identification
      sku: body.sku || null,
      oem_part_number: body.oemPartNumber || null,

      // Universal Fitment
      is_universal_fitment: body.isUniversalFitment === true,

      // Vendor Information
      supplier: body.supplier || null,
      supplier_phone: body.supplierPhone || null,
      supplier_email: body.supplierEmail || null,
      supplier_website: body.supplierWebsite || null,
      vendor_sku: body.vendorSku || null,
      lead_time_days: body.leadTimeDays || 0,
      minimum_order_quantity: body.minimumOrderQuantity || 0,
      location: body.location || null,

      // Lifecycle & Tracking
      batch_number: body.batchNumber || null,
      expiration_date: body.expirationDate || null,
      warranty_months: body.warrantyMonths || 0,
      country_of_origin: body.countryOfOrigin || null,

      // Digital Assets
      technical_diagram_url: body.technicalDiagramUrl || null,
      installation_instructions_url: body.installationInstructionsUrl || null,

      // Physical Attributes
      weight: body.weight || null,
      length: body.length || null,
      width: body.width || null,
      height: body.height || null,
      quantity_per_package: body.quantityPerPackage || 1,
      is_hazardous: body.isHazardous || false,

      // Metadata
      status: 'active',
    }

    // Insert the part
    const { data: newPart, error: insertError } = await supabase
      .from('parts')
      .insert(partData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting part:', insertError)
      throw new Error(`Failed to insert part: ${insertError.message}`)
    }

    // Handle compatible vehicles (fitment)
    const isUniversalFitment = body.isUniversalFitment === true

    // Only create fitment records if not universal AND vehicles are selected
    if (!isUniversalFitment && body.compatibleVehicles && body.compatibleVehicles.length > 0) {
      const fitmentData = body.compatibleVehicles.map((motorcycleId: string) => ({
        part_id: newPart.id,
        motorcycle_id: motorcycleId,
        garage_id: garageId,
      }))

      const { error: fitmentError } = await supabase
        .from('parts_fitment')
        .insert(fitmentData)

      if (fitmentError) {
        console.error('Error inserting fitment:', fitmentError)
        // Don't throw, just log - the part was created successfully
      }
    }

    // Handle backup suppliers
    if (body.backupSuppliers && body.backupSuppliers.length > 0) {
      const backupSuppliersData = body.backupSuppliers
        .filter((supplier: any) => supplier.name && supplier.name.trim() !== '')
        .map((supplier: any) => ({
          part_id: newPart.id,
          garage_id: garageId,
          supplier_name: supplier.name,
          supplier_phone: supplier.phone || null,
          supplier_email: supplier.email || null,
          supplier_website: supplier.website || null,
          vendor_sku: supplier.vendorSku || null,
          lead_time_days: supplier.leadTimeDays || 0,
          minimum_order_quantity: supplier.minimumOrderQuantity || 0,
          is_preferred: false,
        }))

      if (backupSuppliersData.length > 0) {
        const { error: backupError } = await supabase
          .from('parts_backup_suppliers')
          .insert(backupSuppliersData)

        if (backupError) {
          console.error('Error inserting backup suppliers:', backupError)
          // Don't throw, just log - the part was created successfully
        }
      }
    }

    // Transform the response to match frontend format
    const transformedPart = {
      id: newPart.id,
      partNumber: newPart.part_number,
      partName: newPart.part_name,
      category: newPart.category,
      make: newPart.make,
      model: newPart.model,
      usedFor: newPart.used_for,
      onHandStock: newPart.on_hand_stock,
      warehouseStock: newPart.warehouse_stock,
      lowStockThreshold: newPart.low_stock_threshold,
      purchasePrice: parseFloat(newPart.purchase_price),
      sellingPrice: parseFloat(newPart.selling_price),
      margin: parseFloat(newPart.profit_margin_pct || '0'),
      location: newPart.location,
      supplier: newPart.supplier,
      stockStatus: newPart.stock_status,
      createdAt: newPart.created_at,
      updatedAt: newPart.updated_at,
    }

    return NextResponse.json({
      success: true,
      part: transformedPart,
      message: 'Part added successfully',
    })
  } catch (error) {
    console.error('Error adding part:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add part',
      },
      { status: 500 }
    )
  }
}
