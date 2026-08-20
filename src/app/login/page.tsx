import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const redirectTo = ref ? `/dashboard?ref=${encodeURIComponent(ref)}` : "/dashboard";

  async function loginWith(provider: "google" | "github") {
    "use server";
    await signIn(provider, { redirectTo });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold">Lendo.IA</h1>
        <p className="mt-2 text-neutral-600">
          Micro-metas de leitura, quiz gerado por IA e reforço positivo pra criar o hábito.
        </p>
        {ref && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Você foi convidado por um amigo — bônus de XP pra ele quando você fizer seu
            primeiro check-in de leitura!
          </p>
        )}

        <div className="mt-8 space-y-3">
          <form action={loginWith.bind(null, "google")}>
            <button
              type="submit"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-medium hover:bg-neutral-50"
            >
              Entrar com Google
            </button>
          </form>
          <form action={loginWith.bind(null, "github")}>
            <button
              type="submit"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-medium hover:bg-neutral-50"
            >
              Entrar com GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
