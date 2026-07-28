import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Link2,
  Newspaper,
  QrCode,
  Sparkles,
} from "lucide-react";

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

export default function Home() {
  return (
    <div className="page-shell flex min-h-full flex-1 flex-col">
      <SiteHeader active="home" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12 sm:py-16">
        {/* Hero */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-primary" />
              Offline print → online attribution
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Track which newspaper, poster, or pamphlet actually worked
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create a unique QR per placement. When someone scans, your
              dashboard counts that asset — with UTMs for marketing tools and
              live scan numbers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/qr/new"
                className={cn(buttonVariants({ size: "lg" }), "shadow-sm")}
              >
                Create a QR code
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Open dashboard
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Tip: set{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                NEXT_PUBLIC_APP_URL
              </code>{" "}
              to your custom domain so printed QRs never show a *.vercel.app
              link.
            </p>
          </div>

          {/* Preview panel */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-sky-500/10 blur-2xl" />
            <Card className="glass-card relative overflow-hidden border-border/80 shadow-lg">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Newspaper className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">Newspaper ad</CardTitle>
                    <CardDescription className="text-xs">
                      Example placement card
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Scans
                    </p>
                    <p className="text-3xl font-semibold tabular-nums">128</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>utm_source</p>
                    <p className="font-mono text-foreground">newspaper_print</p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-border px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  https://dgs.goalkeepers.org.in
                  <br />
                  ?utm_source=newspaper_print
                  <br />
                  &amp;utm_medium=print
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Active
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                    Live counts
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Steps */}
        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: QrCode,
              title: "1. Create",
              body: "Name, channel, full after-scan URL. UTMs fill in for print.",
              href: "/qr/new",
              cta: "New QR",
            },
            {
              icon: Link2,
              title: "2. Print & share",
              body: "Download the PNG for newspaper, poster, or pamphlet.",
              href: "/dashboard",
              cta: "Your QRs",
            },
            {
              icon: BarChart3,
              title: "3. Measure",
              body: "Live scan counts per placement — no full page refresh.",
              href: "/dashboard",
              cta: "Dashboard",
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="border-border/80 bg-card/90 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {item.body}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {item.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/80 py-5 text-center text-xs text-muted-foreground">
        CodeScan · print · scan · measure
      </footer>
    </div>
  );
}
