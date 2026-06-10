/* ========================================
   KLEM & KEYS REALTY - NAVBAR FUNCTIONALITY
   Professional scroll effects and mobile menu
======================================== */

(function () {
  'use strict';

  // DOM Elements
  const navbar = document.getElementById('mainNavbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbarCollapse = document.getElementById('navbarContent');
  const navbarToggler = document.querySelector('.navbar-toggler');

  // State
  let lastScrollTop = 0;
  const scrollThreshold = 80;
  let mobileMenuElements = null;

  /* ========================================
     MOBILE MENU SETUP
  ======================================== */

  function createMobileMenuElements() {
    // Create backdrop overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'mobileMenuOverlay';
    document.body.appendChild(overlay);

    // Create mobile menu header with close button
    const headerDiv = document.createElement('div');
    headerDiv.className = 'mobile-menu-header';

    const title = document.createElement('h5');
    title.className = 'mobile-menu-title';
    title.textContent = 'Menu';

    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-menu-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.setAttribute('type', 'button');

    headerDiv.appendChild(title);
    headerDiv.appendChild(closeButton);

    // Insert at the beginning of navbar content
    navbarCollapse.insertBefore(headerDiv, navbarCollapse.firstChild);

    return { overlay, closeButton };
  }

  function initMobileMenu() {
    if (mobileMenuElements) return mobileMenuElements.closeMobileMenu;

    const { overlay, closeButton } = createMobileMenuElements();

    // Close menu function
    function closeMobileMenu() {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
      overlay.classList.remove('show');
      document.body.classList.remove('mobile-menu-open');
    }

    // Event listeners for closing
    closeButton.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
        closeMobileMenu();
      }
    });

    // Bootstrap collapse event listeners
    navbarCollapse.addEventListener('show.bs.collapse', () => {
      overlay.classList.add('show');
      document.body.classList.add('mobile-menu-open');
    });

    navbarCollapse.addEventListener('hide.bs.collapse', () => {
      overlay.classList.remove('show');
      document.body.classList.remove('mobile-menu-open');
    });

    mobileMenuElements = { overlay, closeButton, closeMobileMenu };
    return closeMobileMenu;
  }

  /* ========================================
     SCROLL EFFECTS
  ======================================== */

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove scrolled class
    if (scrollTop > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Close mobile menu on scroll (mobile only)
    if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }

    lastScrollTop = scrollTop;
  }

  // Throttled scroll handler for performance
  let scrollTimeout;
  function throttledScrollHandler() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
  }

  /* ========================================
     ACTIVE LINK DETECTION
  ======================================== */

  function setActiveLink() {
    const currentPath = window.location.pathname;
    let currentPage = currentPath.split('/').pop();

    // Normalize current page - treat root/empty as index.html
    if (!currentPage || currentPage === '' || currentPage === '/' || currentPath === '/') {
      currentPage = 'index.html';
    }

    // DEBUG: Remove these console.logs after testing on Netlify
    console.log('Current path:', currentPath);
    console.log('Current page:', currentPage);

    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkHref = link.getAttribute('href');

      if (!linkHref) return; // Skip if no href

      // Extract filename from href
      let linkFilename = linkHref.split('/').pop() || linkHref;

      // Remove query parameters if any
      linkFilename = linkFilename.split('?')[0];

      // CRITICAL FIX: Treat "/" as "index.html"
      if (linkFilename === '/' || linkFilename === '') {
        linkFilename = 'index.html';
      }

      // DEBUG: Remove after testing
      console.log('Comparing:', linkFilename, '===', currentPage);

      // Direct match
      if (linkFilename === currentPage) {
        link.classList.add('active');
        console.log('✅ Match found!');
        return;
      }

      // Also check without .html extension
      const linkBase = linkFilename.replace('.html', '');
      const currentBase = currentPage.replace('.html', '');

      if (linkBase === currentBase && linkBase !== '' && linkBase !== 'index') {
        link.classList.add('active');
        console.log('✅ Match found (base name)!');
      }
    });
  }

  /* ========================================
     SMOOTH SCROLL FOR ANCHOR LINKS
  ======================================== */

  function smoothScrollToAnchor(e) {
    const href = this.getAttribute('href');

    // Check if it's an anchor link on the same page
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = target.offsetTop - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu after navigation
        if (window.innerWidth < 992 && mobileMenuElements) {
          mobileMenuElements.closeMobileMenu();
        }
      }
    }
  }

  /* ========================================
     LINK CLICK HANDLERS
  ======================================== */

  function setupLinkHandlers(closeMobileMenuFn) {
    navLinks.forEach(link => {
      // Smooth scroll for anchors
      link.addEventListener('click', smoothScrollToAnchor);

      // Close mobile menu on link click
      link.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && closeMobileMenuFn) {
          // Small delay to allow the link to register before closing
          setTimeout(() => {
            closeMobileMenuFn();
          }, 150);
        }
      });
    });
  }

  /* ========================================
     WINDOW RESIZE HANDLER
  ======================================== */

  function handleResize() {
    // Initialize mobile menu if switching to mobile
    if (window.innerWidth < 992 && !mobileMenuElements) {
      initMobileMenu();
    }

    // Close menu and clean up if switching to desktop
    if (window.innerWidth >= 992) {
      if (navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
      document.body.classList.remove('mobile-menu-open');

      // Remove overlay if it exists
      if (mobileMenuElements && mobileMenuElements.overlay) {
        mobileMenuElements.overlay.classList.remove('show');
      }
    }
  }

  // Debounce resize handler
  let resizeTimeout;
  function debouncedResizeHandler() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 150);
  }

  /* ========================================
     INITIALIZATION
  ======================================== */

  function initNavbar() {
    let closeMobileMenuFn;

    // Initialize mobile menu if on mobile viewport
    if (window.innerWidth < 992) {
      closeMobileMenuFn = initMobileMenu();
    }

    // Set initial states
    handleScroll();
    setActiveLink();

    // Setup event listeners
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('resize', debouncedResizeHandler);

    // Setup link handlers
    setupLinkHandlers(closeMobileMenuFn);

    // Prevent menu from opening on page load if URL has ?collapse
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('collapse') === 'false') {
      navbarCollapse.classList.remove('show');
    }
  }



  /* ========================================
     BOOTSTRAP WHEN READY
  ======================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }

  // Expose cleanup function for SPA scenarios
  window.cleanupNavbar = function () {
    window.removeEventListener('scroll', throttledScrollHandler);
    window.removeEventListener('resize', debouncedResizeHandler);
    if (mobileMenuElements && mobileMenuElements.overlay) {
      mobileMenuElements.overlay.remove();
    }
    mobileMenuElements = null;
  };

})();