import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Handle Product Creation
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        productName: body.productName,
        hsnCode: body.hsnCode || null,
        sku: body.sku || null,
        tax: body.tax ? parseFloat(body.tax) : null,
        barcode: body.barcode, // Ensure barcode is unique
        warehouseLocation: body.warehouseLocation || null,
        image: body.image || null,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ success: false, error: "Failed to add product" }, { status: 500 });
  }
}

// ✅ Handle Fetching Products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
