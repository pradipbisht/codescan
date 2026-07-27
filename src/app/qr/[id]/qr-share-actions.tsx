"use client";

import { useState } from "react";
import { Check, Copy, Download, Printer, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  qrDataUrl: string;
  scanUrl: string;
  fileName: string;
  label: string;
};

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function QrShareActions({
  qrDataUrl,
  scanUrl,
  fileName,
  label,
}: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  function flash(message: string) {
    setStatus(message);
    setTimeout(() => setStatus(null), 2200);
  }

  function downloadPng() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    a.click();
    flash("PNG downloaded");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopiedLink(true);
      flash("Link copied");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      flash("Could not copy link");
    }
  }

  async function copyQrImage() {
    try {
      const blob = dataUrlToBlob(qrDataUrl);
      if (typeof ClipboardItem === "undefined") {
        flash("Use Download PNG on this browser");
        return;
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      flash("QR image copied");
    } catch {
      flash("Use Download PNG instead");
    }
  }

  async function shareQrImage() {
    try {
      const name = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
      const blob = dataUrlToBlob(qrDataUrl);
      const file = new File([blob], name, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: label,
          text: `Scan this QR: ${label}`,
        });
        flash("Shared");
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: label, url: scanUrl });
        flash("Shared link");
        return;
      }
      flash("Use Download PNG");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      flash("Share failed");
    }
  }

  function printQr() {
    const win = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=480,height=640"
    );
    if (!win) {
      flash("Allow pop-ups to print");
      return;
    }
    const safe = label.replace(/</g, "&lt;");
    win.document.write(`<!DOCTYPE html><html><head><title>${safe}</title>
      <style>
        body{font-family:system-ui,sans-serif;text-align:center;padding:2rem}
        img{width:320px;height:320px}
        p{color:#555;font-size:14px}
      </style></head><body>
      <h1 style="font-size:18px">${safe}</h1>
      <img src="${qrDataUrl}" alt="QR" />
      <p>Print for posters / pamphlets</p>
      <script>window.onload=function(){window.print()}</script>
      </body></html>`);
    win.document.close();
  }

  return (
    <div className="w-full space-y-3">
      <Button type="button" className="w-full" onClick={downloadPng}>
        <Download className="size-4" />
        Download QR PNG
      </Button>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button type="button" variant="outline" size="sm" onClick={copyQrImage}>
          <Copy className="size-3.5" />
          Image
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={copyLink}>
          {copiedLink ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          Link
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={shareQrImage}>
          <Share2 className="size-3.5" />
          Share
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={printQr}>
          <Printer className="size-3.5" />
          Print
        </Button>
      </div>

      {status ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          {status}
        </p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Share the <strong className="font-medium text-foreground">PNG</strong>{" "}
          for print — not only the link.
        </p>
      )}
    </div>
  );
}
