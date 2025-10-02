import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@witely.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        const [userRecord] = await getUser(email);

        if (!userRecord) {
          throw new Error("Invalid credentials"); // User not found
        }

        const isPasswordValid = await compare(
          password,
          userRecord.password ?? ""
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials"); // Password incorrect
        }

        return {
          id: userRecord.id.toString(),
          email: userRecord.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      // for Oauth providers
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }

        // check if user exists
        const [existingUser] = await getUser(user.email);

        if (!existingUser) {
          await createUser(
            user.email,
            null,
            user.name ?? "user",
            user.image ?? null
          );
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }

      return session;
    },
  },
});
