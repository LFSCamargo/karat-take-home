import { type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('cardholders')
    .addColumn('display_name', 'text')
    .addColumn('email', 'text')
    .addColumn('phone_number', 'text')
    .addColumn('status', 'text')
    .addColumn('profile_synced_at', 'timestamptz')
    .execute();

  await db.schema.alterTable('cards').addColumn('brand', 'text').execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('cards').dropColumn('brand').execute();

  await db.schema
    .alterTable('cardholders')
    .dropColumn('profile_synced_at')
    .dropColumn('status')
    .dropColumn('phone_number')
    .dropColumn('email')
    .dropColumn('display_name')
    .execute();
}
