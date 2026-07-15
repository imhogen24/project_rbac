"use client";

import { useState } from "react";

type SignInFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
  isLoading?: boolean;
};

export default function SignInForm({
  onSubmit,
  error,
  isLoading = false,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    await onSubmit(email, password);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-background p-6"
    >
      <h1 className="text-xl font-semibold text-foreground">Sign in</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}