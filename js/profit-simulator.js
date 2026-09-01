/**
 * GRILLISTA - Profit Simulator Engine & Modal Controller
 * Provides interactive P&L simulation for Express, Bistro, and Signature models
 */

window.simulatorState = {
  model: 'express',
  customers: 50,
  ticket: 170,
  models: {
    express: {
      name: 'Grillista Express',
      defaultCust: 50,
      capex: 1150000,
      rent: 50000,
      staff: 40000,
      electricity: 10000,
      marketing: 10000,
      misc: 10000
    },
    bistro: {
      name: 'Grillista Bistro',
      defaultCust: 80,
      capex: 2150000,
      rent: 50000,
      staff: 40000,
      electricity: 10000,
      marketing: 10000,
      misc: 10000
    },
    signature: {
      name: 'Grillista Signature',
      defaultCust: 120,
      capex: 3150000,
      rent: 50000,
      staff: 40000,
      electricity: 10000,
      marketing: 10000,
      misc: 10000
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
    window.updateSimulatorCalc();
  }
};

window.closeProfitSimulatorModal = function() {
  const modal = document.getElementById('profit-simulator-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.switchSimulatorModel = function(modelKey) {
  window.simulatorState.model = modelKey;
  const modelConfig = window.simulatorState.models[modelKey];
  window.simulatorState.customers = modelConfig.defaultCust;
  
  const custSlider = document.getElementById('sim-cust-slider');
  if (custSlider) custSlider.value = modelConfig.defaultCust;

  ['express', 'bistro', 'signature'].forEach(k => {
    const btn = document.getElementById('sim-tab-' + k);
    if (btn) {
      if (k === modelKey) {
        btn.style.background = '#D32323';
        btn.style.color = '#FFFFFF';
        btn.style.borderColor = '#D32323';
      } else {
        btn.style.background = '#F8FAFC';
        btn.style.color = '#475569';
        btn.style.borderColor = '#E2E8F0';
      }
    }
  });

  window.updateSimulatorCalc();
};

window.updateSimulatorCalc = function() {
  const custSlider = document.getElementById('sim-cust-slider');
  const ticketSlider = document.getElementById('sim-ticket-slider');
  
  if (custSlider) window.simulatorState.customers = parseInt(custSlider.value) || 50;
  if (ticketSlider) window.simulatorState.ticket = parseInt(ticketSlider.value) || 170;

  const cust = window.simulatorState.customers;
  const ticket = window.simulatorState.ticket;
  const model = window.simulatorState.models[window.simulatorState.model] || window.simulatorState.models.express;

  const dailySale = Math.round(cust * ticket);
  const monthlySale = Math.round(dailySale * 30);
  const foodCost = Math.round(monthlySale * 0.30);
  const royalty = Math.round(monthlySale * 0.05);
  const fixedOverheads = model.rent + model.staff + model.electricity + model.marketing + model.misc;

  const totalOpex = foodCost + royalty + fixedOverheads;
  const netProfit = Math.max(0, monthlySale - totalOpex);
  const netProfitRoyaltyFree = Math.max(0, monthlySale - (foodCost + fixedOverheads));
  const annualProfit = netProfit * 12;
  const paybackMonths = netProfit > 0 ? (model.capex / netProfit).toFixed(1) : 'N/A';

  const fmt = (n) => '₹ ' + n.toLocaleString('en-IN');

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('sim-cust-display', cust + ' Cust / Day');
  setEl('sim-ticket-display', '₹' + ticket + ' / bill');
  setEl('sim-daily-sale', fmt(dailySale));
  setEl('sim-monthly-sale', fmt(monthlySale));
  setEl('sim-food-cost', '- ' + fmt(foodCost));
  setEl('sim-royalty', '- ' + fmt(royalty));
  setEl('sim-net-profit', fmt(netProfit) + ' / mo');
  setEl('sim-net-profit-initial', '⭐ ' + fmt(netProfitRoyaltyFree) + ' / mo during first 6 months (0% Royalty)');
  setEl('sim-annual-profit', fmt(annualProfit) + ' / yr');
  setEl('sim-payback', 'Payback: ~' + paybackMonths + ' Months');
};

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
