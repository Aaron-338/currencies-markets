// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // call your backend API
        const res = await fetch("'${backendUrl}'/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password
          })
        })

        const user = await res.json()

        if (res.ok && user) {
          return user
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login", // optional custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// 👇 Important: export both GET and POST
export { handler as GET, handler as POST }
