import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- PaymentIntent erstellen ---
app.post("/api/auth/create-payment-intent", async (req, res) => {
  try {
    const { plan, email } = req.body;

    // Preis-ID aus Stripe Dashboard
    const priceIdMap = {
      starter: "price_12345",
      professional: "price_67890",
      enterprise: "price_ABCDE",
    };

    const priceId = priceIdMap[plan];
    if (!priceId) return res.status(400).json({ error: "Ungültiger Plan" });

    // Stripe Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: "https://explainsmart.at/dashboard",
      cancel_url: "https://explainsmart.at/checkout?canceled=true",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
