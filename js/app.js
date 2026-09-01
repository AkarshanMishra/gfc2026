/**
 * GRILLISTA - Main Application Orchestrator
 * High-performance, reactive, vanilla ES6 application
 */

import { CONFIG } from './config.js';
import { MENU_ITEMS, COUPONS } from './data.js';
import { Cart } from './cart.js';
import { FranchiseManager } from './franchise.js';
import { StoreLocator } from './locator.js';
import { ApiService } from './api.js';
import { Security } from './security.js';

class App {
  constructor() {
    this.activeCategory = 'all';
    this.vegOnlyFilter = false;
    this.spicyOnlyFilter = false;
    this.searchQuery = '';
    this.activeCustomizingItem = null;
    this.selectedModifiers = [];
  }

  init() {
    this.setupUI();
    this.renderMenu();
    this.setupMenuFilters();
    this.setupFranchisePortal();
    this.setupStoreLocator();
    this.loadRealTimeReviews();
    this.setupReviewSubmission();
    this.setupMobileMenu();
    this.setupLiveTicker();
    this.setupFaqAccordion();
    this.setupHomeFranchiseForm();

    console.log(`%c 🍔 ${CONFIG.BRAND.name} %c Desi Burgers, Global Swag - Ready!`, 'background: #0F4C2A; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;', 'color: #FFA000;');
  }

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let icon = '🍔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'fire') icon = '🔥';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">${Security.escapeHTML(message)}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    const close = () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, duration);
  }

  // -------------------------------------------------------------
  // LIVE TICKER & BRAND STATS
  // -------------------------------------------------------------
  setupLiveTicker() {
    const ticker = document.getElementById('live-ticker-text');
    if (ticker) {
      const messages = [
        '🔥 Made Fresh to Order with 100% Indian Desi Fusion Spices!',
        '📍 Over 180+ Outlets Active Across 28+ Cities in India!',
        '🌶️ Try the new Bihari Bhoot Jholokia Burger - If you dare!',
        '💼 High-ROI Franchise Expansion open for Tier-1 & Tier-2 cities!',
        '⭐ 4.8 Rating from over 12 Million Happy Foodies Nationwide!'
      ];
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % messages.length;
        ticker.style.opacity = '0';
        setTimeout(() => {
          ticker.textContent = messages[idx];
          ticker.style.opacity = '1';
        }, 300);
      }, 5000);
    }
  }

  // -------------------------------------------------------------
  // MENU PRESENTATION SYSTEM
  // -------------------------------------------------------------
  renderMenu() {
    const grid = document.getElementById('menu-grid');
    const emptyState = document.getElementById('menu-empty');
    if (!grid) return;

    let items = MENU_ITEMS.filter(item => {
      if (this.activeCategory !== 'all' && item.category !== this.activeCategory) return false;
      if (this.vegOnlyFilter && !item.isVeg) return false;
      if (this.spicyOnlyFilter && !item.isSpicy) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });

    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = items.map(item => {
      const spiceIcons = item.spiceLevel > 0 
        ? '🌶️'.repeat(item.spiceLevel) 
        : '';
      
      const badgeHtml = item.isBestseller
        ? `<span class="badge badge-bestseller"><i class="badge-icon">⭐</i> Bestseller</span>`
        : item.tags?.[0] ? `<span class="badge badge-tag">${Security.escapeHTML(item.tags[0])}</span>` : '';

      return `
        <article class="food-card" data-id="${item.id}">
          <div class="food-image-wrapper">
            <img src="${item.image}" alt="${Security.escapeHTML(item.name)}" loading="lazy" class="food-img" onerror="this.src='https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'">
            <div class="food-badges">
              <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}" title="${item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                <span class="diet-dot"></span>
              </span>
              ${badgeHtml}
            </div>
            <div class="food-macro-tag">
              <span>${item.calories} kcal</span> • <span>${item.protein} protein</span>
            </div>
          </div>
          <div class="food-details">
            <div class="food-header">
              <h3 class="food-title">${Security.escapeHTML(item.name)}</h3>
              <span class="food-spice" title="Spice level">${spiceIcons}</span>
            </div>
            <p class="food-desc">${Security.escapeHTML(item.description)}</p>
            <div class="food-footer">
              <div class="food-price-wrap">
                <span class="food-currency">₹</span>
                <span class="food-price">${item.price}</span>
              </div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #0F4C2A; background: rgba(15, 76, 42, 0.08); padding: 4px 10px; border-radius: 20px;">
                ✨ Fresh Made
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  setupMenuFilters() {
    // Category Tabs
    const tabs = document.querySelectorAll('.menu-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.dataset.category || 'all';
        this.renderMenu();
      });
    });

    // Veg Toggle
    const vegBtn = document.getElementById('filter-veg-only');
    if (vegBtn) {
      vegBtn.addEventListener('click', () => {
        this.vegOnlyFilter = !this.vegOnlyFilter;
        vegBtn.classList.toggle('active', this.vegOnlyFilter);
        this.renderMenu();
      });
    }

    // Spicy Toggle
    const spicyBtn = document.getElementById('filter-spicy-only');
    if (spicyBtn) {
      spicyBtn.addEventListener('click', () => {
        this.spicyOnlyFilter = !this.spicyOnlyFilter;
        spicyBtn.classList.toggle('active', this.spicyOnlyFilter);
        this.renderMenu();
      });
    }

    // Search Input
    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.renderMenu();
        }, 200);
      });
    }
  }

  // -------------------------------------------------------------
  // GLOBAL UI SETUP & MODAL HANDLERS
  // -------------------------------------------------------------
  setupUI() {
    // Hero Franchise Owner CTA click
    document.getElementById('btn-hero-franchise-owner')?.addEventListener('click', () => {
      const target = document.getElementById('franchise-apply') || document.getElementById('franchise');
      target?.scrollIntoView({ behavior: 'smooth' });
    });

    // Bulk Order Modal
    const bulkModal = document.getElementById('bulk-order-modal');
    document.getElementById('btn-hero-bulk-order')?.addEventListener('click', () => {
      bulkModal?.classList.add('active');
    });
    bulkModal?.querySelector('.modal-close')?.addEventListener('click', () => {
      bulkModal.classList.remove('active');
    });
    bulkModal?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      bulkModal.classList.remove('active');
    });

    document.getElementById('bulk-order-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('bulk-name')?.value || 'Guest';
      const phone = document.getElementById('bulk-phone')?.value || '';
      if (!Security.validators.phone(phone)) {
        this.showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }
      this.showToast(`Bulk order request received! Our team will call ${name} shortly.`, 'success', 5000);
      bulkModal?.classList.remove('active');
      e.target.reset();
    });

    // Property Partners Modal
    const propModal = document.getElementById('property-modal');
    document.getElementById('nav-property-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      propModal?.classList.add('active');
    });
    propModal?.querySelector('.modal-close')?.addEventListener('click', () => {
      propModal.classList.remove('active');
    });
    propModal?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      propModal.classList.remove('active');
    });

    document.getElementById('property-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.showToast('Property details received! Our real estate expansion head will review it within 48h.', 'success', 5000);
      propModal?.classList.remove('active');
      e.target.reset();
    });
  }

  // -------------------------------------------------------------
  // FRANCHISE CALCULATOR & INQUIRY SYSTEM
  // -------------------------------------------------------------
  setupFranchisePortal() {
    const modelCards = document.querySelectorAll('.franchise-model-card');
    const ordersSlider = document.getElementById('roi-orders-slider');
    const ordersValDisplay = document.getElementById('roi-orders-val');

    modelCards.forEach(card => {
      card.addEventListener('click', () => {
        modelCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const modelKey = card.dataset.model || 'express';
        FranchiseManager.selectedModel = modelKey;

        // Auto-set default customer benchmark
        const defaultCust = modelKey === 'express' ? 50 : modelKey === 'bistro' ? 80 : 120;
        FranchiseManager.dailyCustomers = defaultCust;
        if (ordersSlider) ordersSlider.value = defaultCust;
        if (ordersValDisplay) ordersValDisplay.textContent = `${defaultCust} Customers / Day`;

        this.updateROICalculator();
      });
    });

    // Daily Customers Slider
    ordersSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      FranchiseManager.dailyCustomers = val;
      if (ordersValDisplay) ordersValDisplay.textContent = `${val} Customers / Day`;
      this.updateROICalculator();
    });

    // Initial Calculation
    this.updateROICalculator();

    // Franchise Inquiry Form
    const form = document.getElementById('franchise-inquiry-form');
    const formStatus = document.getElementById('franchise-form-status');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      FranchiseManager.handleInquirySubmit(form, (status) => {
        if (status.loading) {
          formStatus.innerHTML = `<div class="text-warning" style="margin-top: 14px;"><span class="spinner-inline"></span> ${Security.escapeHTML(status.message)}</div>`;
          return;
        }

        if (status.success) {
          formStatus.innerHTML = `
            <div class="alert alert-success animate-fade-in" style="margin-top: 14px; padding: 18px; border-radius: 8px; background: rgba(46, 125, 50, 0.1); border: 1px solid #2E7D32;">
              <h4 style="color: #2E7D32; font-weight: 800; margin-bottom: 6px;">Application Submitted Successfully! 🎉</h4>
              <p>Reference Token: <strong>${status.referenceId}</strong></p>
              <p style="margin: 0; color: #4A5568;">Our expansion team will contact you on WhatsApp / Phone within 24 hours.</p>
            </div>
          `;
          form.reset();
          this.showToast(`Franchise inquiry #${status.referenceId} registered!`, 'success', 5000);
        } else {
          formStatus.innerHTML = `
            <div class="alert alert-danger" style="margin-top: 14px; padding: 14px; border-radius: 8px; background: rgba(200, 35, 43, 0.1); border: 1px solid var(--bs-red); color: var(--bs-red);">
              ⚠️ ${Security.escapeHTML(status.message)}
            </div>
          `;
        }
      });
    });

    // Slide 7 Tab Switching (Before You Open / After You Open)
    const btnBefore = document.getElementById('btn-tab-before');
    const btnAfter = document.getElementById('btn-tab-after');
    const panelBefore = document.getElementById('panel-before');
    const panelAfter = document.getElementById('panel-after');

    btnBefore?.addEventListener('click', () => {
      btnBefore.classList.add('active');
      btnAfter?.classList.remove('active');
      panelBefore?.classList.add('active');
      panelAfter?.classList.remove('active');
    });

    btnAfter?.addEventListener('click', () => {
      btnAfter.classList.add('active');
      btnBefore?.classList.remove('active');
      panelAfter?.classList.add('active');
      panelBefore?.classList.remove('active');
    });

    // Download Franchise Pitch Deck Trigger
    document.getElementById('btn-download-deck')?.addEventListener('click', () => {
      FranchiseManager.exportProspectus();
      this.showToast('Official financial prospectus downloaded!', 'success');
    });
  }

  updateROICalculator() {
    const data = FranchiseManager.calculateROI();

    const titleEl = document.getElementById('roi-model-title');
    const badgeEl = document.getElementById('roi-selected-badge');
    const areaEl = document.getElementById('roi-area-req');
    const bracketEl = document.getElementById('roi-bracket-display');
    const capexEl = document.getElementById('roi-total-capex');
    const dailySaleEl = document.getElementById('roi-daily-sale');
    const monthlySaleEl = document.getElementById('roi-monthly-sale');
    const monthlyRevEl = document.getElementById('roi-monthly-revenue');
    const foodCostEl = document.getElementById('roi-food-cost');
    const royaltyEl = document.getElementById('roi-royalty');
    const profitEl = document.getElementById('roi-monthly-profit');
    const annualProfitEl = document.getElementById('roi-annual-profit');
    const paybackEl = document.getElementById('roi-payback-months');
    const marginEl = document.getElementById('roi-margin-percent');

    if (titleEl) titleEl.textContent = data.modelName;
    if (badgeEl) badgeEl.textContent = data.modelName;
    if (areaEl) areaEl.textContent = data.areaRequired;
    if (bracketEl) bracketEl.textContent = data.investmentBracket;
    if (capexEl) capexEl.textContent = FranchiseManager.formatINR(data.totalInvestment);
    if (dailySaleEl) dailySaleEl.textContent = FranchiseManager.formatINR(data.dailySale);
    if (monthlySaleEl) monthlySaleEl.textContent = FranchiseManager.formatINR(data.monthlySale);
    if (monthlyRevEl) monthlyRevEl.textContent = FranchiseManager.formatINR(data.monthlySale);
    if (foodCostEl) foodCostEl.textContent = FranchiseManager.formatINR(data.foodCost);
    if (royaltyEl) royaltyEl.textContent = FranchiseManager.formatINR(data.royalty);
    if (profitEl) profitEl.textContent = FranchiseManager.formatINR(data.netProfit);
    if (annualProfitEl) annualProfitEl.textContent = FranchiseManager.formatINR(data.annualProfit);
    if (paybackEl) paybackEl.textContent = `~${data.paybackMonths} Months`;
    if (marginEl) marginEl.textContent = `${data.marginPercent}%`;
  }

  // -------------------------------------------------------------
  // STORE LOCATOR & LIVE NOMINATIM API
  // -------------------------------------------------------------
  setupStoreLocator() {
    const searchInput = document.getElementById('store-search-input');
    const cityFilter = document.getElementById('store-city-filter');
    const locateBtn = document.getElementById('btn-locate-me');
    const storesGrid = document.getElementById('stores-grid');

    const renderStores = async () => {
      storesGrid.innerHTML = `
        <div class="store-loading">
          <div class="spinner-flame"></div>
          <p>Scanning real-time outlet coordinates...</p>
        </div>
      `;

      const q = searchInput?.value || '';
      const city = cityFilter?.value || 'all';

      const { outlets, searchCoords } = await StoreLocator.findOutlets(q, city);

      if (outlets.length === 0) {
        storesGrid.innerHTML = `
          <div class="store-empty">
            <p>No Grillista outlet found matching your query in this area.</p>
            <p class="subtext">Want to open an outlet in this city? <a href="#franchise" class="text-primary">Apply for a Franchise</a>!</p>
          </div>
        `;
        return;
      }

      storesGrid.innerHTML = outlets.map(store => `
        <div class="store-card animate-fade-in">
          <div class="store-card-header">
            <div>
              <h4 class="store-name">${Security.escapeHTML(store.name)}</h4>
              <span class="store-city-tag">${Security.escapeHTML(store.city)}</span>
            </div>
            <span class="store-status-badge ${store.isOpenNow ? 'open' : 'closed'}">
              ${store.isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
            </span>
          </div>

          <p class="store-address">${Security.escapeHTML(store.address)}</p>

          <div class="store-meta-row">
            <span>⭐ ${store.rating} (${store.reviewsCount} reviews)</span>
            ${store.distance !== null ? `<span class="store-distance">📍 ${store.distance} km away</span>` : ''}
          </div>

          <div class="store-formats">
            ${store.formats.map(f => `<span class="format-pill">${Security.escapeHTML(f)}</span>`).join('')}
          </div>

          <div class="store-card-actions">
            <a href="tel:${store.phone}" class="btn btn-sm btn-outline-secondary">
              📞 Call
            </a>
            <a href="${store.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
              🗺️ Directions
            </a>
          </div>
        </div>
      `).join('');
    };

    // Events
    let debounce;
    searchInput?.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(renderStores, 400);
    });

    cityFilter?.addEventListener('change', renderStores);

    locateBtn?.addEventListener('click', async () => {
      locateBtn.disabled = true;
      locateBtn.innerHTML = `<span>Locating...</span>`;

      try {
        const coords = await StoreLocator.getUserCoordinates();
        this.showToast(`Found your location near ${coords.locality || 'your area'}!`, 'success');
        if (searchInput) searchInput.value = coords.locality || '';
        await renderStores();
      } catch (err) {
        this.showToast(err.message, 'error');
      } finally {
        locateBtn.disabled = false;
        locateBtn.innerHTML = `<span>🎯 Locate Me</span>`;
      }
    });

    // Initial render
    renderStores();
  }

  // -------------------------------------------------------------
  // REAL-TIME REVIEWS & TESTIMONIALS
  // -------------------------------------------------------------
  async loadRealTimeReviews() {
    const container = document.getElementById('reviews-carousel');
    if (!container) return;

    container.innerHTML = `
      <div class="review-loader">
        <div class="spinner-flame"></div>
        <p>Loading real-time verified foodie reviews...</p>
      </div>
    `;

    const reviews = await ApiService.fetchLiveCustomerReviews();

    container.innerHTML = reviews.map(rev => `
      <div class="review-card">
        <div class="review-header">
          <img src="${rev.avatar}" alt="${Security.escapeHTML(rev.name)}" class="review-avatar" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'">
          <div class="review-user-info">
            <h4 class="review-name">${Security.escapeHTML(rev.name)}</h4>
            <span class="review-city">📍 ${Security.escapeHTML(rev.city)}</span>
          </div>
        </div>
        <div class="review-stars">
          ${'⭐'.repeat(rev.rating)}
          <span class="verified-badge">✓ Verified Burger Lover</span>
        </div>
        <p class="review-text">"${Security.escapeHTML(rev.comment)}"</p>
        <span class="review-date">${rev.date}</span>
      </div>
    `).join('');
  }

  setupReviewSubmission() {
    const modal = document.getElementById('add-review-modal');
    const openBtn = document.getElementById('btn-open-review-modal');
    const form = document.getElementById('user-review-form');

    openBtn?.addEventListener('click', () => modal?.classList.add('active'));
    modal?.querySelector('.modal-close')?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.querySelector('.modal-backdrop')?.addEventListener('click', () => modal.classList.remove('active'));

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('review-input-name').value;
      const city = document.getElementById('review-input-city').value;
      const rating = parseInt(document.getElementById('review-input-rating').value) || 5;
      const comment = document.getElementById('review-input-comment').value;

      if (!Security.validators.name(name) || !Security.validators.safeString(comment, 5, 300)) {
        this.showToast('Please provide a valid name and a meaningful review.', 'error');
        return;
      }

      const newReview = {
        name: Security.escapeHTML(name),
        city: Security.escapeHTML(city || 'India'),
        rating,
        comment: Security.escapeHTML(comment),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        date: 'Just now',
        verifiedBuyer: true
      };

      const stored = Security.storage.get(CONFIG.STORAGE_KEYS.REVIEWS, []);
      stored.unshift(newReview);
      Security.storage.set(CONFIG.STORAGE_KEYS.REVIEWS, stored);

      this.showToast('Thank you for sharing your love for Grillista!', 'success');
      form.reset();
      modal.classList.remove('active');
      this.loadRealTimeReviews();
    });
  }

  // -------------------------------------------------------------
  // MOBILE MENU & RESPONSIVENESS
  // -------------------------------------------------------------
  setupMobileMenu() {
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.querySelector('.bs-nav-cluster') || document.getElementById('primary-nav-menu');

    // Create or find backdrop
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    const openMenu = () => {
      navMenu?.classList.add('mobile-open');
      navToggle?.classList.add('is-active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navMenu?.classList.remove('mobile-open');
      navToggle?.classList.remove('is-active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    navToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu?.classList.contains('mobile-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener('click', closeMenu);

    // Close menu when clicking any nav link
    navMenu?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu?.classList.contains('mobile-open')) {
        closeMenu();
      }
    });
  }

  // -------------------------------------------------------------
  // FAQ ACCORDION HANDLER
  // -------------------------------------------------------------
  setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-bar-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const header = item.querySelector('.faq-bar-header');
      header?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items (optional accordion mode)
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-bar-header');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  setupQuickSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('floating-quick-sidebar');
    if (!toggleBtn || !sidebar) return;

    toggleBtn.onclick = (e) => {
      if (e) e.preventDefault();
      sidebar.classList.toggle('collapsed');
    };
  }

  // -------------------------------------------------------------
  // HOMEPAGE FRANCHISE APPLICATION HANDLER
  // -------------------------------------------------------------
  setupHomeFranchiseForm() {
    const form = document.getElementById('home-franchise-form');
    const successBox = document.getElementById('franchise-success-message');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('f-name')?.value.trim();
      const phone = document.getElementById('f-phone')?.value.trim();
      const email = document.getElementById('f-email')?.value.trim();
      const city = document.getElementById('f-city')?.value.trim();
      const model = document.getElementById('f-model')?.value;
      const budget = document.getElementById('f-budget')?.value;
      const property = document.getElementById('f-property')?.value;
      const message = document.getElementById('f-message')?.value.trim();

      if (!name || !phone || !email || !city || !model || !budget || !property) {
        this.showToast('Please fill out all required application fields.', 'error');
        return;
      }

      const inquiry = {
        name: Security.escapeHTML(name),
        phone: Security.escapeHTML(phone),
        email: Security.escapeHTML(email),
        city: Security.escapeHTML(city),
        model,
        budget,
        property,
        message: Security.escapeHTML(message || ''),
        submittedAt: new Date().toISOString()
      };

      const existing = Security.storage.get('grillista_franchise_inquiries', []);
      existing.unshift(inquiry);
      Security.storage.set('grillista_franchise_inquiries', existing);

      this.showToast('🎉 Franchise application submitted successfully! Our team will contact you.', 'success', 5000);
      
      form.style.display = 'none';
      if (successBox) {
        successBox.classList.add('active');
      }
    });
  }
}

// Global fallback toggle
window.toggleQuickSidebar = function() {
  const sidebar = document.getElementById('floating-quick-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
};

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  app.setupQuickSidebar();
});

