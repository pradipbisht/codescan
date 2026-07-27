"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteQrAction } from "./actions";

export function DeleteQrButton({
  id,
  label,
  variant = "destructive",
  size = "sm",
}: {
  id: string;
  label: string;
  variant?: "destructive" | "outline" | "ghost";
  size?: "sm" | "default" | "xs";
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    const ok = window.confirm(
      `Delete QR “${label}”?\n\nThis cannot be undone. Scan history for this QR will also be removed.\n\nPrinted posters with this QR will stop working.`
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteQrAction(id);
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={onDelete}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
