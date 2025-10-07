// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "text", placeholder: "demo@site.com" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;

        // Demo-Login – ersetze durch echte Logik
        if (email === "demo@site.com" && password === "test123") {
          return { id: "1", name: "Demo User", email: "demo@site.com" };
        }
        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    },
  },
},

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      if (token?.user) session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

export default NextAuth(authOptions);
