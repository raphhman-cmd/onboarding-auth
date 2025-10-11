import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 })
    }

    const customer = await stripe.customers.retrieve(customerId)
    return NextResponse.json({
      name: (customer as any).name || "",
      phone: (customer as any).phone || "",
    })
  } catch (err: any) {
    console.error("❌ Stripe GET error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { customerId, name, phone } = body

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 })
    }

    const updated = await stripe.customers.update(customerId, {
      name,
      phone,
    })

    return NextResponse.json({
      success: true,
      customer: updated,
    })
  } catch (err: any) {
    console.error("❌ Stripe PATCH error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

