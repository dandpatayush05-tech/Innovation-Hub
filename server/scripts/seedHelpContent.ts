import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const articles = [
  // CANCELLATION POLICY
  {
    category_slug: 'cancellation-policy',
    type: 'policy_section',
    title: 'Free Cancellation Window',
    content: 'You may cancel any booking up to **24 hours before** the scheduled check-in or departure time to receive a full refund. No questions asked.',
    display_order: 10
  },
  {
    category_slug: 'cancellation-policy',
    type: 'policy_section',
    title: 'Tiered Cancellation Fees',
    content: 'For cancellations made within the 24-hour window, the following tiered fees apply:\n- **Between 24h and 12h:** 50% refund.\n- **Under 12h:** 0% refund (Non-refundable).',
    display_order: 20
  },
  {
    category_slug: 'cancellation-policy',
    type: 'policy_section',
    title: 'Third-Party Provider Policies',
    content: 'Some hotels, flights, and tours are operated by third parties (e.g. external airlines). In these cases, the **provider’s specific cancellation policy** supersedes our standard terms. You will be notified of these terms at the time of checkout.',
    display_order: 30
  },
  {
    category_slug: 'cancellation-policy',
    type: 'policy_section',
    title: 'Non-Refundable Bookings',
    content: 'Certain heavily discounted promotional bookings may be marked explicitly as **Non-Refundable** at checkout. These cannot be cancelled or modified for a refund under any circumstances.',
    display_order: 40
  },

  // REFUND POLICY
  {
    category_slug: 'refund-policy',
    type: 'policy_section',
    title: 'Refund Destination',
    content: 'All eligible refunds are strictly routed back to the **original payment method** used during the transaction. We cannot issue refunds to alternate bank accounts or cards.',
    display_order: 10
  },
  {
    category_slug: 'refund-policy',
    type: 'policy_section',
    title: 'Processing Timeline',
    content: 'Please allow **5–7 business days** for the refunded amount to reflect in your bank account or credit card statement, depending on your financial institution.',
    display_order: 20
  },
  {
    category_slug: 'refund-policy',
    type: 'policy_section',
    title: 'Partial Trip Refunds',
    content: 'If you cancel a specific leg of a bundled trip (e.g., cancelling just the return bus ticket while keeping the hotel), your refund will only be processed for that **individual leg’s amount**, not the entire bundle.',
    display_order: 30
  },

  // PAYMENT POLICY
  {
    category_slug: 'payment-policy',
    type: 'policy_section',
    title: 'Accepted Methods & Currency',
    content: 'We process all transactions securely through **Razorpay**. We accept all major Credit/Debit Cards, UPI, Net Banking, and select Wallets. All transactions are billed in **INR (Indian Rupee)**.',
    display_order: 10
  },
  {
    category_slug: 'payment-policy',
    type: 'policy_section',
    title: 'Failed Payments',
    content: 'If a payment fails during checkout, your account will not be charged, and the **booking will remain unconfirmed**. You will receive an SMS notification of the failure, and you can securely retry the payment from your dashboard.',
    display_order: 20
  },

  // BOOKING RULES
  {
    category_slug: 'booking-rules',
    type: 'policy_section',
    title: 'Identity Verification',
    content: 'A valid **government-issued ID proof** (Aadhar, PAN, Passport, or Driving License) matching the primary booker’s name is mandatory for hotel check-ins and flight boarding.',
    display_order: 10
  },

  // TERMS AND CONDITIONS
  {
    category_slug: 'terms-and-conditions',
    type: 'static_page',
    title: 'Terms & Conditions',
    content: '> **Note:** This is a draft placeholder for demonstration purposes.\n\nBy using Innovation Hub Tour, you agree to our standard operating terms. We facilitate bookings between travelers and service providers. Our liability is limited to the successful transaction of your booking. We are not liable for delays, cancellations, or damages caused directly by third-party transport or accommodation providers.',
    display_order: 10
  },

  // PRIVACY POLICY
  {
    category_slug: 'privacy-policy',
    type: 'static_page',
    title: 'Privacy Policy',
    content: '> **Note:** This is a draft placeholder for demonstration purposes.\n\nWe collect basic personal information including your name, email, and phone number to facilitate bookings and notifications. Payment metadata is securely processed via **Razorpay**; we do not store your raw credit card data on our servers. Your data may be shared with third parties (like hotels or SMS gateways like Twilio) strictly for fulfilling your itinerary.',
    display_order: 10
  },

  // FAQ
  {
    category_slug: 'faq',
    type: 'faq_item',
    question: 'Can I cancel a booking?',
    content: 'Yes! Please review our **Cancellation Policy** section for exact windows and refund tiers. You can cancel directly from your Dashboard under "Upcoming Experiences".',
    display_order: 10
  },
  {
    category_slug: 'faq',
    type: 'faq_item',
    question: 'What happens if my flight is delayed?',
    content: 'We do not currently support live flight tracking. Please monitor your airline’s official status updates directly.',
    display_order: 20
  },
  {
    category_slug: 'faq',
    type: 'faq_item',
    question: 'How are taxi/auto fares calculated?',
    content: 'Auto and Taxi fares are dynamically generated using a transparent formula: a standard **base fare** plus a **per-km rate** multiplied by the route distance calculated via map routing.',
    display_order: 30
  },
  {
    category_slug: 'faq',
    type: 'faq_item',
    question: 'What happens if a payment fails?',
    content: 'If your payment fails at checkout, the booking is automatically marked as failed and no amount is deducted. You will instantly receive an SMS notification and can retry the payment.',
    display_order: 40
  },
  {
    category_slug: 'faq',
    type: 'faq_item',
    question: 'How are refunds processed?',
    content: 'Refunds are automatically issued to your original payment method via Razorpay. It typically takes 5-7 business days to reflect on your statement.',
    display_order: 50
  }
];

async function seed() {
  console.log('Seeding Help Center content...');
  
  // Get all categories to map slugs to IDs
  const { data: categories, error: catError } = await supabase.from('help_categories').select('id, slug');
  if (catError) {
    console.error('Failed to fetch categories:', catError);
    process.exit(1);
  }

  const slugToId = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {} as Record<string, string>);

  for (const article of articles) {
    const category_id = slugToId[article.category_slug];
    if (!category_id) {
      console.warn(`Category slug not found: ${article.category_slug}`);
      continue;
    }

    const { error } = await supabase.from('help_articles').insert({
      category_id,
      type: article.type,
      question: article.question,
      title: article.title,
      content: article.content,
      display_order: article.display_order,
      is_published: true
    });

    if (error) {
      console.error(`Failed to insert article: ${article.title || article.question}`, error);
    } else {
      console.log(`Inserted: ${article.title || article.question}`);
    }
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
