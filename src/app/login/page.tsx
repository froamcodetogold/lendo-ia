import { BookOpen, Sparkles } from "lucide-react";
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
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 mb-8 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400 shadow-inner">
            <BookOpen className="size-7" />
          </div>

          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-white">
            Lendo<span className="text-indigo-400">.IA</span>
            <Sparkles className="size-5 animate-pulse text-amber-400" />
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Micro-metas de leitura, quizzes gerados por IA e reforço positivo pra criar o
            hábito.
          </p>

          {ref && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              Você foi convidado por um amigo — bônus de XP pra ele quando você fizer seu
              primeiro check-in de leitura!
            </p>
          )}
        </div>

        <div className="relative z-10 space-y-4">
          <form action={loginWith.bind(null, "google")}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:border-slate-600 hover:bg-slate-700"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.3-.9-.5-1.9-.5-3.2z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"
                />
              </svg>
              Entrar com Google
            </button>
          </form>
          <form action={loginWith.bind(null, "github")}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:border-slate-600 hover:bg-slate-700"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Entrar com GitHub
            </button>
          </form>
        </div>

        <div className="relative z-10 mt-8 text-center text-xs text-slate-500">
          Ao continuar, você concorda com os termos de uso e a política de privacidade da
          plataforma.
        </div>
      </div>

      <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-slate-500">
        O brasileiro lê, em média, 4 vezes menos que o resto do mundo. O Lendo.IA nasceu
        pra tentar virar esse jogo — usando IA e gamificação pra tornar o hábito de ler e
        estudar mais leve e consistente, um check-in de cada vez.
      </p>

      <div className="mt-4 font-mono text-xs text-slate-600">
        From Code to Gold &bull; Lendo.IA Engine
      </div>
    </main>
  );
}
