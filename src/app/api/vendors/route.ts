import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const vendor = await prisma.vendor.create({
      data: {
        companyName: body.companyName,
        gstNumber: body.gstNumber,
        billingAddress: body.billingAddress,
        contactNumber: body.contactNumber,
        shippingAddress: body.shippingAddress || null,
        email: body.email,
        salutation: body.salutation || null,
        firstName: body.firstName,
        lastName: body.lastName,
        state: body.state,
        code: body.code,
        paymentTerms: body.paymentTerms,
      },
    });

    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return NextResponse.json({ success: false, error: "Failed to add vendor" }, { status: 500 });
  }
}

// ✅ Fix: Move GET outside of POST
export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany();
    return NextResponse.json({ success: true, vendors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vendors" }, { status: 500 });
  }
}
