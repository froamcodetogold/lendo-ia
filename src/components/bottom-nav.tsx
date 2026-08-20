"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CirclePlus, Trophy, CircleUserRound, LogOut } from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";

const NAV = [
  { href: "/dashboard", label: "Painel", icon: Home },
  { href: "/onboarding", label: "Nova meta", icon: CirclePlus },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: CircleUserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-4xl items-stretch justify-around">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                active ? "text-indigo-600" : "text-neutral-500"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
        <form action={signOutAction} className="flex flex-1">
          <button
            type="submit"
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-neutral-500"
          >
            <LogOut className="size-5" />
            Sair
          </button>
        </form>
      </div>
    </nav>
  );
}
