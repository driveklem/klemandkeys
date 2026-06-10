// =========================
// CORPORATE INFO PAGE SCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize corporate info page
    initCorporatePage();
});

function initCorporatePage() {
    // Initialize sidebar navigation
    initSidebarNavigation();

    // Initialize smooth scrolling for anchor links
    initSmoothScrolling();

    // Initialize document download tracking
    initDocumentDownloads();

    // Initialize active section detection
    // initActiveSectionDetection(); // Disabled for tab-based layout
}

// Initialize sidebar navigation
function initSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const corporateCards = document.querySelectorAll('.corporate-card');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);

            // Update active state in sidebar
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Show target card, hide others
            corporateCards.forEach(card => {
                card.classList.remove('active');
                if (card.id === targetId) {
                    card.classList.add('active');
                }
            });

            // Smooth scroll to top of card
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                window.scrollTo({
                    top: targetCard.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize smooth scrolling
function initSmoothScrolling() {
    // Smooth scroll for anchor links within page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if it's a sidebar nav link (handled separately)
            if (this.closest('.sidebar-nav')) {
                return;
            }

            // Check if it's an internal link
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Initialize document download tracking
function initDocumentDownloads() {
    const downloadButtons = document.querySelectorAll('.btn-document');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // You can add analytics or tracking here
            const documentName = this.textContent.trim();
            console.log(`Document download clicked: ${documentName}`);

            // For now, prevent default to show it's working
            // Remove this in production when actual files are available
            if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                e.preventDefault();
                alert(`In production, this would download: ${documentName}\n\nFor now, this is a demonstration.`);
            }
        });
    });
}

// Initialize active section detection for scroll
function initActiveSectionDetection() {
    const sections = document.querySelectorAll('.corporate-card');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    // Only run if we have sections and are on desktop (sidebar is sticky)
    if (sections.length === 0 || sidebarLinks.length === 0) return;

    // Check if sidebar is visible and sticky
    const sidebar = document.querySelector('.corporate-sidebar');
    if (!sidebar || window.innerWidth < 992) return; // Only on desktop

    let isScrolling = false;

    const updateActiveSection = () => {
        if (isScrolling) return;

        let currentSectionId = '';
        const scrollPosition = window.scrollY + 150; // Offset for header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.id;
            }
        });

        if (currentSectionId) {
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    // Throttle scroll events for performance
    window.addEventListener('scroll', () => {
        isScrolling = true;
        updateActiveSection();

        setTimeout(() => {
            isScrolling = false;
        }, 100);
    });

    // Initial check
    updateActiveSection();
}

// Add keyboard navigation support
document.addEventListener('keydown', function (e) {
    const activeCard = document.querySelector('.corporate-card.active');
    const allCards = document.querySelectorAll('.corporate-card');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    if (!activeCard || allCards.length === 0) return;

    const currentIndex = Array.from(allCards).indexOf(activeCard);

    // Ctrl + Arrow Down: Next section
    if (e.ctrlKey && e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < allCards.length - 1) {
            const nextCard = allCards[currentIndex + 1];
            const nextLink = document.querySelector(`.sidebar-nav .nav-link[href="#${nextCard.id}"]`);

            if (nextLink) {
                nextLink.click();
            }
        }
    }

    // Ctrl + Arrow Up: Previous section
    if (e.ctrlKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
            const prevCard = allCards[currentIndex - 1];
            const prevLink = document.querySelector(`.sidebar-nav .nav-link[href="#${prevCard.id}"]`);

            if (prevLink) {
                prevLink.click();
            }
        }
    }
});

// Print-friendly styles
function initPrintStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .corporate-sidebar,
            .objects-download-section,
            .btn-document {
                display: none !important;
            }
            
            .corporate-card {
                display: block !important;
                box-shadow: none !important;
                break-inside: avoid;
            }
            
            .object-item:hover,
            .structure-item:hover {
                transform: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize print styles
initPrintStyles();

// Export functions if needed for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initCorporatePage,
        initSidebarNavigation,
        initSmoothScrolling,
        initDocumentDownloads,
        initActiveSectionDetection
    };
}