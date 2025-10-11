import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "E-Mail und Passwort erforderlich" })
  }

  try {
    // Benutzer aus der Datenbank holen
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, name")
      .eq("email", email)
      .maybeSingle()

    if (error) throw error
    if (!user) {
      return res.status(400).json({ error: "Benutzer nicht gefunden" })
    }

    // Passwort prüfen
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: "Falsches Passwort" })
    }

    // Erfolgreich
    return res.status(200).json({
      message: "Login erfolgreich",
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    console.error("Login Error:", err)
    return res.status(500).json({
      error: "Interner Serverfehler",
      details: err.message || err,
    })
  }
}
