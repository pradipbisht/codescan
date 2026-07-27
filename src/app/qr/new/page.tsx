"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ArrowLeft, Newspaper } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  defaultUtmMediumForChannel,
  defaultUtmSourceForChannel,
  slugifyUtm,
} from "@/lib/utm";
import { cn } from "@/lib/utils";

import { createQrAction, type CreateQrState } from "./actions";

const initial: CreateQrState = {};

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
    <div className="page-shell min-h-full">
      <SiteHeader active="create" />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-6 -ml-2 gap-1.5 text-muted-foreground"
          )}
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <div className="mb-8 max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create QR code
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One QR per physical placement. Newspaper print auto-sets{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              utm_source=newspaper_print
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              utm_medium=print
            </code>
            .
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Placement details</CardTitle>
              <CardDescription>
                Required: name + channel + where people should land after scan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="label">Name *</Label>
                  <Input
                    id="label"
                    name="label"
                    required
                    autoFocus
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. TOI full page — 27 Jul"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Where is it printed? *</Label>
                  <select
                    id="channel"
                    name="channel"
                    required
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {QR_CHANNELS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationPath">After-scan URL *</Label>
                  <Input
                    id="destinationPath"
                    name="destinationPath"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="https://dgs.goalkeepers.org.in"
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Full https URL preferred. Paths like{" "}
                    <code className="text-[11px]">/offers/summer</code> also
                    work.
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
                    className="h-10"
                  />
                </div>

                <button
                  type="button"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => setShowMore((v) => !v)}
                >
                  {showMore ? "Hide optional fields" : "More options"}
                </button>

                {showMore ? (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                    <Label htmlFor="location">Content / edition tag</Label>
                    <Input
                      id="location"
                      name="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. toi_delhi_full_page"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Becomes <code>utm_content</code>.
                    </p>
                  </div>
                ) : null}

                {state.error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {state.error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-10 w-full"
                >
                  {pending ? "Creating…" : "Create QR code"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="border-border/80 bg-card/90 shadow-sm lg:sticky lg:top-20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Newspaper className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Redirect preview</CardTitle>
                  <CardDescription className="text-xs">
                    What the user hits after scanning
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Placement name
                </p>
                <p className="mt-1 text-sm font-medium">
                  {label.trim() || "Your QR name"}
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-border bg-background/60 p-4 font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
                <span className="text-foreground">{preview.base}</span>
                <br />
                ?utm_source=
                <span className="text-foreground">{preview.utm_source}</span>
                <br />
                &amp;utm_medium=
                <span className="text-foreground">{preview.utm_medium}</span>
                <br />
                &amp;utm_campaign=
                <span className="text-foreground">{preview.utm_campaign}</span>
                <br />
                &amp;utm_content=
                <span className="text-foreground">{preview.utm_content}</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Create on your live domain so phones can open the QR.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Download the PNG from the next screen for print.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Dashboard counts stay live without refresh.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
