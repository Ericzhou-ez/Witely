"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { AuthForm } from "@/components/auth-form";
import { LogoGoogle } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import type { LoginActionState } from "../actions";
import { login } from "../actions";
import { SignInWithGoogle } from "../api/auth/callback/google";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  // For email/password login
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    }
  );

  useEffect(() => {
    if (state.status === "failed") {
      toast({
        type: "error",
        description: "Invalid credentials!",
      });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "success") {
      toast({
        type: "success",
        description: "Logged In",
      });
      setIsSuccessful(true);
      // updateSession(); // Update session after successful login
      // router.refresh(); // Refresh the router to update session status on client
      router.push("/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, router.push]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-2xl dark:text-zinc-50">Sign In</h3>
        </div>

        {/* --- Email/Password Form --- */}
        <AuthForm action={handleSubmit} defaultEmail={email} isReg={false}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              href="/register"
            >
              Sign up
            </Link>
            {" for free."}
          </p>
        </AuthForm>

        <div className="flex items-center justify-center px-4 text-gray-500 text-xs sm:px-16">
          <div className="flex-1 border-gray-300 border-t" />
          <p className="mx-2">or</p>
          <div className="flex-1 border-gray-300 border-t" />
        </div>

        <div className="flex flex-col gap-3 px-4 sm:px-16">
          <form action={SignInWithGoogle}>
            <Button
              className="flex w-full items-center gap-2 text-md"
              type="submit"
              variant="outline"
            >
              <div className="h-5 w-5">
                <LogoGoogle />
              </div>
              Sign in with Google
            </Button>
          </form>
          {/* <form action={}>
            <Button
              className="flex w-full items-center gap-2 text-md"
              type="submit"
              variant="outline"
            >
             <MicrosoftIcon className="h-5 w-5" />
              Sign in with Microsoft
            </Button>
          </form> */}
          {/*
          <form action={signInWithApple}>
            <Button
              type="submit"
              variant="outline"
              className="w-full text-md flex items-center gap-2"
            >
              <AppleIcon className="w-5 h-5" />
              Sign in with Apple
            </Button>
          </form>
          */}
        </div>
      </div>
    </div>
  );
}
