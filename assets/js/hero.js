/* ========================================
   KLEM & KEYS REALTY - HERO SECTION JS V2
   Minimal interactions and animations
======================================== */

(function () {
  'use strict';

  // DOM Elements
  const heroSection = document.getElementById('heroSection');
  const heroBtns = document.querySelectorAll('.hero-buttons .btn');
  const scrollLink = document.querySelector('.scroll-link');

  /* ========================================
     SMOOTH SCROLL TO NEXT SECTION
  ======================================== */

  function handleScrollClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const navbar = document.getElementById('mainNavbar');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = targetElement.offsetTop - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      // If no specific section, scroll to next section after hero
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) {
        const navbar = document.getElementById('mainNavbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = nextSection.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  /* ========================================
     PARALLAX EFFECT (Optional, Subtle)
  ======================================== */

  function initParallax() {
    let ticking = false;

    function updateParallax() {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;

      if (heroSection && scrolled < window.innerHeight) {
        heroSection.style.backgroundPositionY = `${scrolled * parallaxSpeed}px`;
      }

      ticking = false;
    }

    function requestParallaxUpdate() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    // Only enable parallax on larger screens
    if (window.innerWidth >= 992) {
      window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }
  }

  /* ========================================
     BUTTON CLICK ANALYTICS (Optional)
  ======================================== */

  function trackButtonClick(buttonText, buttonType) {
    // Add your analytics tracking here
    // Example: Google Analytics, Facebook Pixel, etc.
    console.log(`Hero Button Clicked: ${buttonText} (${buttonType})`);

    // Example GA4 event (if you have Google Analytics)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'hero_button_click', {
        'button_text': buttonText,
        'button_type': buttonType
      });
    }
  }

  function setupButtonTracking() {
    heroBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        const buttonText = this.querySelector('span')?.textContent || 'Unknown';
        const buttonType = this.classList.contains('btn-hero-primary') ? 'primary' : 'secondary';
        trackButtonClick(buttonText, buttonType);
      });
    });
  }

  /* ========================================
     DYNAMIC BACKGROUND IMAGES
  ======================================== */

  function setHeroBackground() {
    // Array of high-quality real estate images
    const backgroundImages = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070'
    ];

    // Use first image by default (or implement randomization/rotation)
    const selectedImage = backgroundImages[0];

    if (heroSection) {
      // heroSection.style.backgroundImage = `url('${selectedImage}')`;
    }
  }

  /* ========================================
     PRELOAD HERO IMAGE FOR FASTER LOAD
  ======================================== */

  function preloadHeroImage() {
    const heroImage = new Image();
    // heroImage.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075';

    heroImage.onload = function () {
      if (heroSection) {
        heroSection.classList.add('image-loaded');
      }
    };
  }

  /* ========================================
     KEYBOARD ACCESSIBILITY
  ======================================== */

  function initKeyboardNav() {
    heroBtns.forEach((btn, index) => {
      btn.addEventListener('keydown', function (e) {
        // Arrow key navigation between buttons
        if (e.key === 'ArrowRight' && index < heroBtns.length - 1) {
          e.preventDefault();
          heroBtns[index + 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
          e.preventDefault();
          heroBtns[index - 1].focus();
        }
      });
    });
  }

  /* ========================================
     INITIALIZE AOS (Animate On Scroll)
  ======================================== */

  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100,
        delay: 0,
        disable: function () {
          // Disable on mobile for better performance
          return window.innerWidth < 768;
        }
      });
    }
  }

  /* ========================================
     VIEWPORT HEIGHT FIX (Mobile Safari)
  ======================================== */

  function fixMobileViewportHeight() {
    // Fix for mobile browsers (especially iOS Safari)
    // where 100vh includes the address bar
    function setVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setVH();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setVH, 100);
    });
  }

  /* ========================================
     SMOOTH BUTTON RIPPLE EFFECT
  ======================================== */

  function addRippleEffect() {
    heroBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple CSS if not already present
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        .btn {
          position: relative;
          overflow: hidden;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ========================================
     BUTTON HOVER SOUND (Optional)
  ======================================== */

  function addHoverSound() {
    // Uncomment to enable subtle hover sounds
    /*
    const hoverSound = new Audio('path/to/hover-sound.mp3');
    hoverSound.volume = 0.1;
    
    heroBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {});
      });
    });
    */
  }

  /* ========================================
     INITIALIZATION
  ======================================== */

  function initHeroSection() {
    // Set background image
    setHeroBackground();

    // Preload image for faster load
    preloadHeroImage();

    // Initialize animations
    initAOS();

    // Fix mobile viewport height
    fixMobileViewportHeight();

    // Setup button tracking
    setupButtonTracking();

    // Keyboard navigation
    initKeyboardNav();

    // Add ripple effect to buttons
    addRippleEffect();

    // Setup scroll down functionality
    if (scrollLink) {
      scrollLink.addEventListener('click', handleScrollClick);
    }

    // Setup scroll indicator click handler
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.style.cursor = 'pointer';
      scrollIndicator.addEventListener('click', function (e) {
        e.preventDefault();
        const nextSection = heroSection.nextElementSibling;
        if (nextSection) {
          const navbar = document.getElementById('mainNavbar');
          const navbarHeight = navbar ? navbar.offsetHeight : 0;
          const targetPosition = nextSection.offsetTop - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }

    // Optional: Enable parallax (uncomment if desired)
    // initParallax();

    // Optional: Add hover sounds (uncomment if desired)
    // addHoverSound();
  }

  /* ========================================
     BOOTSTRAP WHEN READY
  ======================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSection);
  } else {
    initHeroSection();
  }

  /* ========================================
     CLEANUP FUNCTION (for SPA)
  ======================================== */

  window.cleanupHero = function () {
    // Remove event listeners if needed for SPA navigation
    const parallaxHandler = window.requestParallaxUpdate;
    if (parallaxHandler) {
      window.removeEventListener('scroll', parallaxHandler);
    }
  };

})();