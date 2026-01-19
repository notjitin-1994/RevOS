import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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
