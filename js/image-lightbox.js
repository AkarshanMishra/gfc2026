/**
 * GRILLISTA - Universal Fullscreen Image Lightbox & Touch Swipe Viewer
 * Makes every image on the website interactive, zoomable, and swipeable.
 */

(function() {
  let lightboxEl = null;
  let lightboxImg = null;
  let lightboxTitle = null;
  let lightboxCounter = null;
  let activeImageList = [];
  let currentIndex = 0;
  let isZoomed = false;

  // Touch swipe variables
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  function createLightbox() {
    if (document.getElementById('grillista-universal-lightbox')) return;

    lightboxEl = document.createElement('div');
    lightboxEl.id = 'grillista-universal-lightbox';
    lightboxEl.className = 'grillista-lightbox-overlay';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Image Lightbox Preview');

    lightboxEl.innerHTML = `
      <div class="lightbox-backdrop"></div>
      
      <!-- Top Control Bar -->
      <div class="lightbox-topbar">
        <div class="lightbox-info">
          <h4 class="lightbox-caption" id="glb-caption">Grillista Image</h4>
          <span class="lightbox-count" id="glb-counter">1 of 1</span>
        </div>
        <div class="lightbox-actions">
          <button type="button" class="lightbox-btn-zoom" id="glb-btn-zoom" title="Toggle Zoom (or double click)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <button type="button" class="lightbox-btn-close" id="glb-btn-close" title="Close (Esc)">
            &times;
          </button>
        </div>
      </div>

      <!-- Main Image Stage -->
      <div class="lightbox-stage" id="glb-stage">
        <button type="button" class="lightbox-arrow lightbox-arrow-prev" id="glb-btn-prev" aria-label="Previous image">‹</button>
        
        <div class="lightbox-image-container" id="glb-img-container">
          <img src="" alt="Full Preview" class="lightbox-img" id="glb-img">
        </div>
        
        <button type="button" class="lightbox-arrow lightbox-arrow-next" id="glb-btn-next" aria-label="Next image">›</button>
      </div>
      
      <!-- Bottom Helper Hint -->
      <div class="lightbox-bottom-hint">
        <span>💡 Tap/Double-click to zoom • Swipe left/right to browse</span>
      </div>
    `;

    document.body.appendChild(lightboxEl);

    lightboxImg = document.getElementById('glb-img');
    lightboxTitle = document.getElementById('glb-caption');
    lightboxCounter = document.getElementById('glb-counter');

    // Attach Lightbox Listeners
    document.getElementById('glb-btn-close').onclick = closeLightbox;
    document.querySelector('.lightbox-backdrop').onclick = closeLightbox;
    document.getElementById('glb-btn-prev').onclick = (e) => { e.stopPropagation(); showPrev(); };
    document.getElementById('glb-btn-next').onclick = (e) => { e.stopPropagation(); showNext(); };

    // Zoom Toggle
    const toggleZoom = (e) => {
      if (e) e.stopPropagation();
      isZoomed = !isZoomed;
      lightboxImg.classList.toggle('is-zoomed', isZoomed);
      const zoomBtn = document.getElementById('glb-btn-zoom');
      if (zoomBtn) zoomBtn.classList.toggle('active', isZoomed);
    };

    document.getElementById('glb-btn-zoom').onclick = toggleZoom;
    lightboxImg.ondblclick = toggleZoom;

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (!lightboxEl.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === '+' || e.key === '=') toggleZoom();
    });

    // Touch Swipe Navigation for Mobile Lightbox
    const stage = document.getElementById('glb-stage');
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleLightboxSwipe();
    }, { passive: true });
  }

  function handleLightboxSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        showPrev(); // Swiped right -> go to previous
      } else {
        showNext(); // Swiped left -> go to next
      }
    }
  }

  function openLightbox(index = 0) {
    createLightbox();
    if (!activeImageList.length) return;

    currentIndex = (index + activeImageList.length) % activeImageList.length;
    isZoomed = false;
    lightboxImg.classList.remove('is-zoomed');

    const item = activeImageList[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || 'Grillista Photo Preview';
    lightboxTitle.textContent = item.title || 'Grillista Photo Preview';
    lightboxCounter.textContent = `${currentIndex + 1} of ${activeImageList.length}`;

    // Hide arrows if only 1 image
    const prevBtn = document.getElementById('glb-btn-prev');
    const nextBtn = document.getElementById('glb-btn-next');
    if (activeImageList.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    } else {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
    }

    lightboxEl.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('active');
    isZoomed = false;
    if (lightboxImg) lightboxImg.classList.remove('is-zoomed');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  function showNext() {
    if (activeImageList.length <= 1) return;
    openLightbox(currentIndex + 1);
  }

  function showPrev() {
    if (activeImageList.length <= 1) return;
    openLightbox(currentIndex - 1);
  }

  // Scan and attach click-to-open handlers to EVERY image on the website
  function attachUniversalImageLightbox() {
    // Collect all valid content images (exclude icons/logos if desired, or include with title)
    const images = Array.from(document.querySelectorAll('img')).filter(img => {
      const src = img.getAttribute('src') || '';
      // Skip tracking pixels or tiny icons
      if (!src || src.includes('data:image/svg')) return false;
      return true;
    });

    // Build website image list
    const galleryItems = images.map((img, idx) => {
      let title = img.getAttribute('alt') || img.dataset.title || '';
      if (!title || title.toLowerCase().includes('logo')) {
        title = 'Grillista Food & Dining Experience';
      }
      return {
        src: img.currentSrc || img.src,
        title: title,
        element: img
      };
    });

    images.forEach(img => {
      // Add cursor zoom pointer
      img.style.cursor = 'zoom-in';
      
      img.addEventListener('click', (e) => {
        // If part of an interactive link button that isn't just an image wrapper, let user open image
        activeImageList = galleryItems;
        const clickedSrc = img.currentSrc || img.src;
        const foundIndex = activeImageList.findIndex(item => item.src === clickedSrc);
        openLightbox(foundIndex >= 0 ? foundIndex : 0);
      });
    });
  }

  // -------------------------------------------------------------
  // TOUCH SWIPE CONTROLLER FOR MENU COVERFLOW SLIDERS
  // -------------------------------------------------------------
  function setupMenuSwipe() {
    const coverflowStage = document.querySelector('.coverflow-viewport') || 
                           document.querySelector('.menu-showcase-stage-wrap') || 
                           document.querySelector('.slider-stage') ||
                           document.querySelector('.menu-slider-wrapper');
                           
    if (!coverflowStage) return;

    let startX = 0;
    let startY = 0;

    coverflowStage.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
    }, { passive: true });

    coverflowStage.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].screenX;
      const endY = e.changedTouches[0].screenY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Check horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX < 0) {
          // Swipe left -> Next Slide
          const nextBtn = document.querySelector('.coverflow-nav-arrow.arrow-next') || 
                          document.querySelector('.slider-arrow-btn.next-btn') ||
                          document.getElementById('slider-next-btn');
          if (nextBtn) nextBtn.click();
        } else {
          // Swipe right -> Prev Slide
          const prevBtn = document.querySelector('.coverflow-nav-arrow.arrow-prev') || 
                          document.querySelector('.slider-arrow-btn.prev-btn') ||
                          document.getElementById('slider-prev-btn');
          if (prevBtn) prevBtn.click();
        }
      }
    }, { passive: true });
  }

  // Expose Global functions
  window.openGrillistaLightbox = openLightbox;
  window.closeGrillistaLightbox = closeLightbox;

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createLightbox();
      attachUniversalImageLightbox();
      setupMenuSwipe();
    });
  } else {
    createLightbox();
    attachUniversalImageLightbox();
    setupMenuSwipe();
  }
})();
