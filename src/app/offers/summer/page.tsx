import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}>;

export default async function SummerOfferPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const utm = await searchParams;
  const hasUtm = Boolean(
    utm.utm_source || utm.utm_medium || utm.utm_campaign || utm.utm_content
  );

  return (
    <div className="page-shell min-h-full">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <Card className="border-border/80 bg-card/95 shadow-md">
          <CardHeader>
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" />
              Sample campaign landing
            </p>
            <CardTitle className="text-2xl">Summer Sale 2026</CardTitle>
            <CardDescription className="leading-relaxed">
              Demo destination for QR redirects. Production campaigns usually
              send people to your real site (e.g. dgs.goalkeepers.org.in).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm">
              <p className="font-medium">Up to 30% off selected items</p>
              <p className="mt-1 text-muted-foreground">
                Valid while campaign QR codes are active.
              </p>
            </div>

            {hasUtm ? (
              <div className="space-y-2 rounded-xl border border-border p-4 text-sm">
                <p className="font-medium">You arrived via offline QR</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                  {utm.utm_source ? (
                    <>
                      <dt className="text-muted-foreground">utm_source</dt>
                      <dd className="font-mono">{utm.utm_source}</dd>
                    </>
                  ) : null}
                  {utm.utm_medium ? (
                    <>
                      <dt className="text-muted-foreground">utm_medium</dt>
                      <dd className="font-mono">{utm.utm_medium}</dd>
                    </>
                  ) : null}
                  {utm.utm_campaign ? (
                    <>
                      <dt className="text-muted-foreground">utm_campaign</dt>
                      <dd className="font-mono break-all">{utm.utm_campaign}</dd>
                    </>
                  ) : null}
                  {utm.utm_content ? (
                    <>
                      <dt className="text-muted-foreground">utm_content</dt>
                      <dd className="font-mono break-all">{utm.utm_content}</dd>
                    </>
                  ) : null}
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Open this page via a QR scan to see UTM tags here.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard"
                className={cn(buttonVariants(), "flex-1 justify-center")}
              >
                View dashboard
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex-1 justify-center"
                )}
              >
                Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
