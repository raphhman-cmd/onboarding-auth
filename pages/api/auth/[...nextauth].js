import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "text", placeholder: "demo@site.com" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        // 👉 Beispiel: Dummy-Login (ersetze durch echte Logik)
        if (
          credentials.email === "demo@site.com" &&
          credentials.password === "test123"
        ) {
          return { id: "1", name: "Demo User", email: "demo@site.com" }
        }
        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/api/auth/signin"
  },
  secret: process.env.AUTH_SECRET || "changeme"
}

export default NextAuth(authOptions)
