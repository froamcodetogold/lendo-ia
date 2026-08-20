"use client";

import { useActionState, useState } from "react";
import type { XpLabel } from "@prisma/client";
import { XP_LABEL_OPTIONS } from "@/lib/xp-label";
import { updateProfile } from "./actions";

type Props = {
  name: string;
  bio: string;
  image: string;
  xpLabel: XpLabel;
};

export function ProfileEditForm({ name, bio, image, xpLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      const result = await updateProfile(formData);
      if (!result.error) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        Editar perfil
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
    >
      <label className="block">
        <span className="text-sm font-medium">Nome</span>
        <input
          name="name"
          defaultValue={name}
          required
          maxLength={80}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio}
          maxLength={280}
          rows={3}
          placeholder="Conte um pouco sobre você e o que gosta de ler..."
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Foto (URL da imagem)</span>
        <input
          name="image"
          type="url"
          defaultValue={image}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Como chamar seu XP</span>
        <select
          name="xpLabel"
          defaultValue={xpLabel}
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2"
        >
          {XP_LABEL_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
