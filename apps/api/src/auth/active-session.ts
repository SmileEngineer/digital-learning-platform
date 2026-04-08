import type { NeonQueryFunction } from '@neondatabase/serverless';

let cachedActiveSessionColumn: boolean | null = null;

export async function hasActiveSessionColumn(
  sql: NeonQueryFunction<false, false>
): Promise<boolean> {
  if (cachedActiveSessionColumn !== null) {
    return cachedActiveSessionColumn;
  }

  try {
    const rows = (await sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'active_session_id'
      ) AS exists
    `) as Array<{ exists: boolean }>;

    cachedActiveSessionColumn = rows[0]?.exists === true;
  } catch {
    cachedActiveSessionColumn = false;
  }

  return cachedActiveSessionColumn;
}
