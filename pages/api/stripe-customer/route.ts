import { NextResponse } from "next/server"
import { stripe } from "@/app/lib/stripe"
import { supabaseAdmin } from "@/app/lib/supabase"

// 🔒 Authenticated Stripe Customer API
export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = authHeader.replace("Bearer ", "").trim()
    const { data: { user }, error: authError } =
      await supabaseAdmin.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    const { customerId, name, phone } = await req.json()

    // Check if the customerId belongs to this user
    const storedId = user.user_metadata?.stripe_customer_id
    if (!storedId || storedId !== customerId) {
      return NextResponse.json({ error: "Forbidden: Customer mismatch" }, { status: 403 })
    }

    // ✅ Update Stripe customer
    const updated = await stripe.customers.update(customerId, { name, phone })
    return NextResponse.json({ success: true, customer: updated })
  } catch (err: any) {
    console.error("❌ Stripe PATCH error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// === Fetch Customer Info (optional) ===
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = authHeader.replace("Bearer ", "").trim()
    const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    const customerId = user.user_metadata?.stripe_customer_id
    if (!customerId)
      return NextResponse.json({ error: "Stripe ID missing" }, { status: 404 })

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
