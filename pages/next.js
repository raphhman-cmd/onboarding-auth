// app/api/stripe-customer/route.ts (server-side)
import { stripe } from "@/lib/stripe"; // stripe liest process.env.STRIPE_SECRET_KEY intern

export async function PATCH(req: Request) {
  // prüfe Auth hier serverseitig (siehe unten)
  const body = await req.json();
  const { customerId, name, phone } = body;
  // update stripe:
  const updated = await stripe.customers.update(customerId, { name, phone });
  return new Response(JSON.stringify({ success: true, customer: updated }), { status: 200 });
}
