/**
 * Converte campos vazios (string vazia ou undefined) para null
 * Útil para garantir que campos opcionais sejam salvos como null no banco
 */
export function sanitizeEmptyToNull<T extends object>(data: T): T {
  const sanitized = { ...data } as Record<string, unknown>;

  for (const key in sanitized) {
    const value = sanitized[key];
    // Converte string vazia ou undefined para null
    if (value === '' || value === undefined) {
      sanitized[key] = null;
    }
  }

  return sanitized as T;
}
