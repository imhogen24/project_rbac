"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../../src/components/auth/client";
import { SignInForm } from "./sign-in-form";

export function SignInClientWrapper() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(email: string, password: string) {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      setIsLoading(false);

      if (result.error) {
        setError(result.error.message || "Sign in failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <SignInForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
  );
}
