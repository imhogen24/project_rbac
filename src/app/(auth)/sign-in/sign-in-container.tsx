"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/components/auth/sign-in-client";
import { SignInForm } from "@/components/auth/sign-in-form";

export function SignInContainer() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn(email: string, password: string) {
    setIsLoading(true);
    setError(undefined);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message || "Failed to sign in. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <SignInForm onSubmit={handleSignIn} error={error} isLoading={isLoading} />
  );
}
