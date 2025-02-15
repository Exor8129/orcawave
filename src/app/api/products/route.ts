import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid"; // For unique barcodes

const prisma = new PrismaClient();

// Define TypeScript Interface for Products
interface ProductInput {
  productName: string;
  hsnCode?: string | null;
  sku?: string | null;
  tax?: string | null | number;
  barcode?: string | null;
  warehouseLocation?: string | null;
  image?: string | null;
}

// ✅ Handle Product Creation (Single & Bulk Import)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Handle Bulk Import
    if (Array.isArray(body.products)) {
      const productsWithBarcode = body.products.map((product: ProductInput) => ({
        productName: product.productName,
        hsnCode: product.hsnCode || null,
        sku: product.sku || null,
        tax: product.tax ? parseFloat(product.tax as string) : null,
        barcode: product.barcode || uuidv4(), // Ensure barcode is unique
        warehouseLocation: product.warehouseLocation || null,
        image: product.image || null,
      }));

      // Using createMany but note it doesn't return inserted items
      const createdProducts = await prisma.product.createMany({
        data: productsWithBarcode,
        skipDuplicates: true,
      });

      return NextResponse.json(
        { success: true, message: "Products imported successfully", count: createdProducts.count },
        { status: 201 }
      );
    }

    // ✅ Handle Single Product Creation
    const product = await prisma.product.create({
      data: {
        productName: body.productName,
        hsnCode: body.hsnCode || null,
        sku: body.sku || null,
        tax: body.tax ? parseFloat(body.tax as string) : null,
        barcode: body.barcode || uuidv4(), // Assign barcode if missing
        warehouseLocation: body.warehouseLocation || null,
        image: body.image || null,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error adding product:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// ✅ Fetch All Products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error adding product:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to add product";
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// ✅ Update Product
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id: body.id },
      data: {
        productName: body.productName,
        hsnCode: body.hsnCode || null,
        sku: body.sku || null,
        tax: body.tax ? parseFloat(body.tax as string) : null,
        barcode: body.barcode, // Do NOT generate a new barcode
        warehouseLocation: body.warehouseLocation || null,
        image: body.image || null,
      },
    });

    return NextResponse.json({ success: true, updatedProduct }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

// ✅ Delete Product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id }, // ✅ Prisma expects `id` as a string
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
