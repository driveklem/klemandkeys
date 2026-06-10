/* =========================================
   Klem & Keys Admin - Authentication Logic
   Real Supabase Integration
========================================= */

document.addEventListener('DOMContentLoaded', async () => {

    const loginForm = document.getElementById('adminLoginForm');
    const loginAlert = document.getElementById('loginAlert');
    const btnSpinner = document.getElementById('btnSpinner');
    const btnText = document.getElementById('btnText');

    // Helper: Show Alert
    function showAlert(message, type = 'danger') {
        loginAlert.textContent = message;
        loginAlert.className = `alert alert-${type}`;
        loginAlert.classList.remove('d-none');
    }

    // Helper: Toggle Loading
    function setLoading(isLoading) {
        const btn = document.querySelector('.btn-auth');
        btn.disabled = isLoading;
        if (isLoading) {
            btnSpinner.classList.remove('d-none');
            btnText.classList.add('d-none');
        } else {
            btnSpinner.classList.add('d-none');
            btnText.classList.remove('d-none');
        }
    }

    // --- Main Login Handler ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(true);
        loginAlert.classList.add('d-none');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            showAlert('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) throw authError;

            // Verify user is an admin
            const { data: adminData, error: adminError } = await window.supabaseClient
                .from('admin_users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (adminError || !adminData) {
                // User authenticated but not an admin
                await window.supabaseClient.auth.signOut();
                throw new Error('Access denied. You are not authorized as an admin.');
            }

            // Success!
            showAlert('Login Successful! Redirecting...', 'success');

            // Redirect to Dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('Login Error:', error);
            showAlert(error.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    // --- Session Check (On Load) ---
    // If already logged in and is admin, redirect to dashboard
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (session) {
        // Check if user is admin
        const { data: adminData } = await window.supabaseClient
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (adminData) {
            // Already logged in as admin, redirect
            window.location.href = 'dashboard.html';
        }
    }
});
