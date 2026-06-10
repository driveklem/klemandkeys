// =========================
// FOOTER FUNCTIONALITY - DYNAMIC
// =========================

document.addEventListener('DOMContentLoaded', async function () {
  console.log('Dynamic Footer Script Loaded v2');
  // Basic UI inits
  initFooterUI();

  // Load dynamic content
  // Load dynamic content
  // More robust wait for Supabase client (up to 5s)
  let attempts = 0;
  while (!window.supabaseClient && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (window.supabaseClient) {
    console.log('Supabase client found, loading footer config...');
    await loadFooterConfiguration();
  } else {
    console.error('Supabase client failed to initialize after 5s');
    // Set fallback if needed or leave loading state
  }
});

function initFooterUI() {
  // Update copyright year
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Back to top button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    function toggleBackToTop() {
      if (window.pageYOffset > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
        backToTopBtn.style.transform = 'translateY(0)';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
        backToTopBtn.style.transform = 'translateY(10px)';
      }
    }

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Initial check
  }
}

async function loadFooterConfiguration() {
  try {
    const { data, error } = await window.supabaseClient
      .from('site_settings')
      .select('value')
      .eq('key', 'configuration')
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings for footer:', error);
      return;
    }

    if (data && data.value) {
      updateFooterContent(data.value);
    }
  } catch (err) {
    console.error('Unexpected error in footer:', err);
  }
}

function updateFooterContent(config) {
  // 1. Update Contact Info
  if (config.contact) {
    // Address
    const addressEl = document.getElementById('footerAddress');
    if (addressEl && config.contact.address) {
      addressEl.textContent = config.contact.address.replace(/\n/g, ' ').replace(/,\s*,/g, ',');
    }

    // Phone
    const phoneEl = document.getElementById('footerPhone');
    if (phoneEl && config.contact.phone) {
      phoneEl.textContent = config.contact.phone;
      phoneEl.href = `tel:${config.contact.phone.replace(/\s+/g, '')}`;
    }

    // Email
    const emailEl = document.getElementById('footerEmail');
    if (emailEl && config.contact.email) {
      emailEl.textContent = config.contact.email;
      emailEl.href = `mailto:${config.contact.email}`;
    }
  }

  // 2. Update Social Media
  if (config.social) {
    const socialContainer = document.getElementById('footerSocials');
    if (socialContainer) {
      let socialHTML = '';

      if (config.social.facebook) {
        socialHTML += `<a href="${config.social.facebook}" class="ft-social-btn box-icon-facebook" target="_blank"><i class="fab fa-facebook-f"></i></a>`;
      }
      if (config.social.twitter) {
        socialHTML += `<a href="${config.social.twitter}" class="ft-social-btn box-icon-twitter" target="_blank"><i class="fab fa-twitter"></i></a>`;
      }
      if (config.social.instagram) {
        socialHTML += `<a href="${config.social.instagram}" class="ft-social-btn box-icon-instagram" target="_blank"><i class="fab fa-instagram"></i></a>`;
      }
      if (config.social.tiktok) {
        socialHTML += `<a href="${config.social.tiktok}" class="ft-social-btn box-icon-tiktok" target="_blank"><i class="fab fa-tiktok"></i></a>`;
      }

      if (socialHTML) {
        socialContainer.innerHTML = socialHTML;
      }
    }
  }
}