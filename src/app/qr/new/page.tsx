"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

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

import { createQrAction, type CreateQrState } from "./actions";

const initial: CreateQrState = {};

const CHANNELS = [
  "hoarding",
  "poster",
  "pamphlet",
  "flyer",
  "other",
] as const;

/**
 * Simple create form: only Label + Channel required.
 * Everything else is optional under "More options".
 * UTMs auto-fill on the server.
 */
export default function NewQrPage() {
  const [state, formAction, pending] = useActionState(createQrAction, initial);
  const [showMore, setShowMore] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create QR code
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Only a name and channel are required. Rest is automatic.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New placement</CardTitle>
          <CardDescription>
            Example: “Mall poster – Gate 2”. Scanners go to /offers/summer with
            UTMs filled for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Name *</Label>
              <Input
                id="label"
                name="label"
                required
                autoFocus
                placeholder="e.g. Poster – Mall Gate 2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Where is it? *</Label>
              <select
                id="channel"
                name="channel"
                required
                defaultValue="poster"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setShowMore((v) => !v)}
            >
              {showMore ? "Hide options" : "More options (optional)"}
            </button>

            {showMore ? (
              <div className="space-y-4 rounded-lg border border-border p-3">
                <div className="space-y-2">
                  <Label htmlFor="location">City / place</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Andheri, Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign name</Label>
                  <Input
                    id="campaign"
                    name="campaign"
                    placeholder="Summer Sale 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationPath">After-scan page</Label>
                  <Input
                    id="destinationPath"
                    name="destinationPath"
                    defaultValue="/offers/summer"
                    placeholder="/offers/summer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Path on this site only (starts with /).
                  </p>
                </div>
              </div>
            ) : (
              // Hidden defaults so form still submits them when collapsed
              <>
                <input type="hidden" name="destinationPath" value="/offers/summer" />
              </>
            )}

            {/* UTM always auto on server — no need for user to type */}
            <input type="hidden" name="utmMedium" value="offline" />

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Creating…" : "Create QR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
