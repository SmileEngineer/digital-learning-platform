import type { NeonQueryFunction } from '@neondatabase/serverless';

export type UserProfileColumnAvailability = {
  phone: boolean;
  bio: boolean;
  profileImageUrl: boolean;
};

let cachedUserProfileColumns: UserProfileColumnAvailability | null = null;

async function queryUserProfileColumnAvailability(
  sql: NeonQueryFunction<false, false>
): Promise<UserProfileColumnAvailability> {
  try {
    const rows = (await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name IN ('phone', 'bio', 'profile_image_url')
    `) as Array<{ column_name: string }>;

    const available = new Set(rows.map((row) => row.column_name));
    return {
      phone: available.has('phone'),
      bio: available.has('bio'),
      profileImageUrl: available.has('profile_image_url'),
    };
  } catch {
    return { phone: false, bio: false, profileImageUrl: false };
  }
}

export async function getUserProfileColumnAvailability(
  sql: NeonQueryFunction<false, false>,
  options?: { refresh?: boolean }
): Promise<UserProfileColumnAvailability> {
  if (cachedUserProfileColumns && !options?.refresh) {
    return cachedUserProfileColumns;
  }

  cachedUserProfileColumns = await queryUserProfileColumnAvailability(sql);
  return cachedUserProfileColumns;
}

export async function ensureUserProfileColumns(
  sql: NeonQueryFunction<false, false>
): Promise<UserProfileColumnAvailability> {
  const available = await getUserProfileColumnAvailability(sql, { refresh: true });
  if (available.phone && available.bio && available.profileImageUrl) {
    return available;
  }

  try {
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS phone TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS profile_image_url TEXT
    `;
  } catch {
    return available;
  }

  return getUserProfileColumnAvailability(sql, { refresh: true });
}
