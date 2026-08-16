"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../../src/components/auth/client";
import { SignUpForm } from "./sign-up-form";

export function SignUpClientWrapper() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(email: string, password: string, name: string) {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      setIsLoading(false);

      if (result.error) {
        setError(result.error.message || "Sign up failed");
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
    <SignUpForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
  );
}
