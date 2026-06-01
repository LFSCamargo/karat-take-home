export type StripeMerchantData = {
  category?: string;
  name?: string;
  network_id?: string;
};

export type StripeIssuingAuthorization = {
  id: string;
  amount: number;
  currency: string;
  approved: boolean;
  status: 'pending' | 'closed' | 'reversed';
  created: number;
  card: string | { id: string };
  cardholder: string | { id: string };
  merchant_data: StripeMerchantData;
};

export type StripeIssuingTransaction = {
  id: string;
  amount: number;
  currency: string;
  type: string;
  created: number;
  card: string | { id: string };
  cardholder: string | { id: string };
  merchant_data: StripeMerchantData;
  authorization?: string | { id: string };
};

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object:
      | StripeIssuingAuthorization
      | StripeIssuingTransaction
      | Record<string, unknown>;
  };
};
