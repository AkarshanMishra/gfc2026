/**
 * GRILLISTA - Flagship Modern Mobile Navigation Drawer Controller
 * Exact 1:1 match to reference screenshot with luxury dark aesthetic,
 * gold icons, promo card, CTA button, and social media footer.
 */

(function() {
  function initMobileNav() {
    // 1. Ensure Backdrop exists in body
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    // Determine current page for active highlighting
    const currentPath = window.location.pathname.toLowerCase();
    const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
    const isAbout = currentPath.includes('about');
    const isMenu = currentPath.includes('menu');
    const isFranchise = currentPath.includes('franchise') || currentPath.includes('franchies');
    const isGallery = currentPath.includes('gallery');
    const isLocator = currentPath.includes('locator') || currentPath.includes('contact');

    // 2. Ensure Drawer Container exists in body
    let drawer = document.querySelector('.mobile-nav-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'mobile-nav-drawer';
      drawer.id = 'mobile-nav-drawer';
      document.body.appendChild(drawer);
    }

    drawer.innerHTML = `
      <div class="drawer-scroll-container">
        
        <!-- 1. Drawer Header -->
        <div class="drawer-header">
          <div class="drawer-brand">
            <div class="drawer-logo-ring">
              <img src="assets/logo.png" alt="Grillista Logo" class="drawer-logo">
            </div>
            <div class="drawer-brand-text">
              <div class="drawer-brand-title">GRILLISTA</div>
              <div class="drawer-veg-pill">100% PURE VEG 🌱</div>
              <div class="drawer-script-tag">Good Food &nbsp; Brighter Tomorrow</div>
              <div class="drawer-gold-dash"></div>
            </div>
          </div>
          <button type="button" class="drawer-close-btn" id="drawer-close-btn" aria-label="Close Menu">✕</button>
        </div>

        <!-- 2. Navigation Items List -->
        <ul class="drawer-nav-menu">
          <li>
            <a href="index.html#home" class="drawer-nav-item ${isHome ? 'active' : ''}">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
                <span class="drawer-item-label">HOME</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="about.html" class="drawer-nav-item ${isAbout ? 'active' : ''}">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <span class="drawer-item-label">ABOUT US</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="menu.html" class="drawer-nav-item ${isMenu ? 'active' : ''}">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2v20M6 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2M9 12v10"></path>
                  </svg>
                </span>
                <span class="drawer-item-label">OUR MENU</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="index.html#why-choose-grillista" class="drawer-nav-item">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                  </svg>
                </span>
                <span class="drawer-item-label">WHY GRILLISTA</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="franchise.html" class="drawer-nav-item ${isFranchise ? 'active' : ''}">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <path d="M9 22V12h6v10"></path>
                    <path d="M2 9h20"></path>
                  </svg>
                </span>
                <span class="drawer-item-label">FRANCHISE</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="about.html#support" class="drawer-nav-item">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                  </svg>
                </span>
                <span class="drawer-item-label">SUPPORT</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="gallery.html" class="drawer-nav-item ${isGallery ? 'active' : ''}">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </span>
                <span class="drawer-item-label">GALLERY</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
          <li>
            <a href="locator.html" class="drawer-nav-item ${isLocator ? 'active' : ''}">
              <span class="drawer-item-left">
                <span class="drawer-item-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span class="drawer-item-label">CONTACT US</span>
              </span>
              <span class="drawer-item-chevron">›</span>
            </a>
          </li>
        </ul>

        <!-- 3. "More Than Food" Card -->
        <div class="drawer-promo-card">
          <div class="drawer-promo-left">
            <div class="drawer-promo-script">More<br>Than Food</div>
            <div class="drawer-promo-line"></div>
            <div class="drawer-promo-sub">Great Taste.<br>Happier People.</div>
          </div>
          <div class="drawer-promo-right">
            <img src="assets/menu-dish-burger.jpg" alt="Grillista Food" class="drawer-promo-img">
          </div>
        </div>

        <!-- 4. Apply for Franchise Gold CTA Button -->
        <a href="franchise.html#franchise-apply" class="drawer-gold-cta-btn">
          <span class="drawer-cta-rocket">🚀</span>
          <span class="drawer-cta-text">APPLY FOR FRANCHISE</span>
          <span class="drawer-cta-arrow">→</span>
        </a>

        <!-- 5. Social Links & Footer Tagline -->
        <div class="drawer-social-section">
          <div class="drawer-social-label">FOLLOW US</div>
          <div class="drawer-social-icons">
            <a href="https://www.instagram.com/grillista1" target="_blank" rel="noopener noreferrer" class="drawer-social-btn ig" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" rel="noopener noreferrer" class="drawer-social-btn fb" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#FFFFFF">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="drawer-social-btn yt" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#FFFFFF">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="drawer-social-btn in" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="#FFFFFF">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://pin.it/1bi0APK1A" target="_blank" rel="noopener noreferrer" class="drawer-social-btn pi" aria-label="Pinterest">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#FFFFFF">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          <div class="drawer-bottom-script">
            <span>Good Food Brighter Tomorrow</span>
            <div class="drawer-bottom-dash"></div>
          </div>
        </div>

      </div>
    `;

    // 3. Open Function
    window.openMobileNav = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const d = document.querySelector('.mobile-nav-drawer');
      const b = document.querySelector('.mobile-nav-backdrop');
      if (d) d.classList.add('open');
      if (b) b.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };

    // 4. Close Function
    window.closeMobileNav = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const d = document.querySelector('.mobile-nav-drawer');
      const b = document.querySelector('.mobile-nav-backdrop');
      if (d) d.classList.remove('open');
      if (b) b.classList.remove('active');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    // 5. Toggle Function
    window.toggleMobileNav = function(e) {
      const d = document.querySelector('.mobile-nav-drawer');
      if (d && d.classList.contains('open')) {
        window.closeMobileNav(e);
      } else {
        window.openMobileNav(e);
      }
    };

    // 6. Bind Handlers
    const toggles = document.querySelectorAll('#mobile-nav-toggle, .mobile-toggle');
    toggles.forEach(btn => {
      btn.onclick = window.toggleMobileNav;
    });

    const closeBtn = document.getElementById('drawer-close-btn');
    if (closeBtn) closeBtn.onclick = window.closeMobileNav;
    if (backdrop) backdrop.onclick = window.closeMobileNav;

    // 7. Close on clicking link inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        window.closeMobileNav();
      });
    });

    // 8. Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
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

