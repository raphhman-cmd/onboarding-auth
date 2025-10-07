import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { plan, email } = req.body

    // Stripe Price-IDs aus deinem Dashboard
    const priceMap = {
      starter: "price_12345",
      professional: "price_67890",
      enterprise: "price_ABCDE",
    }

    const priceId = priceMap[plan]
    if (!priceId) {
      return res.status(400).json({ error: "Ungültiger Plan" })
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: "https://explainsmart.at/dashboard",
      cancel_url: "https://explainsmart.at/checkout?canceled=true",
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error("Stripe Error:", err)
    return res.status(500).json({ error: err.message })
  }
}
