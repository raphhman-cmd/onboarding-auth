import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "https://explainsmart.at")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") return res.status(200).end()
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" })

    try {
        const { plan, email } = req.body

        const priceMap = {
            starter_monthly: "price_1SEwUSLKVq0tYR2Qn7L2GJ5u",
            starter_yearly: "price_1SEwUSLKVq0tYR2QoHY6NO9u",
            professional_monthly: "price_1SFsBGLKVq0tYR2QHNvcjv1k",
            professional_yearly: "price_1SFsBrLKVq0tYR2QiRGp88T8",
            enterprise_monthly: "price_1SFsEGLKVq0tYR2QjJYvq4e9",
            enterprise_yearly: "price_1SFsDmLKVq0tYR2Qgi2OFzXv",
        }

        const priceId = priceMap[plan]
        if (!priceId) return res.status(400).json({ error: "Ungültiger Plan" })

        // 🔍 Customer abrufen oder erstellen
        const existing = await stripe.customers.list({ email, limit: 1 })
        const customer =
            existing.data.length > 0
                ? existing.data[0]
                : await stripe.customers.create({ email })

        // 💳 Subscription mit 30 Tagen Trial anlegen
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            trial_period_days: 30,
            payment_behavior: "default_incomplete",
            collection_method: "charge_automatically",
            expand: ["pending_setup_intent"],
        })

        const clientSecret = subscription.pending_setup_intent.client_secret

        return res.status(200).json({
            clientSecret,
            intentType: "setup_intent",
        })
    } catch (err) {
        console.error("❌ Stripe Error:", err)
        return res.status(500).json({ error: err.message })
    }
}
