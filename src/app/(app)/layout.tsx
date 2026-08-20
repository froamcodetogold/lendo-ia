import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-4xl font-extrabold tracking-tight"
          >
            Lendo<span className="text-indigo-600">.IA</span>
            <Sparkles className="size-7 text-amber-500" />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
