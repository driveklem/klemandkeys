/* =========================================
   Klem & Keys Admin - Dashboard Logic
   Goal: Load Stats, Verify Auth, Manage Sidebar
========================================= */

document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. Authentication Check ---
    // REMOVED legacy token check to avoid conflict with Supabase Auth Guard
    // const token = localStorage.getItem('klem_admin_token');
    // if (!token) {
    //      window.location.href = 'login.html';
    //      return;
    // }

    // --- 2. Element References ---
    const propCountEl = document.getElementById('propCount');
    const viewCountEl = document.getElementById('viewCount');
    const inquiryCountEl = document.getElementById('inquiryCount');
    const recentTable = document.getElementById('recentPropsTable');
    const logoutBtn = document.getElementById('logoutBtn');

    // Sidebar Toggles
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // --- 3. UI Functionality ---

    // Toggle Sidebar (Mobile)
    function toggleSidebar() {
        if (sidebar) sidebar.classList.toggle('show');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('klem_admin_token');
                window.location.href = 'login.html';
            }
        });
    }

    // --- 4. Data Fetching (Real Supabase) ---
    async function loadDashboardData() {
        try {
            // 1. Fetch Stats
            // Properties Count
            const { count: propertyCount, error: propError } = await window.supabaseClient
                .from('properties')
                .select('*', { count: 'exact', head: true });

            if (propError) throw propError;

            // Inquiries Count
            const { count: inquiryCount, error: inqError } = await window.supabaseClient
                .from('inquiries')
                .select('*', { count: 'exact', head: true });

            if (inqError) throw inqError;

            // Total Views (sum of all property views)
            const { data: viewsData, error: viewsError } = await window.supabaseClient
                .from('properties')
                .select('views');

            if (viewsError) throw viewsError;

            const totalViews = viewsData?.reduce((sum, prop) => sum + (prop.views || 0), 0) || 0;

            // 2. Fetch Recent Properties
            const { data: recentProps, error: recentError } = await window.supabaseClient
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            // 3. Render Stats
            animateValue(propCountEl, 0, propertyCount || 0, 1000);
            animateValue(viewCountEl, 0, totalViews, 1500);
            animateValue(inquiryCountEl, 0, inquiryCount || 0, 800);

            // 4. Render Table
            renderTable(recentProps || []);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            if (recentTable) recentTable.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading data: ${error.message}</td></tr>`;
        }
    }

    function renderTable(props) {
        if (!recentTable) return;

        if (props.length === 0) {
            recentTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <div class="d-flex flex-column align-items-center justify-content-center text-muted">
                            <i class="fas fa-folder-open fa-2x mb-2 text-secondary opacity-50"></i>
                            <h6 class="fw-bold mb-1">No Properties Found</h6>
                            <p class="small mb-2">Add your first property to see it here.</p>
                            <a href="property-add.html" class="btn btn-sm btn-primary-gold">
                                <i class="fas fa-plus-circle me-1"></i> Add Property
                            </a>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        recentTable.innerHTML = props.map(prop => `
            <tr>
                <td><strong>${prop.title}</strong></td>
                <td>${prop.location}</td>
                <td>₦${Number(prop.price).toLocaleString()}</td>
                <td><span class="badge ${getStatusBadgeClass(prop.status)}">${prop.status}</span></td>
                <td>
                    <a href="property-add.html?id=${prop.id}" class="btn btn-sm btn-light text-primary" title="Edit"><i class="fas fa-edit"></i></a>
                </td>
            </tr>
        `).join('');
    }

    function getStatusBadgeClass(status) {
        // Match CSS classes used in properties.js/html
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-success'; // Bootstrap class or custom
            case 'available': return 'bg-success';
            case 'sold': return 'bg-danger';
            case 'pending': return 'bg-warning text-dark';
            default: return 'bg-secondary';
        }
    }

    // Simple Number Animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Initialize
    // Only load dashboard data if elements exist
    // --- 5. Unread Badge Logic (Global) ---
    async function updateUnreadBadge() {
        try {
            const { count, error } = await window.supabaseClient
                .from('inquiries')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'unread');

            if (error) throw error;

            const badges = document.querySelectorAll('#unreadInquiriesBadge');
            badges.forEach(badge => {
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            });

        } catch (err) {
            console.error('Error updating unread badge:', err);
        }
    }

    // Run Global Logic
    updateUnreadBadge();

    // Initialize Dashboard-Specific Logic
    if (propCountEl && recentTable) {
        loadDashboardData();
    }
});
