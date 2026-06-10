/* =========================================
   Admin Auth Guard - IMPROVED VERSION
   Better error handling and debugging
========================================= */

(async function () {
    console.log('🔒 Auth Guard: Starting...');

    // Check if user is logged in
    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

    if (sessionError) {
        console.error('❌ Session Error:', sessionError);
        window.location.href = 'login.html';
        return;
    }

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    console.log('✅ Session found for user:', session.user.email);

    // Add a small delay to ensure session is fully established
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if user is admin
    const { data: adminData, error: adminError } = await window.supabaseClient
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (adminError || !adminData) {
        // Not an admin / Error -> Sign out and redirect
        await window.supabaseClient.auth.signOut();
        window.location.href = 'login.html';
        return;
    }

    // Success!
    console.log('✅ Admin authenticated:', adminData.email);

    // Add logout functionality
    const logoutButtons = document.querySelectorAll('[data-logout], .btn-logout, #logoutBtn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.href = 'login.html';
        });
    });
})();