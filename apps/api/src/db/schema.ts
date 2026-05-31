import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';

type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;

export interface CardholdersTable {
  id: Generated<string>;
  external_user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CardsTable {
  id: Generated<string>;
  cardholder_id: string;
  stripe_card_id: string;
  last4: string;
  status: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TransactionsTable {
  id: Generated<string>;
  cardholder_id: string;
  card_id: string;
  stripe_transaction_id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category: string;
  status: string;
  authorized_at: Timestamp | null;
  posted_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AuthorizationsTable {
  id: Generated<string>;
  cardholder_id: string;
  card_id: string;
  stripe_authorization_id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category: string;
  status: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface StripeEventsTable {
  id: Generated<string>;
  stripe_event_id: string;
  event_type: string;
  processed_at: Timestamp | null;
  created_at: Timestamp;
}

export interface SpendCategoryTotalsTable {
  id: Generated<string>;
  cardholder_id: string;
  merchant_category: string;
  amount: number;
  currency: string;
  period_start: Timestamp;
  period_end: Timestamp;
  updated_at: Timestamp;
}

export interface Database {
  cardholders: CardholdersTable;
  cards: CardsTable;
  transactions: TransactionsTable;
  authorizations: AuthorizationsTable;
  stripe_events: StripeEventsTable;
  spend_category_totals: SpendCategoryTotalsTable;
}

export type TransactionRecord = Selectable<TransactionsTable>;
export type NewTransactionRecord = Insertable<TransactionsTable>;
export type TransactionRecordUpdate = Updateable<TransactionsTable>;
