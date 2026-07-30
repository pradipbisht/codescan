import { SiteHeader } from "@/components/site-header";

import { NewQrForm } from "./new-form";

export const dynamic = "force-dynamic";

/**
 * Server page: SiteHeader uses cookies() via admin auth.
 * Form is a client component — must not import server-only modules.
 */
export default function NewQrPage() {
  return (
    <div className="page-shell min-h-full">
      <SiteHeader active="create" />
      <NewQrForm />
    </div>
  );
}
