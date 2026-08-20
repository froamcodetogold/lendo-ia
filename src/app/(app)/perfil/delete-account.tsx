"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "./actions";

const CONFIRM_WORD = "EXCLUIR";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-red-600 hover:underline"
      >
        Excluir minha conta
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="text-sm text-red-800">
        Isso apaga sua conta, metas, check-ins e histórico permanentemente. Não tem como
        desfazer. Pra confirmar, digite <strong>{CONFIRM_WORD}</strong> abaixo.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="w-full rounded-lg border border-red-300 px-3 py-2"
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={confirmText !== CONFIRM_WORD || pending}
          onClick={() => startTransition(() => deleteAccount())}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Excluindo..." : "Excluir definitivamente"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
          }}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
