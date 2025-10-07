// ✅ Diese Schreibweise funktioniert in Render-Umgebung (CommonJS)
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// ⬅️ Variablen: Achte darauf, dass du sie exakt so in Render > Environment einträgst
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "E-Mail und Passwort erforderlich" })
  }

  try {
    // 🟡 1. Prüfen, ob Benutzer bereits existiert
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle()

    if (existingError) throw existingError
    if (existingUser) {
      return res.status(400).json({ error: "Benutzer existiert bereits" })
    }

    // 🟢 2. Passwort sicher hashen
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🟣 3. Benutzer in DB anlegen
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword, name }])
      .select("id, email, name")
      .maybeSingle()

    if (error) throw error

    // 🟢 4. Erfolgreiche Antwort
    return res.status(201).json({
      message: "Benutzer erfolgreich erstellt",
      user: data,
    })
  } catch (err) {
    console.error("Signup Error:", err)
    return res.status(500).json({
      error: "Interner Serverfehler",
      details: err.message || err,
    })
  }
}
