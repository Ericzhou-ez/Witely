import { signIn } from "next-auth/react";

export async function SignInWithGoogle() {
  await signIn("google", { redirect: true, redirectTo: "/chat" });
}
