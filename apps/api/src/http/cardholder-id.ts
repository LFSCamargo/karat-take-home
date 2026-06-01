import type { Kysely } from 'kysely';

import type { Database } from '../db/schema';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isStripeCardholderId(value: string): boolean {
  return value.startsWith('ich_');
}

export async function resolveCardholderDbId(
  db: Kysely<Database>,
  identifier: string,
): Promise<string | undefined> {
  if (isUuid(identifier)) {
    return identifier;
  }

  if (isStripeCardholderId(identifier)) {
    const row = await db
      .selectFrom('cardholders')
      .select('id')
      .where('external_user_id', '=', identifier)
      .executeTakeFirst();

    return row?.id;
  }

  return undefined;
}
