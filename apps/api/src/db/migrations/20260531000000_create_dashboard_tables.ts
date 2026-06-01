import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('cardholders')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('external_user_id', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('cardholders_external_user_id_unique')
    .on('cardholders')
    .column('external_user_id')
    .unique()
    .execute();

  await db.schema
    .createTable('cards')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('cardholder_id', 'uuid', (col) =>
      col.notNull().references('cardholders.id').onDelete('cascade'),
    )
    .addColumn('stripe_card_id', 'text', (col) => col.notNull())
    .addColumn('last4', 'varchar(4)', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('cards_stripe_card_id_unique')
    .on('cards')
    .column('stripe_card_id')
    .unique()
    .execute();

  await db.schema
    .createIndex('cards_cardholder_id_idx')
    .on('cards')
    .column('cardholder_id')
    .execute();

  await db.schema
    .createTable('transactions')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('cardholder_id', 'uuid', (col) =>
      col.notNull().references('cardholders.id').onDelete('cascade'),
    )
    .addColumn('card_id', 'uuid', (col) =>
      col.notNull().references('cards.id').onDelete('cascade'),
    )
    .addColumn('stripe_transaction_id', 'text', (col) => col.notNull())
    .addColumn('amount', 'bigint', (col) => col.notNull())
    .addColumn('currency', 'varchar(3)', (col) => col.notNull())
    .addColumn('merchant_name', 'text', (col) => col.notNull())
    .addColumn('merchant_category', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('authorized_at', 'timestamptz')
    .addColumn('posted_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('transactions_stripe_transaction_id_unique')
    .on('transactions')
    .column('stripe_transaction_id')
    .unique()
    .execute();

  await db.schema
    .createIndex('transactions_cardholder_id_posted_at_idx')
    .on('transactions')
    .columns(['cardholder_id', 'posted_at'])
    .execute();

  await db.schema
    .createIndex('transactions_cardholder_id_merchant_category_idx')
    .on('transactions')
    .columns(['cardholder_id', 'merchant_category'])
    .execute();

  await db.schema
    .createTable('authorizations')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('cardholder_id', 'uuid', (col) =>
      col.notNull().references('cardholders.id').onDelete('cascade'),
    )
    .addColumn('card_id', 'uuid', (col) =>
      col.notNull().references('cards.id').onDelete('cascade'),
    )
    .addColumn('stripe_authorization_id', 'text', (col) => col.notNull())
    .addColumn('amount', 'bigint', (col) => col.notNull())
    .addColumn('currency', 'varchar(3)', (col) => col.notNull())
    .addColumn('merchant_name', 'text', (col) => col.notNull())
    .addColumn('merchant_category', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('authorizations_stripe_authorization_id_unique')
    .on('authorizations')
    .column('stripe_authorization_id')
    .unique()
    .execute();

  await db.schema
    .createIndex('authorizations_cardholder_id_idx')
    .on('authorizations')
    .column('cardholder_id')
    .execute();

  await db.schema
    .createTable('stripe_events')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('stripe_event_id', 'text', (col) => col.notNull())
    .addColumn('event_type', 'text', (col) => col.notNull())
    .addColumn('processed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('stripe_events_stripe_event_id_unique')
    .on('stripe_events')
    .column('stripe_event_id')
    .unique()
    .execute();

  await db.schema
    .createIndex('stripe_events_processed_at_idx')
    .on('stripe_events')
    .column('processed_at')
    .execute();

  await db.schema
    .createTable('spend_category_totals')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('cardholder_id', 'uuid', (col) =>
      col.notNull().references('cardholders.id').onDelete('cascade'),
    )
    .addColumn('merchant_category', 'text', (col) => col.notNull())
    .addColumn('amount', 'bigint', (col) => col.notNull())
    .addColumn('currency', 'varchar(3)', (col) => col.notNull())
    .addColumn('period_start', 'timestamptz', (col) => col.notNull())
    .addColumn('period_end', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('spend_category_totals_cardholder_period_category_unique')
    .on('spend_category_totals')
    .columns(['cardholder_id', 'merchant_category', 'period_start', 'period_end'])
    .unique()
    .execute();

  await db.schema
    .createIndex('spend_category_totals_cardholder_id_idx')
    .on('spend_category_totals')
    .column('cardholder_id')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('spend_category_totals').execute();
  await db.schema.dropTable('stripe_events').execute();
  await db.schema.dropTable('authorizations').execute();
  await db.schema.dropTable('transactions').execute();
  await db.schema.dropTable('cards').execute();
  await db.schema.dropTable('cardholders').execute();
}
