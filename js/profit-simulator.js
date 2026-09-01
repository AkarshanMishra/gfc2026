/**
 * GRILLISTA - Advanced Interactive Profit Simulator & P&L Engine v2.0
 * Features: Multi-Scenario Presets, Custom OPEX Sliders, 3-Year Wealth Forecasting,
 * Channel Mix Breakdown, Royalty-Free Toggle, Dynamic WhatsApp Pre-Fill & Prospectus Exporter.
 */

window.simulatorState = {
  model: 'express',
  scenario: 'conservative',
  isRoyaltyFree: true,
  showCustomOpex: false,
  customers: 50,
  ticket: 170,
  rent: 50000,
  staff: 40000,
  electricity: 10000,
  marketing: 10000,
  misc: 10000,
  models: {
    express: {
      name: 'Grillista Express',
      space: '200 sq.ft',
      capex: 1150000,
      baseCust: { conservative: 50, moderate: 85, aggressive: 130 },
      defaultRent: 50000,
      defaultStaff: 40000,
      defaultElec: 10000
    },
    bistro: {
      name: 'Grillista Bistro',
      space: '500 - 800 sq.ft',
      capex: 2150000,
      baseCust: { conservative: 80, moderate: 125, aggressive: 180 },
      defaultRent: 50000,
      defaultStaff: 40000,
      defaultElec: 10000
    },
    signature: {
      name: 'Grillista Signature',
      space: '1000 - 2000 sq.ft',
      capex: 3150000,
      baseCust: { conservative: 120, moderate: 180, aggressive: 250 },
      defaultRent: 50000,
      defaultStaff: 40000,
      defaultElec: 10000
    }
  }
};

window.openProfitSimulatorModal = function(initialModel) {
  if (initialModel && window.simulatorState.models[initialModel]) {
    window.switchSimulatorModel(initialModel);
  }
  const modal = document.getElementById('profit-simulator-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    window.updateSimulatorCalc();
  }
};

