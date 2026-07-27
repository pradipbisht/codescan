"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Admin login</CardTitle>
        <CardDescription>
          Enter the password from <code className="text-xs">ADMIN_PASSWORD</code>{" "}
          in your env. Public QR scans never need this.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Checking…" : "Unlock"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-4">
            Back home
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
