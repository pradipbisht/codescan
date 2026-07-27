"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  /** data:image/png;base64,... */
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

  function flash(message: string) {
    setStatus(message);
    setTimeout(() => setStatus(null), 2000);
  }

  function downloadPng() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    a.click();
    flash("PNG downloaded — print or send this image");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(scanUrl);
      flash("Link copied");
    } catch {
      flash("Could not copy link");
    }
  }

  async function copyQrImage() {
    try {
      const blob = dataUrlToBlob(qrDataUrl);
      if (typeof ClipboardItem === "undefined") {
        flash("Copy image not supported here — use Download PNG");
        return;
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      flash("QR image copied — paste into WhatsApp / email / Canva");
    } catch {
      flash("Copy image failed — use Download PNG instead");
    }
  }

  async function shareQrImage() {
    try {
      const blob = dataUrlToBlob(qrDataUrl);
      const file = new File([blob], fileName.endsWith(".png") ? fileName : `${fileName}.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: label,
          text: `Scan this QR: ${label}`,
        });
        flash("Shared QR image");
        return;
      }

      // Fallback: share link only if file share unsupported
      if (navigator.share) {
        await navigator.share({
          title: label,
          text: `QR for ${label}`,
          url: scanUrl,
        });
        flash("Shared link (this device cannot attach the QR image)");
        return;
      }

      flash("Share not available — use Download PNG");
    } catch (err) {
      // User cancelled share sheet
      if (err instanceof Error && err.name === "AbortError") return;
      flash("Share failed — use Download PNG");
    }
  }

  function printQr() {
    const win = window.open("", "_blank", "noopener,noreferrer,width=480,height=640");
    if (!win) {
      flash("Pop-up blocked — allow pop-ups or Download PNG");
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head><title>${label}</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
        img { width: 320px; height: 320px; }
        p { color: #444; font-size: 14px; }
      </style></head><body>
      <h1 style="font-size:18px">${label.replace(/</g, "&lt;")}</h1>
      <img src="${qrDataUrl}" alt="QR" />
      <p>Print this page for posters / pamphlets</p>
      <script>window.onload=function(){window.print();}</script>
      </body></html>`);
    win.document.close();
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-center text-xs text-muted-foreground">
        For print/WhatsApp you need the <strong>QR image</strong>, not only the
        link.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" onClick={downloadPng}>
          Download QR PNG
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copyQrImage}>
          Copy QR image
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={shareQrImage}>
          Share QR image
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={printQr}>
          Print QR
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={copyLink}>
          Copy link only
        </Button>
      </div>
      {status ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
