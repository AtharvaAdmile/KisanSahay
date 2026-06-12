export type ConditionOperator = 'eq' | 'exists' | 'in';

export interface Condition {
    field: string;
    operator: ConditionOperator;
    value: string | boolean | string[];
    labelKey: string; // i18n key used in eligibility display
}

export interface Scheme {
    scheme_id: string;
    name: string;
    name_hi: string;
    name_mr: string;
    description: string;
    benefits: string;
    icon: string;
    accentColor: string;
    amount: string;
    ministry: string;
    howToApply: string[];
    requiredDocs: string[];
    conditions: Condition[];
}

export const SCHEMES: Scheme[] = [
    {
        scheme_id: 'pm-kisan',
        name: 'PM-KISAN',
        name_hi: 'प्रधानमंत्री किसान सम्मान निधि',
        name_mr: 'प्रधानमंत्री किसान सन्मान निधी',
        description: 'Direct income support of ₹6,000 per year to all landholding farmer families.',
        benefits: '₹6,000/year paid in 3 installments of ₹2,000 directly to your bank account.',
        icon: '💰',
        accentColor: '#2E7D32',
        amount: '₹6,000 / year',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        howToApply: [
            'Visit your nearest Common Service Centre (CSC) or Gram Panchayat office.',
            'Carry your Aadhaar card, land ownership documents (7/12 extract), and bank passbook.',
            'Fill the PM-KISAN registration form and submit all documents.',
            'Your details will be verified by the state government.',
            'Once approved, ₹2,000 installments are deposited directly to your bank account every 4 months.',
        ],
        requiredDocs: ['Aadhaar Card', 'Bank Account Passbook', 'Land Ownership Documents (7/12)'],
        conditions: [
            { field: 'farm.land_ownership', operator: 'eq', value: 'own', labelKey: 'eligibility.need_own_land' },
            { field: 'credentials.has_aadhaar', operator: 'exists', value: true, labelKey: 'eligibility.need_aadhaar' },
            { field: 'credentials.has_bank_account', operator: 'exists', value: true, labelKey: 'eligibility.need_bank' },
        ],
    },
    {
        scheme_id: 'pmfby',
        name: 'PMFBY',
        name_hi: 'प्रधानमंत्री फसल बीमा योजना',
        name_mr: 'प्रधानमंत्री पीक विमा योजना',
        description: 'Comprehensive crop insurance against natural calamities, pests, and diseases.',
        benefits: 'Full crop loss coverage with minimal premium: 1.5% for Rabi, 2% for Kharif crops.',
        icon: '🌩️',
        accentColor: '#1565C0',
        amount: '1.5–5% premium',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        howToApply: [
            'Contact your nearest bank or PMFBY-empanelled insurance company before the crop season ends.',
            'Carry your Aadhaar card, bank account details, and land/sowing certificate.',
            'Fill the PMFBY enrollment form and pay the applicable premium amount.',
            'You will receive an insurance certificate confirming your coverage.',
            'In case of crop loss, file a claim through your bank or insurance company within 72 hours of the event.',
        ],
        requiredDocs: ['Aadhaar Card', 'Bank Account Passbook', 'Land Records / Sowing Certificate'],
        conditions: [
            { field: 'credentials.has_aadhaar', operator: 'exists', value: true, labelKey: 'eligibility.need_aadhaar' },
            { field: 'credentials.has_bank_account', operator: 'exists', value: true, labelKey: 'eligibility.need_bank' },
            {
                field: 'farm.primary_crop',
                operator: 'in',
                value: ['cotton', 'sugarcane', 'wheat', 'rice', 'soybean'],
                labelKey: 'eligibility.need_crop_type',
            },
        ],
    },
    {
        scheme_id: 'soil-health-card',
        name: 'Soil Health Card',
        name_hi: 'मृदा स्वास्थ्य कार्ड योजना',
        name_mr: 'मृदा आरोग्य कार्ड योजना',
        description: 'Provides soil health cards with crop-wise nutrient and fertilizer recommendations.',
        benefits: 'Free soil testing and personalized fertilizer advice — save on input costs and improve yield.',
        icon: '🌱',
        accentColor: '#6D4C41',
        amount: 'Free',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        howToApply: [
            'Contact your local Krishi Vigyan Kendra (KVK) or State Agriculture Department office.',
            'Carry your Aadhaar card and field/land details.',
            'An official will collect a soil sample from your farm (or you can bring one).',
            'Results and recommendations arrive on your Soil Health Card within 2–3 weeks.',
            'Use the card\'s recommendations to apply the right fertilizers and improve soil health.',
        ],
        requiredDocs: ['Aadhaar Card', 'Field / Land Details'],
        conditions: [
            {
                field: 'farm.land_ownership',
                operator: 'in',
                value: ['own', 'leased'],
                labelKey: 'eligibility.need_any_land',
            },
            { field: 'credentials.has_aadhaar', operator: 'exists', value: true, labelKey: 'eligibility.need_aadhaar' },
        ],
    },
    {
        scheme_id: 'rkvy',
        name: 'RKVY',
        name_hi: 'राष्ट्रीय कृषि विकास योजना',
        name_mr: 'राष्ट्रीय कृषी विकास योजना',
        description: 'Financial assistance for agricultural development — mechanization, irrigation, and infrastructure.',
        benefits: 'Subsidies on farm equipment, irrigation systems, agri-infrastructure, and crop diversification.',
        icon: '🚜',
        accentColor: '#E65100',
        amount: 'Subsidy varies',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        howToApply: [
            'Visit your District Agriculture Office or State Agriculture Department.',
            'Carry Aadhaar, land ownership documents, and bank passbook.',
            'Select the applicable sub-scheme (e.g., farm mechanization, micro-irrigation).',
            'Submit your application with supporting documents and crop activity proof.',
            'After verification, the subsidy is disbursed directly to your bank account or via equipment supply.',
        ],
        requiredDocs: ['Aadhaar Card', 'Bank Account Passbook', 'Land Records', 'Farm Activity Proof'],
        conditions: [
            { field: 'farm.land_ownership', operator: 'eq', value: 'own', labelKey: 'eligibility.need_own_land' },
            {
                field: 'farm.land_size',
                operator: 'in',
                value: ['1_to_2_acres', '2_to_5_acres', 'above_5_acres'],
                labelKey: 'eligibility.need_land_size',
            },
            { field: 'credentials.has_aadhaar', operator: 'exists', value: true, labelKey: 'eligibility.need_aadhaar' },
            { field: 'credentials.has_bank_account', operator: 'exists', value: true, labelKey: 'eligibility.need_bank' },
        ],
    },
    {
        scheme_id: 'mahatma-phule-yojana',
        name: 'Mahatma Phule Shetkari Yojana',
        name_hi: 'महात्मा ज्योतिराव फुले शेतकरी सन्मान योजना',
        name_mr: 'महात्मा ज्योतिराव फुले शेतकरी सन्मान योजना',
        description: 'Maharashtra state scheme providing crop loan waiver for small and marginal farmers.',
        benefits: 'Full crop loan waiver up to ₹2 lakh — applied directly to your loan account.',
        icon: '🏦',
        accentColor: '#6A1B9A',
        amount: 'Up to ₹2 lakh',
        ministry: 'Government of Maharashtra',
        howToApply: [
            'Visit your nearest District Central Cooperative Bank or scheduled commercial bank in Maharashtra.',
            'Carry Aadhaar card, land ownership documents (7/12 extract), and bank/loan passbook.',
            'Fill the loan waiver application form before the government-announced deadline.',
            'Submit with supporting documents — the bank verifies your eligibility.',
            'The loan waiver amount is credited directly to your crop loan account.',
        ],
        requiredDocs: ['Aadhaar Card', 'Bank Account Passbook', 'Land Ownership Documents (7/12)', 'Crop Loan Account Details'],
        conditions: [
            { field: 'location.state', operator: 'eq', value: 'Maharashtra', labelKey: 'eligibility.need_maharashtra' },
            { field: 'farm.land_ownership', operator: 'eq', value: 'own', labelKey: 'eligibility.need_own_land' },
            {
                field: 'farm.land_size',
                operator: 'in',
                value: ['below_1_acre', '1_to_2_acres', '2_to_5_acres'],
                labelKey: 'eligibility.need_land_below_5_acres',
            },
            { field: 'credentials.has_aadhaar', operator: 'exists', value: true, labelKey: 'eligibility.need_aadhaar' },
            { field: 'credentials.has_bank_account', operator: 'exists', value: true, labelKey: 'eligibility.need_bank' },
        ],
    },
];
