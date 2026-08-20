"use client";

import { useState } from "react";

export function ReferralLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/login?ref=${code}` : "";

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={url}
        className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
