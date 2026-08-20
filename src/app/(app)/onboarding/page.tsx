import { OnboardingForm } from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Escolha seu próximo livro</h1>
      <p className="mt-1 text-neutral-600">
        Busque o livro, diga quantos dias você tem, e a gente calcula sua meta diária.
      </p>
      <div className="mt-6">
        <OnboardingForm />
      </div>
    </div>
  );
}
