export function XpBar({ xp, label }: { xp: number; label: string }) {
  return (
    <div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold">{xp} XP</p>
    </div>
  );
}
