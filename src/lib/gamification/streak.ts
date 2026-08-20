function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isYesterday(previous: Date, current: Date) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const prevDayStart = Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth(), previous.getUTCDate());
  const currDayStart = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  return currDayStart - prevDayStart === oneDayMs;
}

/**
 * Streak é por usuário, não por meta de leitura: qualquer check-in no dia
 * conta pro streak geral. Chamado sempre que um check-in é criado, antes de
 * saber se é o primeiro do dia — checkInDate já vem normalizado (sem hora).
 */
export function computeStreakUpdate(
  current: { currentStreak: number; longestStreak: number; lastCheckInAt: Date | null },
  checkInDate: Date
) {
  const { lastCheckInAt } = current;

  // Já tinha feito check-in (em qualquer meta) hoje — não mexe no streak.
  if (lastCheckInAt && isSameDay(lastCheckInAt, checkInDate)) {
    return current;
  }

  const newStreak =
    lastCheckInAt && isYesterday(lastCheckInAt, checkInDate) ? current.currentStreak + 1 : 1;

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, current.longestStreak),
    lastCheckInAt: checkInDate,
  };
}
