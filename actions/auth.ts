"use server";

import { headers as getHeaders } from "next/headers";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignInResult =
  | { success: true }
  | { success: false; error: string };

export type SignUpResult =
  | { success: true }
  | { success: false; error: string };

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<SignUpResult> {
  const input = signUpSchema.safeParse({ email, password, name });

  if (!input.success) {
    return {
      success: false,
      error: "Enter a valid name, email, and password.",
    };
  }

  try {
    const hdrs = await getHeaders();
    const baseURL =
      process.env.BETTER_AUTH_URL ||
      `${hdrs.get("x-forwarded-proto") || "http"}://${hdrs.get("host")}`;

    const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: hdrs.get("cookie") || "",
      },
      body: JSON.stringify(input.data),
      credentials: "include",
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const error = data.error as Record<string, unknown> | undefined;
      if (error && typeof error === "object" && "message" in error) {
        return { success: false, error: String(error.message) };
      }
      return { success: false, error: "Sign up failed" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const input = signInSchema.safeParse({ email, password });

  if (!input.success) {
    return { success: false, error: "Enter a valid email and password." };
  }

  try {
    const hdrs = await getHeaders();
    const baseURL =
      process.env.BETTER_AUTH_URL ||
      `${hdrs.get("x-forwarded-proto") || "http"}://${hdrs.get("host")}`;

    const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: hdrs.get("cookie") || "",
      },
      body: JSON.stringify(input.data),
      credentials: "include",
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const error = data.error as Record<string, unknown> | undefined;
      if (error && typeof error === "object" && "message" in error) {
        return { success: false, error: String(error.message) };
      }
      return { success: false, error: "Sign in failed" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
