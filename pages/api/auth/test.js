import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase.from("users").select("id, email").limit(1)

  if (error) {
    console.error("❌ Verbindung fehlgeschlagen:", error)
    return res.status(500).json({ ok: false, error: error.message })
  }

  res.status(200).json({ ok: true, connected: true, exampleUser: data })
}
