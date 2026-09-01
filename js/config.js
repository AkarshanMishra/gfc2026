/**
 * GRILLISTA - Global Application Configuration
 * Developer-friendly, modular configuration management
 */

export const CONFIG = {
  BRAND: {
    name: 'GRILLISTA',
    tagline: 'The Ultimate Food Chain',
    subTagline: 'Veg Vibes, Positive Energy',
    supportPhone: '+91 87671 21212',
    franchisePhone: '+91 90290 20888',
    supportEmail: 'franchise@grillista.in',
    foundedYear: 2021,
    flagshipOutlets: ['Kakadeo, Kanpur', 'Barra, Kanpur'],
    totalCustomersServed: '10,000+',
    rating: '4.8 ⭐',
    currencySymbol: '₹',
    currencyCode: 'INR',
  },

  // Real-Time API Endpoints
  APIS: {
    GEOCODING: 'https://nominatim.openstreetmap.org/search',
    GEOCODING_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
    REVIEWS: 'https://randomuser.me/api/?results=4&nat=in,us,gb',
    GEO_IP: 'https://ipapi.co/json/',
  },

  // Franchise Models & Accurate ROI Breakdown
  FRANCHISE: {
    DEFAULT_AVG_BILLING: 170,
    FOOD_COST_PERCENT: 0.30, // 30% Food Cost
    ROYALTY_PERCENT: 0.05,   // 5% Royalty (6 months free)

    MODELS: {
      express: {
        id: 'express',
        name: 'Grillista Express Model',
        areaReq: '200 sq.ft',
        investmentBracket: '10 - 12 Lakh',
        capex: 1150000,
        equipment: 500000,
        interior: 300000,
        franchiseFee: 300000,
        stationary: 50000,
        defaultCustomers: 50,
        rent: 50000,
        staff: 40000,
        electricity: 10000,
        marketing: 10000,
        misc: 10000,
        description: 'Compact high-efficiency kiosk / counter model ideal for high footfall commercial markets, coaching hubs, and transit zones.'
      },
      bistro: {
        id: 'bistro',
        name: 'Grillista Bistro Model',
        areaReq: '600 sq.ft',
        investmentBracket: '16 - 18 Lakh',
        capex: 2150000,
        equipment: 700000,
        interior: 900000,
        franchiseFee: 500000,
        stationary: 50000,
        defaultCustomers: 80,
        rent: 50000,
        staff: 40000,
        electricity: 10000,
        marketing: 10000,
        misc: 10000,
        description: 'Casual dine-in concept with comfortable seating, vibrant ambiance, and full kitchen capabilities for all day-parts.'
      },
      signature: {
        id: 'signature',
        name: 'Grillista Signature Model',
        areaReq: '1000 sq.ft',
        investmentBracket: '38 - 40 Lakh',
        capex: 3150000,
        equipment: 1000000,
        interior: 1500000,
        franchiseFee: 600000,
        stationary: 50000,
        defaultCustomers: 120,
        rent: 50000,
        staff: 40000,
        electricity: 10000,
        marketing: 10000,
        misc: 10000,
        description: 'Premium flagship destination featuring experiential seating, luxury booth zones, private party hosting, and massive volume.'
      }
    }
  },

  STORAGE_KEYS: {
    REVIEWS: 'grillista_reviews_v1',
    PREFERENCES: 'grillista_user_pref_v1'
  }
};
