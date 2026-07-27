"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

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
import {
  defaultUtmMediumForChannel,
  defaultUtmSourceForChannel,
  slugifyUtm,
} from "@/lib/utm";

import { QR_CHANNELS } from "@/lib/channels";

import { createQrAction, type CreateQrState } from "./actions";

const initial: CreateQrState = {};

/**
 * Simple create form.
 * Newspaper print → TalentSprint-style UTMs:
 *   utm_source=newspaper_print & utm_medium=print & ...
 */
export default function NewQrPage() {
  const [state, formAction, pending] = useActionState(createQrAction, initial);
  const [showMore, setShowMore] = useState(false);
  const [channel, setChannel] = useState("newspaper");
  const [label, setLabel] = useState("");
  const [campaign, setCampaign] = useState("");
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState(
    "https://dgs.goalkeepers.org.in"
  );

  const preview = useMemo(() => {
    const utm_source = defaultUtmSourceForChannel(channel);
    const utm_medium = defaultUtmMediumForChannel(channel);
    const utm_campaign = campaign
      ? slugifyUtm(campaign)
      : label
        ? slugifyUtm(label)
        : "…";
    const utm_content = location
      ? slugifyUtm(location)
      : label
        ? slugifyUtm(label)
        : "…";
    const base = destination.trim() || "https://dgs.goalkeepers.org.in";
    return { utm_source, utm_medium, utm_campaign, utm_content, base };
  }, [channel, label, campaign, location, destination]);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create QR code
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Newspaper print gets{" "}
            <code className="text-xs">utm_source=newspaper_print</code> +{" "}
            <code className="text-xs">utm_medium=print</code> automatically.
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
            Like TalentSprint newspaper ads: after scan, user lands on your page
            with UTM tags for analytics.
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
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Times of India – full page 27 Jul"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Where is it? *</Label>
              <select
                id="channel"
                name="channel"
                required
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {QR_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationPath">After-scan URL (full)</Label>
              <Input
                id="destinationPath"
                name="destinationPath"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="https://dgs.goalkeepers.org.in"
              />
              <p className="text-xs text-muted-foreground">
                Full site URL is best, e.g.{" "}
                <code className="text-[11px]">
                  https://dgs.goalkeepers.org.in
                </code>
                . Paths like <code className="text-[11px]">/offers/summer</code>{" "}
                still work. UTMs are appended automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign name</Label>
              <Input
                id="campaign"
                name="campaign"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g. newspaper_print_ad_all_users"
              />
              <p className="text-xs text-muted-foreground">
                Becomes <code>utm_campaign</code> (spaces → underscores).
              </p>
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
                  <Label htmlFor="location">Edition / city / content tag</Label>
                  <Input
                    id="location"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. toi_delhi_full_page"
                  />
                  <p className="text-xs text-muted-foreground">
                    Becomes <code>utm_content</code>.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed break-all text-muted-foreground">
              <p className="mb-1 font-sans text-sm font-medium text-foreground">
                After scan, user lands on:
              </p>
              <span className="text-foreground">{preview.base}</span>
              ?utm_source=
              <span className="text-foreground">{preview.utm_source}</span>
              &amp;utm_medium=
              <span className="text-foreground">{preview.utm_medium}</span>
              &amp;utm_campaign=
              <span className="text-foreground">{preview.utm_campaign}</span>
              &amp;utm_content=
              <span className="text-foreground">{preview.utm_content}</span>
            </div>

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
