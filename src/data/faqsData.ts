export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  popular?: boolean;
}

export interface FAQCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'cat-getting-started',
    slug: 'getting-started',
    title: 'Getting Started & Account',
    description: 'Explore destinations, AI planner, and quick setup before you begin.',
    iconName: 'Sparkles'
  },
  {
    id: 'cat-transport-bookings',
    slug: 'transport-bookings',
    title: 'Flights, Trains & Buses',
    description: 'All-in-one multimodal booking, seat selection, and baggage rules.',
    iconName: 'Plane'
  },
  {
    id: 'cat-special-care',
    slug: 'special-care',
    title: 'Senior Citizens & Accessibility',
    description: 'Assistance for the elderly, women solo travelers, and wheelchair users.',
    iconName: 'Shield'
  },
  {
    id: 'cat-hotels-stays',
    slug: 'hotels-stays',
    title: 'Hotels, Homestays & Resorts',
    description: 'Hotel tiers, transparent pricing, check-in rules, and room amenities.',
    iconName: 'Building2'
  },
  {
    id: 'cat-payments-invoices',
    slug: 'payments-invoices',
    title: 'Payments, GST & Invoices',
    description: 'UPI, cards, payment simulator, 5% GST breakdown, and receipt downloads.',
    iconName: 'CreditCard'
  },
  {
    id: 'cat-cancellations-refunds',
    slug: 'cancellations-refunds',
    title: 'Cancellations & Fast Refunds',
    description: '24-hour free cancellation, instant wallet credits, and trip rescheduling.',
    iconName: 'RotateCcw'
  },
  {
    id: 'cat-bumper-packages',
    slug: 'bumper-packages',
    title: 'Bumper Packages & Discounts',
    description: 'Curated all-India combo tours, festive seasonal promo codes, and group savings.',
    iconName: 'Gift'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  // 1. Getting Started & Account
  {
    id: 'gs-1',
    category: 'getting-started',
    question: 'Do I need an account to browse destinations and generate itineraries?',
    answer: 'No! You can freely explore all tourist destinations, bumper packages, flight/bus timetables, and generate AI-powered multi-day itineraries without logging in. You only need to sign in or create an account when you wish to confirm a booking or save trips to your personal dashboard.',
    popular: true
  },
  {
    id: 'gs-2',
    category: 'getting-started',
    question: 'How does the AI Trip Planner generate personalized itineraries?',
    answer: 'Our AI analyzes your selected travel destination, duration, budget tier (Budget, Comfort, Luxury), and travel style (Heritage, Adventure, Relaxed, Family). It automatically constructs an optimal day-by-day itinerary complete with hotel recommendations, connecting transport, sightseeing slots, and local tips.',
    popular: true
  },
  {
    id: 'gs-3',
    category: 'getting-started',
    question: 'Can I customize an AI itinerary after it has been created?',
    answer: 'Yes, full customization is available! You can swap hotel tiers, add or remove specific sightseeing activities, pick preferred transit options (Flight vs. Bus vs. Train), and adjust your departure dates with 1-click recalculation.',
    popular: false
  },
  {
    id: 'gs-4',
    category: 'getting-started',
    question: 'Which destinations across India does Yatra Setu cover?',
    answer: 'Yatra Setu covers all major and offbeat destinations across 28 states and 8 union territories in India—including Kashmir, Ladakh, Rajasthan, Kerala, Goa, Uttarakhand, Himachal Pradesh, Varanasi, Northeast India, and the Andaman Islands.',
    popular: false
  },

  // 2. Flights, Trains & Buses (Transport)
  {
    id: 'tb-1',
    category: 'transport-bookings',
    question: 'How does all-in-one multimodal booking work?',
    answer: 'Yatra Setu allows you to book connecting domestic flights, express trains, intercity luxury sleeper buses, and local pre-paid cabs/autos in a single unified checkout basket. You receive one master itinerary and synchronized booking references.',
    popular: true
  },
  {
    id: 'tb-2',
    category: 'transport-bookings',
    question: 'Can I select my exact seats for flights, trains, and buses?',
    answer: 'Yes! Our interactive visual Seat Selector lets you choose your preferred seat layout in real time—including window/aisle airline seats, AC 2-Tier/3-Tier train berths (Lower, Upper, Side Lower), and Volvo AC sleeper berths (Lower/Upper single and double).',
    popular: true
  },
  {
    id: 'tb-3',
    category: 'transport-bookings',
    question: 'What baggage allowance is included with transport tickets?',
    answer: 'Standard domestic flight fares typically include 15 kg check-in baggage + 7 kg hand/cabin baggage per passenger. Luxury AC buses allow up to 2 medium luggage bags per traveler. Exact baggage details are highlighted before final payment.',
    popular: false
  },
  {
    id: 'tb-4',
    category: 'transport-bookings',
    question: 'How and when do I receive my boarding passes and travel vouchers?',
    answer: 'Immediately upon payment confirmation, your digital travel voucher and PNR details are generated. They are instantly accessible under Dashboard > Bookings, sent to your verified email address, and downloadable as an official PDF / printable voucher.',
    popular: false
  },

  // 3. Senior Citizens, Women & Accessibility
  {
    id: 'sc-1',
    category: 'special-care',
    question: 'What special assistance is provided for senior citizens and elderly travelers?',
    answer: 'We provide specialized senior-friendly travel options including guaranteed lower berth train allocations, airport/station wheelchair assistance, ground-floor or elevator-accessible hotel rooms, and gentle-paced sightseeing schedules with minimal walking.',
    popular: true
  },
  {
    id: 'sc-2',
    category: 'special-care',
    question: 'Are there dedicated safety measures for solo women travelers?',
    answer: 'Yes! We offer verified women-only sleeper bus berths, hotels certified with high female safety ratings, vetted lady tour guides in heritage circuits, and 24/7 round-the-clock emergency support.',
    popular: true
  },
  {
    id: 'sc-3',
    category: 'special-care',
    question: 'How do I request wheelchair and disability accessibility?',
    answer: 'When booking any package or transport, enable the "Wheelchair Accessible / Special Assistance" toggle. Our system will prioritize ramp-accessible vehicles, step-free hotel entries, and airport mobility support at zero extra coordination charge.',
    popular: false
  },
  {
    id: 'sc-4',
    category: 'special-care',
    question: 'Are there discounts or perks for children and teenagers under 16?',
    answer: 'Yes! Children under 16 qualify for discounted attraction entry tickets, complimentary hotel stays when using existing bedding, and special family discount promo codes during school vacation periods.',
    popular: false
  },

  // 4. Hotels & Stays
  {
    id: 'hs-1',
    category: 'hotels-stays',
    question: 'What is the difference between Budget, Comfort, and Luxury hotel tiers?',
    answer: '• Budget Tier (3-Star): Hygienic, well-reviewed AC rooms with complimentary Wi-Fi and breakfast.\n• Comfort Tier (4-Star): Premium hospitality with on-site restaurants, swimming pool or fitness facilities, and central scenic views.\n• Luxury Tier (5-Star & Heritage): World-class luxury resorts and heritage palaces with spa access, gourmet dining, private balconies, and dedicated butler care.',
    popular: true
  },
  {
    id: 'hs-2',
    category: 'hotels-stays',
    question: 'Are hotel taxes, GST, and service fees included in the price?',
    answer: 'Yes. Yatra Setu maintains 100% price transparency. You will see a clear breakdown showing the base room tariff and applicable 5% GST on the checkout screen. There are no hidden check-in fees or surprise convenience charges.',
    popular: true
  },
  {
    id: 'hs-3',
    category: 'hotels-stays',
    question: 'Can I request early check-in or late check-out?',
    answer: 'Standard check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in requests can be submitted in your booking preferences or via support, and partner properties accommodate early arrivals whenever rooms are available.',
    popular: false
  },

  // 5. Payments, GST & Tax Invoices
  {
    id: 'pi-1',
    category: 'payments-invoices',
    question: 'What payment modes are supported on Yatra Setu?',
    answer: 'We support all major payment modes: UPI (Google Pay, PhonePe, Paytm, CRED), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ Indian banks, and a realistic Demo Payment Simulator for test bookings.',
    popular: true
  },
  {
    id: 'pi-2',
    category: 'payments-invoices',
    question: 'How do I download an official GST Tax Invoice and Payment Receipt?',
    answer: 'Every successful payment generates an official, high-definition GST Tax Invoice (YS-REC-XXXX) with complete traveler details, HSN/SAC codes, and tax breakdown. You can download or print it instantly on the confirmation screen, or anytime from Dashboard > Payments or Dashboard > Bookings.',
    popular: true
  },
  {
    id: 'pi-3',
    category: 'payments-invoices',
    question: 'Is online payment secure on Yatra Setu?',
    answer: 'Yes, 100%. All transactions use bank-grade 256-bit SSL encryption, PCI-DSS Level 1 compliance, and 3D Secure 2.0 multi-factor OTP authentication. We never store your full card numbers or CVV on our servers.',
    popular: false
  },

  // 6. Cancellations & Refunds
  {
    id: 'cr-1',
    category: 'cancellations-refunds',
    question: 'What is the 24-Hour Free Cancellation policy?',
    answer: 'Most flights, hotels, and bumper packages qualify for 100% Free Cancellation up to 24 hours prior to scheduled departure or check-in time. You can cancel with a single click from Dashboard > Bookings.',
    popular: true
  },
  {
    id: 'cr-2',
    category: 'cancellations-refunds',
    question: 'How long does it take to receive my refund?',
    answer: 'Refunds initiated on Yatra Setu are processed immediately. Depending on your bank or UPI provider, the funds reflect in your original payment account within 2 to 4 business days.',
    popular: true
  },
  {
    id: 'cr-3',
    category: 'cancellations-refunds',
    question: 'Can I reschedule my trip dates instead of cancelling?',
    answer: 'Yes! You can reschedule your hotel or transport dates up to 12 hours before travel directly from the Dashboard, subject to seasonal room/fare difference without penal cancellation charges.',
    popular: false
  },

  // 7. Bumper Packages & Festive Discounts
  {
    id: 'bp-1',
    category: 'bumper-packages',
    question: 'What are Bumper Packages and what do they include?',
    answer: 'Bumper Packages are curated, all-inclusive multi-city holiday packages designed by travel experts. They bundle round-trip flights, scenic trains, deluxe AC buses, handpicked 4-star/5-star hotels, local guided tours, and breakfast—saving you up to 40% compared to booking separately.',
    popular: true
  },
  {
    id: 'bp-2',
    category: 'bumper-packages',
    question: 'How do real-time festive season discounts work?',
    answer: 'During festive seasons (e.g. Diwali, Dussehra, Christmas, New Year, Holi), real-time promo discounts (such as FESTIVE2026, FLYSETU, STAYLUXE) automatically reflect on qualifying packages, reducing prices by 15% to 35% on checkout.',
    popular: true
  },
  {
    id: 'bp-3',
    category: 'bumper-packages',
    question: 'Can group bookings get additional customized discounts?',
    answer: 'Yes, groups of 4 or more travelers enjoy tiered corporate/family discounts of an additional 10% off. Contact our 24/7 Travel Concierge or click "Contact Support" for custom group quotes.',
    popular: false
  }
];
