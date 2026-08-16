import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
<<<<<<< HEAD
import { SignInClientWrapper } from "../../../../components/auth/sign-in-client";
=======
import { SignInContainer } from "./sign-in-container";
>>>>>>> origin/main

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <SignInClientWrapper />
    </div>
  );
}
