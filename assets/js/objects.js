document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.corporate-sidebar .nav-link');
    const sections = document.querySelectorAll('.corporate-card');

    // Handle click events
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Get target section ID
            const targetId = this.getAttribute('href').substring(1);

            // Hide all sections and show target
            sections.forEach(section => {
                section.classList.remove('active'); // Hide all
                if (section.id === targetId) {
                    section.classList.add('active'); // Show target
                }
            });

            // Optional: scroll to top of content on mobile
            if (window.innerWidth < 992) {
                document.querySelector('.corporate-card.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
