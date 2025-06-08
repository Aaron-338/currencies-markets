import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// TODO: Replace with your actual database adapter and client if you're storing users
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@/lib/prisma"; // Assuming your Prisma client is at lib/prisma.ts

export const authOptions: AuthOptions = {
  // TODO: Configure a database adapter if you want to persist users
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // TODO: Implement your user lookup and password verification logic here.
        // 1. Find user in your database by credentials.email.
        // 2. If user found, compare credentials.password with the stored hashed password (e.g., using bcrypt.compare).
        // 3. If valid, return user object (must include at least `id`, `name`, `email`). DO NOT return password hash.
        // 4. If invalid, return null or throw an Error.

        // Placeholder logic (REMOVE THIS IN PRODUCTION):
        console.log("Attempting to authorize:", credentials?.email);
        if (credentials?.email === "user@example.com" && credentials?.password === "password123") {
          console.log("Placeholder authorization successful for user@example.com");
          return { id: "1", name: "Test User", email: "user@example.com" }; // Example user object
        }
        if (credentials?.email === "admin@example.com" && credentials?.password === "adminpass") {
          console.log("Placeholder authorization successful for admin@example.com");
          return { id: "2", name: "Admin User", email: "admin@example.com", role: "admin" }; // Example admin user object
        }
        
        console.log("Placeholder authorization failed for:", credentials?.email);
        return null;
      }
    })
    // TODO: Add other providers if needed (e.g., Google, GitHub)
    // GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  ],
  session: {
    strategy: "jwt", // Using JWTs for session management
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // Persist the user id and role (if exists) to the JWT token
      if (user) {
        token.id = user.id;
        if ((user as any).role) { // Cast user to any to access potential role property
            token.role = (user as any).role;
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like user id and role from the token
      if (session.user) {
        session.user.id = token.id as string;
        if (token.role) {
            (session.user as any).role = token.role; // Cast session.user to any to add role
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login', // Redirect users to this page for login
    // error: '/auth/error', // Error page (e.g., /auth/error?error=CredentialsSignin)
    // signOut: '/auth/logout',
    // verifyRequest: '/auth/verify-request', // For email/magic link verification
    // newUser: '/auth/register' // Optional: redirect new users (e.g. after OAuth signup) to a registration completion page
  },
  // debug: process.env.NODE_ENV === 'development', // Enable debug messages in development
  // secret: process.env.NEXTAUTH_SECRET, // IMPORTANT: Set this in .env.local for production!
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
