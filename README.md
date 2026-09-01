# 🍔 GRILLISTA - Desi Burgers, Global Swag
> A modern, secure, developer-friendly food franchise web platform built purely with **HTML5, CSS3, and Vanilla JavaScript (ES6 Modules)**, inspired by the bold energy and high-growth franchise model of **Burger Singh**.

---

## 🌟 Key Features

### 1. 🍽️ Interactive Desi Menu & Online Ordering System
- **Authentic Indian-Fusion Catalogs**: Amritsari Murgh Makhani, Paneer Pao-Wow, Dilli-6 Chaat Fries, Jatt & Juliet Double Mutton, Kala Khatta Chiller, and more.
- **Smart Filtering & Instant Search**: Filter by categories, Veg-only toggle, Spicy-level meter (🌶️🌶️🌶️), and instant debounced search.
- **Product Customization Modal**: Real-time pricing calculations for custom add-ons (Extra patties, cheese burst, dips).
- **Sliding Cart Drawer & Dynamic Bill Engine**: Subtotal, automated 5% GST calculation, packaging fee, free delivery tier (> ₹399), and coupon discount engine (`GRILLISTA50`, `DESI20`, `FREESHIP`).
- **Live Order Tracker Simulator**: 4-stage cooking and delivery progression with real-time status updates.

### 2. 💼 High-Yield Franchise Opportunity Portal (Burger Singh Model)
- **Multi-Tier Formats**: Flagship Dine-In, Food Court Express, and Cloud Kitchen / Kiosk.
- **Interactive ROI & Payback Calculator**:
  - Dynamically calculates **CapEx**, **Monthly Gross Revenue**, **Operational Expenses (COGS, Rent, Staff, Royalty)**, **EBITDA Net Profit**, **Annual ROI %**, and **Payback Timeline** in months.
  - Interactive range sliders for daily order volume and City Tier multipliers (Metro Tier 1, Tier 2, Tier 3).
- **One-Click Financial Prospectus Generator**: Exports and downloads formatted franchise investment summaries.
- **Secure Franchise Application Form**: Multi-field client-side validation with rate-limiting and reference token dispatch.

### 3. 📍 Real-Time Store Locator with Live APIs
- **OpenStreetMap Nominatim Geocoding**: Real-time search by city, landmark, or Indian 6-digit postal pincode without requiring costly proprietary API keys.
- **HTML5 Geolocation Integration ("Locate Me")**: Computes live GPS coordinates and reverses geocodes to the user's locality.
- **Haversine Distance Algorithm**: Dynamically computes distance in kilometers (`km`) from the user to every franchise outlet across India and sorts by proximity.

### 4. 💬 Real-Time Customer Reviews Engine
- Dynamic reviews fetched via public profile APIs with fallbacks to verified local store history.
- "Share Your Experience" modal allowing customers to write 5-star reviews instantly persisted with strict XSS sanitization.

### 5. 🛡️ Enterprise-Grade Frontend Security
- **Strict DOM Sanitization (`Security.escapeHTML`)**: Immune to client-side Cross-Site Scripting (XSS).
- **Validation Engine**: Dedicated regex validators for Indian mobile numbers (`+91 / 10 digits`), emails, pincodes, and safe text inputs.
- **Client Rate Limiting**: Prevents rapid duplicate form submissions and API spam.
- **Resilient LocalStorage Wrapper**: Safe JSON serialization with quota fallback guards.

---

## 📂 Project Architecture

```
griilista/
├── index.html                  # Semantic HTML5 Single Page Application
├── README.md                   # Technical Documentation & Customization Guide
│
├── css/
│   ├── style.css               # Design tokens, variables, navbar, footer, cart drawer, modals
│   ├── menu.css                # Food cards, diet indicators, spice meters, category tabs
│   ├── franchise.css           # ROI sliders, model comparison cards, inquiry form, store locator
│   └── animations.css          # Pulse flame, spinners, tracker timelines, slide-ins
│
└── js/
    ├── config.js               # Global constants, API endpoints, brand configuration
    ├── security.js             # XSS sanitizer, input validators, rate limiter, storage helper
    ├── data.js                 # Catalog of burgers, sides, outlets, and coupons
    ├── api.js                  # OpenStreetMap geocoding, review fetcher, webhook simulator
    ├── cart.js                 # Cart state management, modifier logic, coupon calculations
    ├── franchise.js            # Financial ROI calculation formulas & prospectus exporter
    ├── locator.js              # Geolocation, Haversine formula, proximity sorter
    └── app.js                  # Main controller orchestrating UI events, modals, and toasts
```

---

## 🚀 How to Run Locally

Because the project uses standard ES6 JavaScript Modules (`import` / `export`), it runs via any local HTTP server:

### Option 1: Python HTTP Server (Built-in)
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Node / npx (serve / live-server)
```bash
npx serve .
# or
npx live-server
```

### Option 3: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## 🛠️ Developer Customization Guide

### 1. Adding or Modifying Menu Items (`js/data.js`)
Edit the `MENU_ITEMS` array in `js/data.js`:
```javascript
{
  id: 'b-custom-01',
  name: 'Tandoori Chaap Smacker',
  category: 'burgers', // 'burgers' | 'sides' | 'combos' | 'beverages' | 'desserts'
  isVeg: true,
  isSpicy: true,
  spiceLevel: 2, // 0 to 3
  isBestseller: true,
  price: 199,
  calories: 480,
  protein: '16g',
  description: 'Smoky roasted soya chaap chunks tossed in spicy mint chutney and melted cheese.',
  image: 'https://images.unsplash.com/...',
  tags: ['High Protein', 'Chef Pick'],
  modifiers: [
    { name: 'Double Chaap Layer', price: 50 },
    { name: 'Extra Cheese', price: 30 }
  ]
}
```

### 2. Adjusting Franchise Financial Metrics (`js/config.js`)
Update the `CONFIG.FRANCHISE.MODELS` in `js/config.js` to modify CapEx, royalty, or average order values:
```javascript
CONFIG.FRANCHISE.MODELS.dine_in.capex = 3500000; // Updated ₹35 Lakhs
CONFIG.FRANCHISE.MODELS.dine_in.royaltyPercent = 0.06; // 6% Royalty
```

### 3. Adding New Promo Codes (`js/data.js`)
```javascript
export const COUPONS = {
  'SUPERBURGER': {
    code: 'SUPERBURGER',
    discountPercent: 30,
    maxDiscount: 150,
    minOrder: 300,
    description: '30% OFF up to ₹150 on orders above ₹300'
  }
};
```

---

## 🔒 Security & Best Practices
- **No External CDN Dependencies for Code**: Uses vanilla ES6 for maximum loading speed, auditability, and zero supply-chain risk.
- **XSS Protection**: All dynamic user-facing text is passed through `Security.escapeHTML()`.
- **CORS Compliant**: Out-of-the-box support with public CORS-friendly OpenStreetMap Nominatim endpoints.

---

## 📄 License
MIT License © 2026 GRILLISTA Foods. Built with pride for Indian street-fusion food lovers.
