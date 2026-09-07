/**
 * GRILLISTA - Dedicated FAQ Controller
 * High-performance, zero-dependency, fail-proof accordion & category filtering
 */

(function() {
  'use strict';

  // 1. Toggle single FAQ card
  function toggleFaqItem(cardElement) {
    if (!cardElement) return;
    const isAlreadyActive = cardElement.classList.contains('active');
    const allCards = document.querySelectorAll('.faq-item-card');

    allCards.forEach(function(card) {
      card.classList.remove('active');
      const headBtn = card.querySelector('.faq-item-head');
      if (headBtn) headBtn.setAttribute('aria-expanded', 'false');
      const icon = card.querySelector('.faq-plus-icon');
      if (icon) icon.textContent = '+';
    });

    if (!isAlreadyActive) {
      cardElement.classList.add('active');
      const headBtn = cardElement.querySelector('.faq-item-head');
      if (headBtn) headBtn.setAttribute('aria-expanded', 'true');
      const icon = cardElement.querySelector('.faq-plus-icon');
      if (icon) icon.textContent = '−';
    }
  }

  // 2. Filter FAQ by Category
  function filterFaqByCategory(category) {
    const allCards = document.querySelectorAll('.faq-item-card');
    const allPills = document.querySelectorAll('.faq-pill-btn');

    allPills.forEach(function(pill) {
      const pillCat = pill.getAttribute('data-faq-cat');
      if (pillCat === category) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });

    allCards.forEach(function(card) {
      const cardCats = (card.getAttribute('data-category') || '').toLowerCase();
      if (category === 'all' || cardCats.includes(category.toLowerCase())) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // 3. Expose global helper functions immediately for inline onclick handlers
  window.toggleMockupFaq = function(element) {
    const card = element ? element.closest('.faq-item-card') : null;
    toggleFaqItem(card);
  };

  window.toggleFaqCard = window.toggleMockupFaq;
  window.filterFaqCategory = filterFaqByCategory;

  // 4. Attach event delegation on document click (Works 100% reliably)
  document.addEventListener('click', function(e) {
    // Check if clicked inside FAQ item header
    const headBtn = e.target.closest('.faq-item-head');
    if (headBtn) {
      e.preventDefault();
      const card = headBtn.closest('.faq-item-card');
      toggleFaqItem(card);
      return;
    }

    // Check if clicked on category pill button
    const pillBtn = e.target.closest('.faq-pill-btn');
    if (pillBtn) {
      e.preventDefault();
      const cat = pillBtn.getAttribute('data-faq-cat') || 'all';
      filterFaqByCategory(cat);
      return;
    }
  });

  // 5. Initialize when DOM is ready
  function initFaq() {
    // Ensure initial active card has minus icon
    const activeCard = document.querySelector('.faq-item-card.active');
    if (activeCard) {
      const icon = activeCard.querySelector('.faq-plus-icon');
      if (icon) icon.textContent = '−';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();
