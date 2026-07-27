"use client";

import Link from "next/link";
import { useActionState } from "react";

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
import { QR_CHANNELS } from "@/lib/channels";

import { updateQrAction, type UpdateQrState } from "../actions";
import { DeleteQrButton } from "../delete-button";

export type EditQrInitial = {
  id: string;
  label: string;
  channel: string;
  location: string | null;
  campaign: string | null;
  destinationPath: string;
  isActive: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  token: string;
};

const initial: UpdateQrState = {};

export function EditQrForm({ qr }: { qr: EditQrInitial }) {
  const boundUpdate = updateQrAction.bind(null, qr.id);
  const [state, formAction, pending] = useActionState(boundUpdate, initial);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit QR</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Token stays the same — printed QR images keep working. Changing
            destination/UTMs only affects the after-scan redirect.
          </p>
        </div>
        <Button variant="outline" render={<Link href={`/qr/${qr.id}`} />}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{qr.label}</CardTitle>
          <CardDescription className="font-mono text-xs break-all">
            token: {qr.token}
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
                defaultValue={qr.label}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel *</Label>
              <select
                id="channel"
                name="channel"
                required
                defaultValue={qr.channel}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {QR_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
                {!QR_CHANNELS.some((c) => c.value === qr.channel) ? (
                  <option value={qr.channel}>{qr.channel}</option>
                ) : null}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                name="campaign"
                defaultValue={qr.campaign ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / content tag</Label>
              <Input
                id="location"
                name="location"
                defaultValue={qr.location ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationPath">After-scan path</Label>
              <Input
                id="destinationPath"
                name="destinationPath"
                defaultValue={qr.destinationPath}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="utmSource">utm_source</Label>
                <Input
                  id="utmSource"
                  name="utmSource"
                  defaultValue={qr.utmSource ?? ""}
                  placeholder="auto if empty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmMedium">utm_medium</Label>
                <Input
                  id="utmMedium"
                  name="utmMedium"
                  defaultValue={qr.utmMedium ?? ""}
                  placeholder="auto if empty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmCampaign">utm_campaign</Label>
                <Input
                  id="utmCampaign"
                  name="utmCampaign"
                  defaultValue={qr.utmCampaign ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utmContent">utm_content</Label>
                <Input
                  id="utmContent"
                  name="utmContent"
                  defaultValue={qr.utmContent ?? ""}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={qr.isActive}
                className="size-4 rounded border-input"
              />
              Active (can be scanned)
            </label>

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-xs text-muted-foreground">
              Danger zone — deletes this QR and its scan history.
            </p>
            <DeleteQrButton id={qr.id} label={qr.label} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
