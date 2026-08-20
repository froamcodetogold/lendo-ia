/** XP base por check-in + bônus por acerto no quiz (0 a 3 acertos). */
const BASE_XP_PER_CHECKIN = 10;
const XP_PER_CORRECT_ANSWER = 15;
export const REFERRAL_BONUS_XP = 50;

export function calculateCheckInXp(quizScore: number) {
  return BASE_XP_PER_CHECKIN + quizScore * XP_PER_CORRECT_ANSWER;
}
