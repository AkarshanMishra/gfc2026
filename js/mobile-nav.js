/**
 * GRILLISTA - Universal Mobile Navigation Controller
 * Lightweight, zero-dependency, ultra-fast, works across all 10 pages
 */

(function() {
  function initMobileNav() {
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navCluster = document.querySelector('.bs-nav-cluster');
    
    // Ensure Backdrop exists in body
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    // Function to Open
    window.openMobileNav = function() {
      if (!navCluster) return;
      navCluster.classList.add('mobile-open');
      if (navToggle) navToggle.classList.add('is-active');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };

    // Function to Close
    window.closeMobileNav = function() {
      if (!navCluster) return;
      navCluster.classList.remove('mobile-open');
      if (navToggle) navToggle.classList.remove('is-active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    // Function to Toggle
    window.toggleMobileNav = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (navCluster && navCluster.classList.contains('mobile-open')) {
        window.closeMobileNav();
      } else {
        window.openMobileNav();
      }
    };

    // Attach click listener to toggle button
    if (navToggle) {
      navToggle.onclick = window.toggleMobileNav;
    }

    // Attach click listener to backdrop
    if (backdrop) {
      backdrop.onclick = window.closeMobileNav;
    }

    // Attach close listener to all navigation links inside drawer
    if (navCluster) {
      const links = navCluster.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          window.closeMobileNav();
        });
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navCluster && navCluster.classList.contains('mobile-open')) {
        window.closeMobileNav();
      }
    });
  }

  // Run on DOM ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
