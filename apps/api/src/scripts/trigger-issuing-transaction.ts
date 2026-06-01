/**
 * Create a test Issuing authorization + capture for a Stripe cardholder.
 *
 * Usage:
 *   pnpm stripe:trigger -- ich_xxx
 *   pnpm stripe:trigger -- ich_xxx --amount 2500
 *
 * Requires STRIPE_SECRET_KEY in repo root .env and stripe listen forwarding webhooks.
 */
import { loadEnv } from '../config/load-env.js';
import Stripe from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;
import type { StripeMerchantCategory } from '../modules/stripe/constants/stripe-merchant-categories.js';

loadEnv();

const MERCHANT_SCENARIOS: Array<{
  category: StripeMerchantCategory;
  name: string;
  city: string;
}> = [
  {
    category: 'fast_food_restaurants',
    name: 'Blue Bottle Coffee',
    city: 'San Francisco',
  },
  {
    category: 'taxicabs_limousines',
    name: 'Rocket Rides',
    city: 'San Francisco',
  },
  {
    category: 'travel_agencies_tour_operators',
    name: 'United Airlines',
    city: 'Chicago',
  },
  {
    category: 'eating_places_restaurants',
    name: 'Local Bistro',
    city: 'New York',
  },
  {
    category: 'grocery_stores_supermarkets',
    name: 'Fresh Market',
    city: 'Austin',
  },
  {
    category: 'computer_software_stores',
    name: 'SaaS Tools Inc',
    city: 'Seattle',
  },
  {
    category: 'fuel_dealers_non_automotive',
    name: 'Highway Fuel',
    city: 'Denver',
  },
  {
    category: 'motion_picture_theaters',
    name: 'Cinema Plus',
    city: 'Los Angeles',
  },
  { category: 'department_stores', name: 'Metro Retail', city: 'Boston' },
  { category: 'hardware_stores', name: 'Tech Hardware', city: 'San Francisco' },
  { category: 'health_and_beauty_spas', name: 'Beauty Spa', city: 'New York' },
  {
    category: 'hearing_aids_sales_and_supplies',
    name: 'Audiology Center',
    city: 'Chicago',
  },
  {
    category: 'heating_plumbing_a_c',
    name: 'Plumbing & Heating',
    city: 'Los Angeles',
  },
  { category: 'hobby_toy_and_game_shops', name: 'Toy Store', city: 'Austin' },
  {
    category: 'home_supply_warehouse_stores',
    name: 'Home Depot',
    city: 'San Francisco',
  },
  { category: 'hospitals', name: 'City Hospital', city: 'New York' },
  {
    category: 'hotels_motels_and_resorts',
    name: 'Hotel California',
    city: 'Los Angeles',
  },
  {
    category: 'household_appliance_stores',
    name: 'Appliance Store',
    city: 'San Francisco',
  },
  {
    category: 'industrial_supplies',
    name: 'Industrial Supply',
    city: 'New York',
  },
  {
    category: 'information_retrieval_services',
    name: 'Information Retrieval',
    city: 'Chicago',
  },
  {
    category: 'insurance_default',
    name: 'Insurance Default',
    city: 'Los Angeles',
  },
  {
    category: 'insurance_underwriting_premiums',
    name: 'Insurance Underwriting',
    city: 'Austin',
  },
  {
    category: 'intra_company_purchases',
    name: 'Company Purchases',
    city: 'San Francisco',
  },
  {
    category: 'jewelry_stores_watches_clocks_and_silverware_stores',
    name: 'Jewelry Store',
    city: 'New York',
  },
  { category: 'landscaping_services', name: 'Landscaping', city: 'Chicago' },
  { category: 'laundries', name: 'Laundry', city: 'Los Angeles' },
  {
    category: 'laundry_cleaning_services',
    name: 'Laundry Cleaning',
    city: 'Austin',
  },
  {
    category: 'legal_services_attorneys',
    name: 'Legal Services',
    city: 'San Francisco',
  },
  {
    category: 'luggage_and_leather_goods_stores',
    name: 'Luggage Store',
    city: 'New York',
  },
  {
    category: 'lumber_building_materials_stores',
    name: 'Building Materials',
    city: 'Chicago',
  },
  {
    category: 'manual_cash_disburse',
    name: 'Manual Cash Disburse',
    city: 'Los Angeles',
  },
  {
    category: 'marinas_service_and_supplies',
    name: 'Marina Services',
    city: 'Austin',
  },
  { category: 'marketplaces', name: 'Marketplace', city: 'San Francisco' },
  {
    category: 'masonry_stonework_and_plaster',
    name: 'Masonry',
    city: 'New York',
  },
  { category: 'massage_parlors', name: 'Massage Parlor', city: 'Chicago' },
  {
    category: 'medical_and_dental_labs',
    name: 'Medical Labs',
    city: 'Los Angeles',
  },
  {
    category: 'medical_dental_ophthalmic_and_hospital_equipment_and_supplies',
    name: 'Medical Supplies',
    city: 'Austin',
  },
  {
    category: 'medical_services',
    name: 'Medical Services',
    city: 'San Francisco',
  },
  {
    category: 'membership_organizations',
    name: 'Membership Organization',
    city: 'New York',
  },
  {
    category: 'mens_and_boys_clothing_and_accessories_stores',
    name: 'Clothing Store',
    city: 'Chicago',
  },
  {
    category: 'mens_womens_clothing_stores',
    name: 'Clothing Store',
    city: 'Los Angeles',
  },
  {
    category: 'metal_service_centers',
    name: 'Metal Service Center',
    city: 'Austin',
  },
  {
    category: 'miscellaneous_apparel_and_accessory_shops',
    name: 'Miscellaneous Apparel',
    city: 'San Francisco',
  },
  {
    category: 'miscellaneous_auto_dealers',
    name: 'Miscellaneous Auto Dealer',
    city: 'New York',
  },
  {
    category: 'miscellaneous_business_services',
    name: 'Miscellaneous Business Services',
    city: 'Chicago',
  },
  {
    category: 'miscellaneous_food_stores',
    name: 'Miscellaneous Food Store',
    city: 'Los Angeles',
  },
  {
    category: 'miscellaneous_general_merchandise',
    name: 'Miscellaneous General Merchandise',
    city: 'Austin',
  },
  {
    category: 'miscellaneous_general_services',
    name: 'Miscellaneous General Services',
    city: 'San Francisco',
  },
  {
    category: 'miscellaneous_home_furnishing_specialty_stores',
    name: 'Miscellaneous Home Furnishing',
    city: 'New York',
  },
  {
    category: 'miscellaneous_publishing_and_printing',
    name: 'Miscellaneous Publishing',
    city: 'Chicago',
  },
  {
    category: 'miscellaneous_recreation_services',
    name: 'Miscellaneous Recreation Services',
    city: 'Los Angeles',
  },
  {
    category: 'miscellaneous_repair_shops',
    name: 'Miscellaneous Repair Shops',
    city: 'Austin',
  },
  {
    category: 'miscellaneous_specialty_retail',
    name: 'Miscellaneous Specialty Retail',
    city: 'San Francisco',
  },
  {
    category: 'mobile_home_dealers',
    name: 'Mobile Home Dealer',
    city: 'New York',
  },
  {
    category: 'motion_picture_theaters',
    name: 'Motion Picture Theater',
    city: 'Chicago',
  },
  {
    category: 'motor_freight_carriers_and_trucking',
    name: 'Motor Freight Carrier',
    city: 'Los Angeles',
  },
  {
    category: 'motor_homes_dealers',
    name: 'Motor Home Dealer',
    city: 'Austin',
  },
  {
    category: 'motor_vehicle_supplies_and_new_parts',
    name: 'Motor Vehicle Supplies',
    city: 'San Francisco',
  },
  {
    category: 'motorcycle_shops_and_dealers',
    name: 'Motorcycle Dealer',
    city: 'New York',
  },
  {
    category: 'motorcycle_shops_dealers',
    name: 'Motorcycle Dealer',
    city: 'Chicago',
  },
  {
    category: 'music_stores_musical_instruments_pianos_and_sheet_music',
    name: 'Music Store',
    city: 'Los Angeles',
  },
  {
    category: 'news_dealers_and_newsstands',
    name: 'News Dealer',
    city: 'Austin',
  },
  {
    category: 'non_fi_money_orders',
    name: 'Non-FI Money Order',
    city: 'San Francisco',
  },
  {
    category: 'non_fi_stored_value_card_purchase_load',
    name: 'Non-FI Stored Value Card',
    city: 'New York',
  },
  { category: 'nondurable_goods', name: 'Nondurable Goods', city: 'Chicago' },
  {
    category: 'nurseries_lawn_and_garden_supply_stores',
    name: 'Nursery',
    city: 'Los Angeles',
  },
  {
    category: 'nursing_personal_care',
    name: 'Nursing Personal Care',
    city: 'Austin',
  },
];

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let amountCents: number | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--amount' && argv[i + 1]) {
      amountCents = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg !== '--' && !arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  return {
    cardholderId: positional[0] ?? process.env.STRIPE_CARDHOLDER_ID,
    amountCents,
  };
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomAmountCents(): number {
  return Math.floor(Math.random() * (500 - 10 + 1) + 10) * 100;
}

