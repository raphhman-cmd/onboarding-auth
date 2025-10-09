import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    // 🛡️ CORS
    res.setHeader("Access-Control-Allow-Origin", "https://explainsmart.at")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") return res.status(200).end()
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" })

    try {
        const { plan, email } = req.body

        // 🔹 Stripe Price IDs
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

        // 🔹 Kunde finden oder neu anlegen
        const existing = await stripe.customers.list({ email, limit: 1 })
        const customer = existing.data.length
            ? existing.data[0]
            : await stripe.customers.create({ email })

        // 🔹 Subscription anlegen (Trial + Intent holen)
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            trial_period_days: 30,
            payment_behavior: "default_incomplete",
            collection_method: "charge_automatically",
            expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
        })

        // ✅ Stripe gibt entweder einen payment_intent ODER setup_intent zurück
        const clientSecret =
            subscription.latest_invoice?.payment_intent?.client_secret ||
            subscription.pending_setup_intent?.client_secret

        // Debugging – zeigt dir im Render-Log, was Stripe wirklich zurückgibt
        console.log("🔍 Subscription Response:", JSON.stringify(subscription, null, 2))

        if (!clientSecret) {
            console.error("⚠️ Kein client_secret erhalten. Stripe Response:", subscription)
            return res.status(500).json({
                error:
                    "Stripe hat keinen Client Secret zurückgegeben. Bitte prüfe die Logs.",
            })
        }

        return res.status(200).json({ clientSecret })
    } catch (err) {
        console.error("❌ Stripe Error:", err)
        return res.status(500).json({ error: err.message })
    }
}
