export type AmountDetails = {
  tip?: Tip | null;
};

export type Tip = {
  amount: number;
};

export type Charges = {
  object: string;
  data: Record<string, unknown>[];
  has_more: boolean;
  total_count: number;
  url: string;
};

export type Metadata = {
  orderId: string;
  type: string;
  userId: string;
  product?: string;
};

export type PaymentMethodOptions = {
  card: Card;
};

export type Card = {
  installments: Record<string, unknown> | null;
  mandate_options: Record<string, unknown> | null;
  network: string | null;
  request_three_d_secure: string;
};

export type LastPaymentError = {
  message: string;
  payment_method: PaymentMethod;
  type: string;
};

export type PaymentMethod = {
  id: string;
  object: string;
  allow_redisplay: string;
  billing_details: Record<string, unknown>;
  card: Record<string, unknown>;
  created: number;
  customer: string | null;
  livemode: boolean;
  metadata: Metadata;
  type: string;
};

// Base type containing all shared fields between success and failed intents
export type BaseIntent = {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_details: AmountDetails;
  amount_received: number;
  application: string | null;
  application_fee_amount: number | null;
  automatic_payment_methods: Record<string, unknown> | null;
  canceled_at: number | null;
  cancellation_reason: string | null;
  capture_method: string;
  charges: Charges;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string;
  description: string | null;
  invoice: string | null;
  livemode: boolean;
  metadata: Metadata;
  next_action: Record<string, unknown> | null;
  on_behalf_of: string | null;
  payment_method_configuration_details: Record<string, unknown> | null;
  payment_method_options: PaymentMethodOptions;
  payment_method_types: string[];
  processing: Record<string, unknown> | null;
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: Record<string, unknown> | null;
  source: Record<string, unknown> | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: Record<string, unknown> | null;
  transfer_group: string | null;
};

// Success intent - extends BaseIntent with non-nullable fields
export type StripeSuccessIntent = BaseIntent & {
  last_payment_error: LastPaymentError | null;
  latest_charge: string;
  payment_method: string;
};

// Failed intent - extends BaseIntent with nullable fields
export type StripeFailedIntent = BaseIntent & {
  last_payment_error: LastPaymentError;
  latest_charge: string | null;
  payment_method: string | null;
};

// Discriminated union for better type safety
export type StripeIntent = StripeSuccessIntent | StripeFailedIntent;

export type StripeCustomer = {
  id: string;
  object: string;
  address: Record<string, unknown> | null;
  balance: number;
  created: number;
  currency: string | null;
  default_source: string | null;
  delinquent: boolean;
  description: string | null;
  discount: Record<string, unknown> | null;
  email: string;
  invoice_prefix: string;
  invoice_settings: InvoiceSettings;
  livemode: boolean;
  metadata: Metadata;
  name: string;
  next_invoice_sequence: number;
  phone: string | null;
  preferred_locales: string[] | null;
  shipping: Record<string, unknown> | null;
  tax_exempt: string;
  test_clock: string | null;
};

export type InvoiceSettings = {
  custom_fields: Record<string, unknown> | null;
  default_payment_method: string | null;
  footer: string | null;
  rendering_options: Record<string, unknown> | null;
};
