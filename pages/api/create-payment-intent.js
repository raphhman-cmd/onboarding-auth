import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {
        const { plan, email } = req.body

        // Deine Stripe Price-IDs
        const priceMap = {
            starter_monthly: "price_1SEwUSLKVq0tYR2Qn7L2GJ5u",
            starter_yearly:"price_1SEwUSLKVq0tYR2QoHY6NO9u",
            professional_monthly: "price_1SFsBGLKVq0tYR2QHNvcjv1k",
            professional_yearly: "price_1SFsBrLKVq0tYR2QiRGp88T8",
            enterprise_monthly: "price_1SFsEGLKVq0tYR2QjJYvq4e9",
            enterprise_yearly: "price_1SFsDmLKVq0tYR2Qgi2OFzXv",
        }

        const priceId = priceMap[plan]
        if (!priceId) {
            return res.status(400).json({ error: "Ungültiger Plan" })
        }

        // Stripe-Kunde finden oder erstellen
        const existingCustomers = await stripe.customers.list({
            email,
            limit: 1,
        })

        let customer
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0]
        } else {
            customer = await stripe.customers.create({
                email,
                description: `ExplainSmart Kunde (${plan})`,
            })
        }
        // 🔹 Kunden finden oder neu anlegen
        const existingCustomers = await stripe.customers.list({ email, limit: 1 })
        let customer = existingCustomers.data.length
            ? existingCustomers.data[0]
            : await stripe.customers.create({ email })

        // Abo mit 30 Tagen kostenlos
        // 🔹 Subscription erstellen mit 30 Tagen gratis
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],

        const clientSecret = subscription.latest_invoice.payment_intent.client_secret

        res.status(200).json({ clientSecret })
    } catch (error) {
        console.error("❌ Stripe Error:", error)
        res.status(500).json({ error: error.message })
        return res.status(200).json({ clientSecret })
    } catch (err) {
        console.error("Stripe Error:", err)
        return res.status(500).json({ error: err.message })
    }
}
