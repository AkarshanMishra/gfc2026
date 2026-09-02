/**
 * GRILLISTA - Universal Modern Mobile Navigation Controller v3.0
 * Pure zero-dependency, ultra-resilient, cross-device support
 */

(function() {
  function initMobileNav() {
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navCluster = document.querySelector('.bs-nav-cluster');
    if (!navCluster) return;

    // 1. Ensure Backdrop exists in body
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    // 2. Ensure Modern Drawer Header exists inside navCluster
    let drawerHeader = navCluster.querySelector('.mobile-drawer-header');
    if (!drawerHeader) {
      drawerHeader = document.createElement('div');
      drawerHeader.className = 'mobile-drawer-header';
      drawerHeader.innerHTML = `
        <div class="drawer-brand-box">
          <img src="assets/logo.png" alt="Grillista Logo" class="drawer-brand-logo">
          <div>
            <div class="drawer-brand-name">GRILLISTA</div>
            <div class="drawer-veg-pill">🌱 100% PURE VEG</div>
          </div>
        </div>
        <button type="button" class="drawer-close-btn" aria-label="Close Menu">✕</button>
      `;
      navCluster.insertBefore(drawerHeader, navCluster.firstChild);

      const closeBtn = drawerHeader.querySelector('.drawer-close-btn');
      if (closeBtn) {
        closeBtn.onclick = function(e) {
          e.preventDefault();
          window.closeMobileNav();
        };
      }
    }

    // 3. Ensure Modern Quick Hotlines Dock exists at bottom of navCluster
    let drawerHotlines = navCluster.querySelector('.mobile-drawer-hotlines');
    if (!drawerHotlines) {
      drawerHotlines = document.createElement('div');
      drawerHotlines.className = 'mobile-drawer-hotlines';
      drawerHotlines.innerHTML = `
        <a href="tel:+918767121212" class="bs-hotline-btn left-btn" title="Call Customer Support">
          <div class="hotline-top">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="#FFC72C"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z"/></svg>
            <span class="hotline-phone">+91 87671 21212</span>
          </div>
          <div class="hotline-label">FOR CUSTOMER SUPPORT</div>
        </a>
        <a href="https://wa.me/919029020888?text=Hi%20Grillista%20Team%2C%20I%20am%20interested%20in%20Franchise%20Opportunity" target="_blank" rel="noopener noreferrer" class="bs-hotline-btn right-btn" title="WhatsApp Franchise Desk">
          <div class="hotline-top">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span class="hotline-phone">+91 90290 20888</span>
          </div>
          <div class="hotline-label">WHATSAPP FRANCHISE DESK</div>
        </a>
      `;
      navCluster.appendChild(drawerHotlines);
    }

    // 4. Open Function
    window.openMobileNav = function() {
      navCluster.classList.add('mobile-open');
      if (navToggle) navToggle.classList.add('is-active');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };

    // 5. Close Function
    window.closeMobileNav = function() {
      navCluster.classList.remove('mobile-open');
      if (navToggle) navToggle.classList.remove('is-active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    // 6. Toggle Function
    window.toggleMobileNav = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (navCluster.classList.contains('mobile-open')) {
        window.closeMobileNav();
      } else {
        window.openMobileNav();
      }
    };

    // 7. Bind Handlers cleanly
    if (navToggle) {
      navToggle.onclick = window.toggleMobileNav;
    }

    if (backdrop) {
      backdrop.onclick = window.closeMobileNav;
    }

    // 8. Close on clicking any navigation link
    const navLinks = navCluster.querySelectorAll('.bs-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        window.closeMobileNav();
      });
    });

    // 9. Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navCluster.classList.contains('mobile-open')) {
        window.closeMobileNav();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
