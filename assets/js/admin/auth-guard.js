/* =========================================
   Klem & Keys Admin - Production Auth Guard
   - Validates Supabase session on every admin page load
   - Verifies user is in admin_users table
   - Auto-logout after 30 minutes of inactivity
   - Proper logout button wiring
========================================= */

(async function () {
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    let inactivityTimer = null;

    // Wait for Supabase client to be ready (max 3s)
    let attempts = 0;
    while (!window.supabaseClient && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (!window.supabaseClient) {
        console.error('❌ Auth Guard: Supabase not loaded. Redirecting to login.');
        window.location.href = 'login.html';
        return;
    }

    // --- 1. Check Session ---
    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

    if (sessionError || !session) {
        console.warn('❌ Auth Guard: No valid session found. Redirecting to login.');
        window.location.href = 'login.html';
        return;
    }

    // --- 2. Verify Admin Role ---
    const { data: adminData, error: adminError } = await window.supabaseClient
        .from('admin_users')
        .select('id, email')
        .eq('id', session.user.id)
        .single();

    if (adminError || !adminData) {
        console.warn('❌ Auth Guard: User is not an admin. Signing out and redirecting.');
        await window.supabaseClient.auth.signOut();
        window.location.href = 'login.html';
        return;
    }

    console.log('✅ Auth Guard: Admin verified -', adminData.email);

    // --- 3. Update Admin Name in Sidebar ---
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = adminData.email.split('@')[0];
    }

    // --- 4. Inactivity Timer ---
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(async () => {
            console.log('⚠️ Auth Guard: Inactivity timeout. Signing out.');
            await window.supabaseClient.auth.signOut();
            // Show a brief message then redirect
            document.body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0d1117;color:#fff;font-family:sans-serif;flex-direction:column;gap:16px;">
                    <i class="fas fa-lock" style="font-size:3rem;color:#b8923b;"></i>
                    <h2>Session Expired</h2>
                    <p style="color:#888;">You have been signed out due to inactivity.</p>
                    <a href="login.html" style="background:#b8923b;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Sign In Again</a>
                </div>
            `;
            setTimeout(() => { window.location.href = 'login.html'; }, 3000);
        }, INACTIVITY_TIMEOUT_MS);
    }

    // Reset timer on any user interaction
    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer(); // Start the timer

    // --- 5. Wire Logout Buttons ---
    function wireLogoutBtn() {
        const logoutBtns = document.querySelectorAll('#logoutBtn, [data-logout], .btn-logout');
        logoutBtns.forEach(btn => {
            // Avoid double-attaching
            if (btn.dataset.logoutWired) return;
            btn.dataset.logoutWired = 'true';

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (window.showCustomConfirm) {
                    window.showCustomConfirm('Sign Out', 'Are you sure you want to sign out?', async () => {
                        clearTimeout(inactivityTimer);
                        await window.supabaseClient.auth.signOut();
                        window.location.href = 'login.html';
                    });
                } else {
                    clearTimeout(inactivityTimer);
                    await window.supabaseClient.auth.signOut();
                    window.location.href = 'login.html';
                }
            });
        });
    }

    // Wire on DOM ready (dashboard.js may not have run yet)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireLogoutBtn);
    } else {
        wireLogoutBtn();
    }

    // --- 6. Listen for auth state changes (e.g., token expiry) ---
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
            window.location.href = 'login.html';
        }
    });

})();