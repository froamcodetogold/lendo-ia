"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Roda 1x no primeiro carregamento pós-login; se tiver ?ref=CODE na URL,
 * registra o vínculo de indicação e limpa a URL. Sem efeito se já reivindicado. */
export function ClaimReferral() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref) return;
    fetch("/api/referral/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: ref }),
    }).finally(() => {
      router.replace("/dashboard");
    });
  }, [ref, router]);

  return null;
}
