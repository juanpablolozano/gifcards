export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export function getPasswordStrength(password: string): {
  level: PasswordStrengthLevel;
  score: number;
} {
  if (!password) {
    return { level: "weak", score: 0 };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { level: "weak", score: 1 };
  if (score === 2) return { level: "fair", score: 2 };
  if (score === 3) return { level: "good", score: 3 };
  return { level: "strong", score: 4 };
}
