/**
 * GRILLISTA - Franchise Business & ROI Calculation Engine
 * Powering the franchise portal, interactive financial model, and multi-step inquiry validator
 */

import { CONFIG } from './config.js';
import { Security } from './security.js';
import { ApiService } from './api.js';

export const FranchiseManager = {
  selectedModel: 'express',
  dailyCustomers: 50,
  avgBillingSize: 170,

  /**
   * Calculate detailed financial projections based on exact user specification
   */
  calculateROI() {
    const model = CONFIG.FRANCHISE.MODELS[this.selectedModel] || CONFIG.FRANCHISE.MODELS.express;
    const customers = this.dailyCustomers || model.defaultCustomers;
    const avgBilling = this.avgBillingSize || CONFIG.FRANCHISE.DEFAULT_AVG_BILLING;

    // Daily & Monthly Sales (30 Days)
    const dailySale = Math.round(customers * avgBilling);
    const monthlySale = Math.round(dailySale * 30);

    // Cost Breakdown
    const foodCost = Math.round(monthlySale * CONFIG.FRANCHISE.FOOD_COST_PERCENT); // 30%
    const royalty = Math.round(monthlySale * CONFIG.FRANCHISE.ROYALTY_PERCENT);   // 5% (6 months free)
    const rent = model.rent;
    const staff = model.staff;
    const electricity = model.electricity;
    const marketing = model.marketing;
    const misc = model.misc;

    const totalMonthlyOpex = foodCost + royalty + rent + staff + electricity + marketing + misc;
    const netProfit = Math.max(0, monthlySale - totalMonthlyOpex);
    const netProfitRoyaltyFree = Math.max(0, monthlySale - (foodCost + rent + staff + electricity + marketing + misc));
    const annualProfit = netProfit * 12;

    const totalInvestment = model.equipment + model.interior + model.franchiseFee + model.stationary;
    const paybackMonths = netProfit > 0 ? (totalInvestment / netProfit).toFixed(1) : 'N/A';
    const annualRoiPercent = ((annualProfit / totalInvestment) * 100).toFixed(1);

    return {
      modelKey: model.id,
      modelName: model.name,
      areaRequired: model.areaReq,
      investmentBracket: model.investmentBracket,
      totalInvestment,
      equipment: model.equipment,
      interior: model.interior,
      franchiseFee: model.franchiseFee,
      stationary: model.stationary,
      dailyCustomers: customers,
      avgBillingSize: avgBilling,
      dailySale,
      monthlySale,
      foodCost,
      royalty,
      rent,
      staff,
      electricity,
      marketing,
      misc,
      totalMonthlyOpex,
      netProfit,
      netProfitRoyaltyFree,
      annualProfit,
      paybackMonths,
      annualRoiPercent,
      marginPercent: ((netProfit / monthlySale) * 100).toFixed(1)
    };
  },

  /**
   * Format numbers to Indian Currency string (e.g. ₹ 45,750 or ₹ 12 Lakhs)
   */
  formatINR(val, compact = false) {
    if (typeof val !== 'number' || isNaN(val)) return '₹0';
    if (compact) {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    }
    return '₹ ' + val.toLocaleString('en-IN');
  },

  /**
   * Generates downloadable official financial prospectus text
   */
  exportProspectus() {
    const p = this.calculateROI();
    const text = `
================================================================================
          GRILLISTA - THE ULTIMATE FOOD CHAIN | FRANCHISE PROSPECTUS
================================================================================
Model: ${p.modelName}
Area Required: ${p.areaRequired}
Investment Bracket: ${p.investmentBracket}

[CAPEX / INVESTMENT BREAKDOWN]
• Commercial Kitchen Equipment: ${this.formatINR(p.equipment)}
• Store Interior & Ambient Buildout: ${this.formatINR(p.interior)}
• Brand Franchise Fee: ${this.formatINR(p.franchiseFee)}
• Stationary, Uniforms & POS Setup: ${this.formatINR(p.stationary)}
--------------------------------------------------------------------------------
TOTAL INITIAL INVESTMENT: ${this.formatINR(p.totalInvestment)}

[MONTHLY P&L ESTIMATION (30-DAY MONTH)]
• Daily Customer Footfall: ${p.dailyCustomers} Customers / day
• Average Billing Size: ${this.formatINR(p.avgBillingSize)}
• Average Daily Sale: ${this.formatINR(p.dailySale)}
• Average Monthly Gross Sale: ${this.formatINR(p.monthlySale)}

[OPERATING EXPENDITURES]
• Food Cost (30%): ${this.formatINR(p.foodCost)}
• Brand Royalty (5% - First 6 Months Free!): ${this.formatINR(p.royalty)}
• Store Rental (Estimated): ${this.formatINR(p.rent)}
• Staff Salaries: ${this.formatINR(p.staff)}
• Electricity & Utilities: ${this.formatINR(p.electricity)}
• Local Marketing & Promotion: ${this.formatINR(p.marketing)}
• Miscellaneous Contingency: ${this.formatINR(p.misc)}
--------------------------------------------------------------------------------
TOTAL MONTHLY OPEX: ${this.formatINR(p.totalMonthlyOpex)}

[NET FINANCIAL RETURN]
• Monthly Net Profit: ${this.formatINR(p.netProfit)} (₹${p.netProfitRoyaltyFree.toLocaleString('en-IN')} in first 6 months)
• Annual Net Profit: ${this.formatINR(p.annualProfit)}
• Profit Margin: ${p.marginPercent}%
• Estimated Capital Payback Period: ~${p.paybackMonths} Months
• Estimated Annual ROI: ${p.annualRoiPercent}%

================================================================================
Corporate HQ: DLF Cyber City, Gurugram | Flagship: Kakadeo & Barra, Kanpur
Helpline: +91 90290 20888 | Email: franchise@grillista.in
================================================================================
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Grillista_Franchise_ROI_${p.modelKey.toUpperCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Validates and submits the franchise inquiry
   */
  async handleInquirySubmit(formElement, feedbackCallback) {
    const formData = new FormData(formElement);
    const rawData = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      preferredCity: formData.get('preferredCity') || '',
      investmentBudget: formData.get('investmentBudget') || '',
      model: formData.get('model') || this.selectedModel,
      hasCommercialSpace: formData.get('hasCommercialSpace') === 'yes',
      notes: formData.get('notes') || ''
    };

    // Strict validation
    if (!Security.validators.name(rawData.name)) {
      return feedbackCallback({ success: false, message: 'Please enter a valid full name (minimum 2 characters).' });
    }
    if (!Security.validators.email(rawData.email)) {
      return feedbackCallback({ success: false, message: 'Please enter a valid business email address.' });
    }
    if (!Security.validators.phone(rawData.phone)) {
      return feedbackCallback({ success: false, message: 'Please enter a valid 10-digit Indian contact number.' });
    }
    if (!Security.validators.safeString(rawData.preferredCity, 2, 80)) {
      return feedbackCallback({ success: false, message: 'Please specify your target city or location.' });
    }

    feedbackCallback({ loading: true, message: 'Securing transmission & verifying application...' });

    const result = await ApiService.submitFranchiseApplication(rawData);
    feedbackCallback(result);
  }
};