async function resolveCardId(
  stripe: StripeClient,
  cardholderId: string,
): Promise<string> {
  const listed = await stripe.issuing.cards.list({
    cardholder: cardholderId,
    limit: 1,
  });

  const existing = listed.data[0];
  if (existing) {
    console.log(`Using existing card: ${existing.id}`);
    return existing.id;
  }

  console.log('No card found — creating virtual card...');
  const created = await stripe.issuing.cards.create({
    cardholder: cardholderId,
    type: 'virtual',
    currency: 'usd',
  });

  console.log(`Created card: ${created.id}`);
  return created.id;
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('replace_me')) {
    throw new Error('Set STRIPE_SECRET_KEY in the repo root .env file');
  }

  const { cardholderId, amountCents } = parseArgs(process.argv.slice(2));
  if (!cardholderId) {
    throw new Error(
      'Pass a Stripe cardholder id (ich_...) or set STRIPE_CARDHOLDER_ID in .env',
    );
  }

  const stripe = new Stripe(secretKey);
  const scenario = randomItem(MERCHANT_SCENARIOS);
  const amount = amountCents ?? randomAmountCents();

  console.log(`Cardholder: ${cardholderId}`);
  console.log(
    `Merchant: ${scenario.name} (${scenario.category}) — $${(amount / 100).toFixed(2)}`,
  );

  const cardId = await resolveCardId(stripe, cardholderId);

  // Force capture creates a transaction directly (more reliable than auth → capture,
  // which can fail when the authorization is not left in pending state).
  const transaction =
    await stripe.testHelpers.issuing.transactions.createForceCapture({
      card: cardId,
      amount,
      currency: 'usd',
      merchant_data: {
        name: scenario.name,
        category: scenario.category,
        country: 'US',
        city: scenario.city,
        network_id: '1234567890',
      },
    });

  console.log(`Transaction created: ${transaction.id}`);
  console.log('');
  console.log(
    'Webhooks should hit POST /webhooks/stripe if stripe listen is running.',
  );
  console.log('Then look up your local login UUID:');
  console.log(
    `  docker compose exec db psql -U postgres -d app_db -c "select id from cardholders where external_user_id = '${cardholderId}';"`,
  );
}

main().catch((error) => {
  if (error instanceof Error && 'type' in error) {
    const stripeError = error as Error & { type?: string; code?: string };
    console.error(
      [stripeError.message, stripeError.code, stripeError.type]
        .filter(Boolean)
        .join(' — '),
    );
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
});
