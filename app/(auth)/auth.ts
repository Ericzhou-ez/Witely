import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "plus" | "pro" | "ultra" | "dev" | "free";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
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
          placeholder: "example@witely.ai",
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
          type: userRecord.type,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user?.email) {
        return false;
      }

      const [existingUser] = await getUser(user.email);
  
      // for Oauth providers
      if (account?.provider === "google") {
        if (existingUser) {
          user.id = existingUser.id;
          user.type = existingUser.type;
        } else {
          const newUser = await createUser({
            email: user.email,
            password: null,
            name: user.name ?? "user",
            profileURL: user.image ?? null,
          });
          // Set the ID and type for the newly created user
          user.id = newUser.id;
          user.type = newUser.type;
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
