/**
 * GRILLISTA - Universal Modern Mobile Navigation Controller v4.0
 * Pure zero-dependency, ultra-resilient, cross-device support
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

    // 2. Ensure Drawer Container exists in body
    let drawer = document.querySelector('.mobile-nav-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'mobile-nav-drawer';
      drawer.id = 'mobile-nav-drawer';
      drawer.innerHTML = `
        <div>
          <div class="drawer-header">
            <div class="drawer-brand">
              <img src="assets/logo.png" alt="Grillista Logo" class="drawer-logo">
              <div>
                <div class="drawer-brand-title">GRILLISTA</div>
                <div class="drawer-veg-pill">🌱 100% PURE VEG</div>
              </div>
            </div>
            <button type="button" class="drawer-close-btn" id="drawer-close-btn" aria-label="Close Menu">✕</button>
          </div>

          <ul class="drawer-nav-menu">
            <li><a href="index.html#home"><span>HOME</span> <span class="chevron">›</span></a></li>
            <li><a href="about.html"><span>ABOUT US</span> <span class="chevron">›</span></a></li>
            <li><a href="menu.html"><span>OUR MENU</span> <span class="chevron">›</span></a></li>
            <li><a href="index.html#why-choose-grillista"><span>WHY GRILLISTA</span> <span class="chevron">›</span></a></li>
            <li><a href="franchise.html"><span>FRANCHISE</span> <span class="chevron">›</span></a></li>
            <li><a href="about.html#support"><span>SUPPORT</span> <span class="chevron">›</span></a></li>
            <li><a href="gallery.html"><span>GALLERY</span> <span class="chevron">›</span></a></li>
            <li><a href="locator.html"><span>CONTACT US</span> <span class="chevron">›</span></a></li>
          </ul>
        </div>

        <div class="drawer-footer">
          <a href="franchise.html#franchise-apply" class="drawer-apply-btn">🚀 APPLY FOR FRANCHISE</a>
          <a href="tel:+919711900055" class="drawer-call-btn">
            <span>📞 Call: +91 97119 00055</span>
          </a>
        </div>
      `;
      document.body.appendChild(drawer);
    }

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