window.closeProfitSimulatorModal = function() {
  const modal = document.getElementById('profit-simulator-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.switchSimulatorModel = function(modelKey) {
  window.simulatorState.model = modelKey;
  const m = window.simulatorState.models[modelKey];
  
  // Set default customer based on current scenario
  window.simulatorState.customers = m.baseCust[window.simulatorState.scenario] || m.baseCust.conservative;
  window.simulatorState.rent = m.defaultRent;
  window.simulatorState.staff = m.defaultStaff;
  window.simulatorState.electricity = m.defaultElec;

  // Sync sliders
  const custSlider = document.getElementById('sim-cust-slider');
  if (custSlider) custSlider.value = window.simulatorState.customers;
  
  const rentSlider = document.getElementById('sim-rent-slider');
  if (rentSlider) rentSlider.value = window.simulatorState.rent;
  
  const staffSlider = document.getElementById('sim-staff-slider');
  if (staffSlider) staffSlider.value = window.simulatorState.staff;

  // Update tabs UI
  ['express', 'bistro', 'signature'].forEach(k => {
    const btn = document.getElementById('sim-tab-' + k);
    if (btn) {
      if (k === modelKey) {
        btn.classList.add('active-model-tab');
        btn.style.background = '#D32323';
        btn.style.color = '#FFFFFF';
        btn.style.borderColor = '#D32323';
        btn.style.boxShadow = '0 4px 14px rgba(211, 35, 35, 0.35)';
      } else {
        btn.classList.remove('active-model-tab');
        btn.style.background = '#F8FAFC';
        btn.style.color = '#475569';
        btn.style.borderColor = '#CBD5E1';
        btn.style.boxShadow = 'none';
      }
    }
  });

  window.updateSimulatorCalc();
};

window.setSimulatorScenario = function(scenarioKey) {
  window.simulatorState.scenario = scenarioKey;
  const m = window.simulatorState.models[window.simulatorState.model];
  window.simulatorState.customers = m.baseCust[scenarioKey] || 50;

  const custSlider = document.getElementById('sim-cust-slider');
  if (custSlider) custSlider.value = window.simulatorState.customers;

  ['conservative', 'moderate', 'aggressive'].forEach(s => {
    const btn = document.getElementById('sim-scen-' + s);
    if (btn) {
      if (s === scenarioKey) {
        btn.style.background = '#0F172A';
        btn.style.color = '#FFC72C';
        btn.style.borderColor = '#FFC72C';
      } else {
        btn.style.background = '#F1F5F9';
        btn.style.color = '#64748B';
        btn.style.borderColor = '#E2E8F0';
      }
    }
  });

  window.updateSimulatorCalc();
};

window.toggleCustomOpex = function() {
  window.simulatorState.showCustomOpex = !window.simulatorState.showCustomOpex;
  const drawer = document.getElementById('sim-custom-opex-drawer');
  const toggleBtn = document.getElementById('sim-opex-toggle-btn');
  if (drawer) {
    drawer.style.display = window.simulatorState.showCustomOpex ? 'block' : 'none';
  }
  if (toggleBtn) {
    toggleBtn.innerHTML = window.simulatorState.showCustomOpex 
      ? '▲ Hide Store Overhead Adjustments' 
      : '⚙️ Fine-Tune Local Rent & Staff Costs ▼';
  }
};

window.toggleRoyaltyHoliday = function() {
  window.simulatorState.isRoyaltyFree = !window.simulatorState.isRoyaltyFree;
  const toggleBtn = document.getElementById('sim-royalty-toggle-pill');
  if (toggleBtn) {
    if (window.simulatorState.isRoyaltyFree) {
      toggleBtn.style.background = '#DCFCE7';
      toggleBtn.style.color = '#15803D';
      toggleBtn.style.borderColor = '#86EFAC';
      toggleBtn.innerHTML = '⭐ First 6 Months 0% Royalty Active (₹0)';
    } else {
      toggleBtn.style.background = '#F1F5F9';
      toggleBtn.style.color = '#64748B';
      toggleBtn.style.borderColor = '#CBD5E1';
      toggleBtn.innerHTML = 'Standard 5% Brand Royalty Active';
    }
  }
  window.updateSimulatorCalc();
};

window.updateSimulatorCalc = function() {
  const custSlider = document.getElementById('sim-cust-slider');
  const ticketSlider = document.getElementById('sim-ticket-slider');
  const rentSlider = document.getElementById('sim-rent-slider');
  const staffSlider = document.getElementById('sim-staff-slider');
  
  if (custSlider) window.simulatorState.customers = parseInt(custSlider.value) || 50;
  if (ticketSlider) window.simulatorState.ticket = parseInt(ticketSlider.value) || 170;
  if (rentSlider) window.simulatorState.rent = parseInt(rentSlider.value) || 50000;
  if (staffSlider) window.simulatorState.staff = parseInt(staffSlider.value) || 40000;

  const cust = window.simulatorState.customers;
  const ticket = window.simulatorState.ticket;
  const rent = window.simulatorState.rent;
  const staff = window.simulatorState.staff;
  const elec = window.simulatorState.electricity;
  const mkt = window.simulatorState.marketing;
  const misc = window.simulatorState.misc;

  const model = window.simulatorState.models[window.simulatorState.model] || window.simulatorState.models.express;

  // Financial Calculations
  const dailySale = Math.round(cust * ticket);
  const monthlySale = Math.round(dailySale * 30);
  const foodCost = Math.round(monthlySale * 0.30);
  const standardRoyalty = Math.round(monthlySale * 0.05);
  const appliedRoyalty = window.simulatorState.isRoyaltyFree ? 0 : standardRoyalty;
  const fixedOverheads = rent + staff + elec + mkt + misc;

  const totalOpex = foodCost + appliedRoyalty + fixedOverheads;
  const netMonthlyProfit = Math.max(0, monthlySale - totalOpex);
  const netMonthlyProfitRoyaltyFree = Math.max(0, monthlySale - (foodCost + fixedOverheads));
  const netMonthlyProfitStandard = Math.max(0, monthlySale - (foodCost + standardRoyalty + fixedOverheads));

  // Multi-Year Projections (Year 1 includes 6-month royalty waiver)
  const year1Profit = (netMonthlyProfitRoyaltyFree * 6) + (netMonthlyProfitStandard * 6);
  const year2Profit = Math.round(netMonthlyProfitStandard * 12 * 1.10); // 10% organic growth
  const year3Profit = Math.round(netMonthlyProfitStandard * 12 * 1.22); // Cumulative growth
  const total3YearReturns = year1Profit + year2Profit + year3Profit;

  // Payback period
  const avgMonthlyYear1 = year1Profit / 12;
  const paybackMonths = avgMonthlyYear1 > 0 ? (model.capex / avgMonthlyYear1).toFixed(1) : 'N/A';
  const marginPct = monthlySale > 0 ? ((netMonthlyProfit / monthlySale) * 100).toFixed(1) : 0;

  // Format Helper
  const fmt = (n) => '₹ ' + Math.round(n).toLocaleString('en-IN');

  // DOM Updates
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('sim-cust-display', cust + ' Orders / Day');
  setEl('sim-ticket-display', '₹ ' + ticket + ' / bill');
  setEl('sim-rent-display', fmt(rent) + ' / mo');
  setEl('sim-staff-display', fmt(staff) + ' / mo');

  setEl('sim-daily-sale', fmt(dailySale));
  setEl('sim-monthly-sale', fmt(monthlySale));
  setEl('sim-food-cost', '- ' + fmt(foodCost));
  setEl('sim-royalty', window.simulatorState.isRoyaltyFree ? '₹ 0 (100% Free Promo)' : '- ' + fmt(standardRoyalty));
  setEl('sim-fixed-overheads', '- ' + fmt(fixedOverheads));
  
  setEl('sim-net-profit', fmt(netMonthlyProfit) + ' / mo');
  setEl('sim-margin-badge', marginPct + '% Net Margin');
  setEl('sim-net-profit-initial', '⭐ First 6 Months: ' + fmt(netMonthlyProfitRoyaltyFree) + ' / mo (100% Royalty Free)');

  setEl('sim-year1-val', fmt(year1Profit));
  setEl('sim-year2-val', fmt(year2Profit));
  setEl('sim-year3-val', fmt(total3YearReturns));
  setEl('sim-payback-badge', '~' + paybackMonths + ' Months');

  // Payback Progress Bar Percentage (capped 100%)
  const paybackBar = document.getElementById('sim-payback-progress-bar');
  if (paybackBar && avgMonthlyYear1 > 0) {
    const pct = Math.min(100, Math.max(15, Math.round((12 / parseFloat(paybackMonths)) * 100)));
    paybackBar.style.width = pct + '%';
  }

  // Update Dynamic WhatsApp Link
  const waBtn = document.getElementById('sim-btn-whatsapp-apply');
  if (waBtn) {
    const msg = encodeURIComponent(
      'Hi Grillista Team, I used the Advanced Profit Simulator for ' + model.name + ':
' +
      '• Projected Footfall: ' + cust + ' customers/day
' +
      '• Avg Ticket Size: ₹' + ticket + '
' +
      '• Projected Monthly Sales: ' + fmt(monthlySale) + '
' +
      '• Estimated Net Profit: ' + fmt(netMonthlyProfit) + '/mo
' +
      '• Estimated Payback: ~' + paybackMonths + ' Months
' +
      'I would like to apply for franchise allotment in my target city.'
    );
    waBtn.href = 'https://wa.me/916386818682?text=' + msg;
  }
};

window.downloadSimulatorProspectus = function() {
  const s = window.simulatorState;
  const m = s.models[s.model];
  const dailySale = s.customers * s.ticket;
  const monthlySale = dailySale * 30;
  const foodCost = Math.round(monthlySale * 0.30);
  const royalty = Math.round(monthlySale * 0.05);
  const opex = s.rent + s.staff + s.electricity + s.marketing + s.misc;
  const netStandard = monthlySale - (foodCost + royalty + opex);
  const netHoliday = monthlySale - (foodCost + opex);
  const fmt = (n) => 'Rs. ' + Math.round(n).toLocaleString('en-IN');

  const text = 
=============================================================
           GRILLISTA FOODS - OFFICIAL FRANCHISE PROSPECTUS
                UNIT ECONOMICS & P&L FINANCIAL SIMULATION
=============================================================
Generated On: 
Model Selected: 
Required Floor Space: 
Total Setup Investment (Capex): 

-------------------------------------------------------------
1. REVENUE DRIVERS
-------------------------------------------------------------
• Daily Customer Footfall:  Customers / Day
• Average Ticket / Billing Size: Rs.  / Order
• Average Daily Sale: 
• Monthly Gross Sales (30-Day Cycle): 

-------------------------------------------------------------
2. MONTHLY EXPENSES & COGS BREAKDOWN
-------------------------------------------------------------
• Food Cost (COGS @ 30%): - 
• Brand Royalty (5% - 6 Months Free Holiday): - 
• Store Rent: - 
• Staff Wages & Kitchen Team: - 
• Electricity & Utilities: - 
• Local Marketing & Promotion: - 
• Miscellaneous Contingency: - 
• Total Monthly Overheads: - 

-------------------------------------------------------------
3. ESTIMATED NET PROFITABILITY & ROI
-------------------------------------------------------------
• Net Monthly Profit (Standard 5% Royalty):  / month
• Net Monthly Profit (First 6 Months @ 0% Royalty):  / month
• Annual Net Profit (Year 1 with Royalty Holiday):  / year
• Estimated Capital Payback Period: ~ Months
• Net Profit Margin: %

-------------------------------------------------------------
4. FRANCHISE SUPPORT INCLUDED
-------------------------------------------------------------
✓ Master Kitchen Raw Material Supply (100% Quality Controlled)
✓ Store Location Scouting & Architect 3D Layout Assistance
✓ 14-Day Comprehensive Staff & Chef Training in Kanpur
✓ POS Billing Software, Inventory Automation & CRM Setup
✓ Zomato & Swiggy Onboarding with High-Conversion Menu SEO
✓ 360-Degree Digital Marketing & Hyperlocal Grand Launch Campaigns

=============================================================
Corporate Headquarters:
RK Group of Industries, VR Tower, Juhi Kala, Kanpur, UP - 208014
Phone: +91 63868 18682 | Email: grillistakanpur@gmail.com
Official Portal: https://grillista.in
=============================================================;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = Grillista__Financial_Prospectus.txt;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Auto-bind Escape and Backdrop clicks
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('profit-simulator-modal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) window.closeProfitSimulatorModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      window.closeProfitSimulatorModal();
    }
  });
});
