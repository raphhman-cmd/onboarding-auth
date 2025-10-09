import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    // 🛡️ CORS
    res.setHeader("Access-Control-Allow-Origin", "https://explainsmart.at")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.status(200).end()
        return
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {
        const { plan, email } = req.body

        // 🔹 Verwende hier NUR recurring Preise aus Stripe!
        const priceMap = {
            starter_monthly: "price_1SEwUSLKVq0tYR2Qn7L2GJ5u",       // recurring, monatlich
            starter_yearly: "price_1SEwUSLKVq0tYR2QoHY6NO9u",         // recurring, jährlich
            professional_monthly: "price_1SFsBGLKVq0tYR2QHNvcjv1k",     // recurring, monatlich
            professional_yearly: "price_1SFsBrLKVq0tYR2QiRGp88T8",       // recurring, jährlich
            enterprise_monthly: "price_1SFsDmLKVq0tYR2Qgi2OFzXv",
            enterprise_yearly: "price_1SFsEGLKVq0tYR2QjJYvq4e9",
        }

        const priceId = priceMap[plan]
        if (!priceId) {
            return res.status(400).json({ error: "Ungültiger Plan" })
        }

        // 🔹 Kunden suchen oder anlegen
        const existingCustomers = await stripe.customers.list({ email, limit: 1 })
        const customer = existingCustomers.data.length
            ? existingCustomers.data[0]
            : await stripe.customers.create({ email })

        // 🔹 Subscription mit 30 Tagen kostenlos
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            trial_period_days: 30, // 🎁 30 Tage gratis
            payment_behavior: "default_incomplete", // Karte wird sofort gespeichert, aber erst nach Trial belastet
            expand: ["latest_invoice.payment_intent"], // PaymentIntent wird sofort zurückgegeben
        })

        // 🔹 client_secret extrahieren
        const paymentIntent = subscription?.latest_invoice?.payment_intent
        if (!paymentIntent) {
            console.error("⚠️ Kein PaymentIntent vorhanden:", subscription)
            return res.status(500).json({ error: "Stripe hat kein PaymentIntent geliefert." })
        }

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        })
    } catch (err) {
        console.error("❌ Stripe Error:", err)
        res.status(500).json({ error: err.message })
    }
}
