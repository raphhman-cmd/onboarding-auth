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

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email und Passwort erforderlich" })
  }

  try {
    // Prüfen, ob User schon existiert
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: "Benutzer existiert bereits" })
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10)

    // Neuen Benutzer anlegen
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword, name }])
      .select("id, email, name")
      .single()

    if (error) {
      throw error
    }

    return res.status(201).json({ message: "Benutzer erfolgreich erstellt", user: data })
  } catch (err) {
    console.error("Signup Error:", err)
    return res.status(500).json({ error: "Interner Serverfehler" })
  }
}
