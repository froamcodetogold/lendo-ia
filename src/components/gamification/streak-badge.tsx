export function StreakBadge({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
      🔥 {days} {days === 1 ? "dia" : "dias"} seguidos
    </span>
  );
}
