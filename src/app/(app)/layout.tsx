import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
          <Link href="/dashboard" className="text-xl font-bold">
            Lendo<span className="text-indigo-600">.IA</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
