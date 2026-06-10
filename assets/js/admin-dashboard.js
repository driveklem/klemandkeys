// =========================
// ADMIN DASHBOARD SCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    updateCurrentDate();
    
    // Initialize notifications
    initNotifications();
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize property type chart
    initPropertyTypeChart();
    
    // Initialize table actions
    initTableActions();
    
    // Initialize quick action buttons
    initQuickActions();
});

// Update current date in header
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Initialize notifications dropdown
function initNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
        
        // Mark all as read
        const markReadBtn = notificationDropdown.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', function() {
                const unreadItems = notificationDropdown.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                
                // Update badge count
                const badge = notificationBtn.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = '0';
                    badge.style.display = 'none';
                }
            });
        }
        
        // Update badge count
        updateNotificationBadge();
    }
}

// Update notification badge count
function updateNotificationBadge() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            const unreadCount = dropdown.querySelectorAll('.notification-item.unread').length;
            const badge = notificationBtn.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
        }
    }
}

// Initialize sidebar toggle for mobile
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }
}

// Initialize property type chart using Chart.js
function initPropertyTypeChart() {
    const chartCanvas = document.getElementById('propertyTypeChart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Chart data
    const chartData = {
        labels: ['Houses', 'Lands', 'Apartments', 'Commercial'],
        datasets: [{
            data: [24, 18, 12, 8],
            backgroundColor: [
                '#0b2d4d', // Houses - blue-dark
                '#b8923b', // Lands - gold-primary
                '#2a5d9a', // Apartments - blue-light
                '#1a4a7a'  // Commercial - blue-mid
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 15
        }]
    };
    
    // Chart configuration
    const chartConfig = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + ' properties';
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    };
    
    // Create chart
    new Chart(ctx, chartConfig);
    
    // Handle period selection
    const periodSelect = document.getElementById('propertyTypePeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            // This is where you would fetch new data based on the selected period
            console.log('Period changed to:', this.value);
            // In a real application, you would make an AJAX call here
            // to get data for the selected period and update the chart
        });
    }
}

// Initialize table actions
function initTableActions() {
    const editButtons = document.querySelectorAll('.btn-action.edit');
    const viewButtons = document.querySelectorAll('.btn-action.view');
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    
    // Edit button handlers
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyName = this.closest('tr').querySelector('.property-info h4').textContent;
            console.log(`Edit property: ${propertyName}`);
            // In real application, redirect to edit page
            // window.location.href = `admin-edit-property.html?id=${propertyId}`;
        });
    });
    
    // View button handlers
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyName = this.closest('tr').querySelector('.property-info h4').textContent;
            console.log(`View property: ${propertyName}`);
            // In real application, open property in new tab or modal
            // window.open(`property-detail.html?id=${propertyId}`, '_blank');
        });
    });
    
    // Delete button handlers
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyName = this.closest('tr').querySelector('.property-info h4').textContent;
            if (confirm(`Are you sure you want to delete "${propertyName}"?`)) {
                console.log(`Delete property: ${propertyName}`);
                // In real application, make API call to delete property
                // Then remove the row from the table
                this.closest('tr').remove();
            }
        });
    });
}

// Initialize quick action buttons
function initQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const actionText = this.querySelector('h4').textContent;
            console.log(`Quick action: ${actionText}`);
            // The href on the anchor tag will handle navigation
        });
    });
}

// Update stats with animation
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(element => {
        const targetValue = parseInt(element.textContent);
        let currentValue = 0;
        const increment = Math.ceil(targetValue / 50);
        const duration = 1000; // 1 second
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = currentValue;
        }, duration / 50);
    });
}

// Call animate stats after page loads
setTimeout(animateStats, 500);

<!-- JavaScript for Interactive Features -->
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle Functionality
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const adminMain = document.getElementById('adminMain');
    
    // Toggle sidebar on button click
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        adminMain.classList.toggle('sidebar-active');
    });
    
    // Close sidebar with close button
    sidebarClose.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        adminMain.classList.remove('sidebar-active');
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        adminMain.classList.remove('sidebar-active');
    });
    
    // Close sidebar on window resize (if mobile)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            adminMain.classList.remove('sidebar-active');
        }
    });
    
    // Notification Dropdown
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationDropdown.classList.toggle('active');
    });
    
    // Close notification dropdown when clicking elsewhere
    document.addEventListener('click', function() {
        notificationDropdown.classList.remove('active');
    });
    
    // Mark notification as read
    const markReadBtn = document.querySelector('.btn-mark-read');
    markReadBtn.addEventListener('click', function() {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        document.querySelector('.notification-badge').textContent = '0';
    });
    
    // Update current date
    const currentDate = document.getElementById('currentDate');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
    
    // Counter animation for stats
    const statValues = document.querySelectorAll('.stat-value');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = Math.floor(target);
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 20);
    };
    
    // Animate counters when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.textContent);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statValues.forEach(stat => {
        observer.observe(stat);
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
        // Implement search functionality here
        console.log('Searching for:', this.value);
    });
});