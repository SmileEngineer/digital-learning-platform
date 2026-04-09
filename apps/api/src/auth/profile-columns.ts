import type { NeonQueryFunction } from '@neondatabase/serverless';

let cachedUserProfileColumns: { bio: boolean; profileImageUrl: boolean } | null = null;

export async function getUserProfileColumnAvailability(
  sql: NeonQueryFunction<false, false>
): Promise<{ bio: boolean; profileImageUrl: boolean }> {
  if (cachedUserProfileColumns) {
    return cachedUserProfileColumns;
  }

  try {
    const rows = (await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name IN ('bio', 'profile_image_url')
    `) as Array<{ column_name: string }>;

    const available = new Set(rows.map((row) => row.column_name));
    cachedUserProfileColumns = {
      bio: available.has('bio'),
      profileImageUrl: available.has('profile_image_url'),
    };
  } catch {
    cachedUserProfileColumns = { bio: false, profileImageUrl: false };
  }

  return cachedUserProfileColumns;
}
