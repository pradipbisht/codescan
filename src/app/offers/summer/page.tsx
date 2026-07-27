import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}>;

/**
 * Sample marketing landing page.
 * After scanning a QR, users are redirected here with UTM query params
 * so analytics tools (and this page) can show offline attribution.
 */
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
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sample campaign landing
          </p>
          <CardTitle className="text-2xl">Summer Sale 2026</CardTitle>
          <CardDescription>
            This is a demo destination for QR redirects. In production you would
            put your real offer, form, or product page here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm">
            <p className="font-medium">Up to 30% off selected items</p>
            <p className="mt-1 text-muted-foreground">
              Valid while campaign QR codes are active.
            </p>
          </div>

          {hasUtm ? (
            <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">You arrived via offline QR</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
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
                    <dd className="font-mono">{utm.utm_campaign}</dd>
                  </>
                ) : null}
                {utm.utm_content ? (
                  <>
                    <dt className="text-muted-foreground">utm_content</dt>
                    <dd className="font-mono">{utm.utm_content}</dd>
                  </>
                ) : null}
              </dl>
              <p className="text-xs text-muted-foreground">
                Your CodeScan database also recorded which physical QR was used.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Open this page via a QR scan to see UTM attribution tags here.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" render={<Link href="/dashboard" />}>
              View dashboard
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              render={<Link href="/" />}
            >
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
