import "server-only";

export async function safeAdminQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[admin:${label}]`, message);
    return fallback;
  }
}
