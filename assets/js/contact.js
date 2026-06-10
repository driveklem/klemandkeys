// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function () {
  // Form Elements
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = submitBtn.querySelector('.btn-text');
  const submitBtnLoading = submitBtn.querySelector('.btn-loading');
  const formSuccess = document.getElementById('formSuccess');
  const successModal = document.getElementById('successModal');
  const modalClose = document.getElementById('closeModal');
  const modalCloseBtn = document.getElementById('modalClose');

  // Character counter for message
  const messageTextarea = document.getElementById('contactMessage');
  const charCount = document.getElementById('charCount');

  if (messageTextarea && charCount) {
    messageTextarea.addEventListener('input', function () {
      charCount.textContent = this.value.length;

      if (this.value.length > 1000) {
        this.value = this.value.substring(0, 1000);
        charCount.textContent = 1000;
      }
    });
  }

  // Form validation
  function validateForm() {
    let isValid = true;
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    const subject = document.getElementById('contactSubject');
    const message = document.getElementById('contactMessage');

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

    // Validate name
    if (!name.value.trim()) {
      document.getElementById('nameError').textContent = 'Name is required';
      name.focus();
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      document.getElementById('emailError').textContent = 'Email is required';
      if (isValid) email.focus();
      isValid = false;
    } else if (!emailRegex.test(email.value)) {
      document.getElementById('emailError').textContent = 'Please enter a valid email';
      if (isValid) email.focus();
      isValid = false;
    }

    // Validate phone
    const phoneRegex = /^[0-9\s\+\-\(\)]{10,20}$/;
    if (!phone.value.trim()) {
      document.getElementById('phoneError').textContent = 'Phone number is required';
      if (isValid) phone.focus();
      isValid = false;
    } else if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
      document.getElementById('phoneError').textContent = 'Please enter a valid phone number';
      if (isValid) phone.focus();
      isValid = false;
    }

    // Validate subject
    if (!subject.value) {
      document.getElementById('subjectError').textContent = 'Please select a subject';
      if (isValid) subject.focus();
      isValid = false;
    }

    // Validate message
    if (!message.value.trim()) {
      document.getElementById('messageError').textContent = 'Message is required';
      if (isValid) message.focus();
      isValid = false;
    } else if (message.value.length < 10) {
      document.getElementById('messageError').textContent = 'Message must be at least 10 characters';
      if (isValid) message.focus();
      isValid = false;
    }

    return isValid;
  }

  // Form submission
  if (contactForm) {
    // Initialize rate limiter (2-minute cooldown)
    const rateLimiter = new FormRateLimiter('contactForm', 2);

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Check rate limit first
      if (!rateLimiter.canSubmit()) {
        const remaining = rateLimiter.getRemainingTime();
        alert(`Please wait ${remaining} minute${remaining > 1 ? 's' : ''} before submitting another message.`);
        return;
      }

      if (!validateForm()) {
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtnText.style.display = 'none';
      submitBtnLoading.style.display = 'flex';

      // Generate reference ID
      const referenceId = 'KK-' + new Date().getFullYear() + '-' +
        Math.floor(100000 + Math.random() * 900000);

      // Consolidate extra fields into message
      const subject = document.getElementById('contactSubject').value;
      const propertyInterest = document.getElementById('propertyInterest').value;
      const contactMethod = document.querySelector('input[name="contactMethod"]:checked').value;
      const contactTime = document.getElementById('contactTime').value;
      const originalMessage = document.getElementById('contactMessage').value;

      const fullMessage = `Subject: ${subject}
Ref ID: ${referenceId}
Property Interest: ${propertyInterest}
Preferred Contact: ${contactMethod}
Best Time: ${contactTime}

${originalMessage}`;

      // Prepare DB Payload
      const dbData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        message: fullMessage,
        type: 'general_contact',
        status: 'new',
        created_at: new Date().toISOString()
      };

      try {
        // Check if Supabase client is available
        if (!window.supabaseClient) {
          throw new Error('Database connection not available');
        }

        // Insert into Supabase
        const { data, error } = await window.supabaseClient
          .from('inquiries')
          .insert([dbData])
          .select();

        if (error) throw error;

        // Reset form
        contactForm.reset();
        charCount.textContent = '0';

        // Hide loading state
        submitBtn.disabled = false;
        submitBtnText.style.display = 'flex';
        submitBtnLoading.style.display = 'none';

        // Show success message
        document.getElementById('referenceId').textContent = referenceId;
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Record submission for rate limiting
        rateLimiter.recordSubmit();

      } catch (error) {
        console.error('Error submitting form:', error);

        // Hide loading state
        submitBtn.disabled = false;
        submitBtnText.style.display = 'flex';
        submitBtnLoading.style.display = 'none';

        // Show error message
        alert('Sorry, there was an error submitting your inquiry. Please try again or contact us directly.');
      }
    });
  }

  // Modal close handlers
  if (modalClose) {
    modalClose.addEventListener('click', function () {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function () {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close modal on ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && successModal.classList.contains('active')) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close modal on background click
  successModal.addEventListener('click', function (e) {
    if (e.target === successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Get Directions buttons
  const directionButtons = document.querySelectorAll('[id="getDirections"], .btn-branch-directions, #openMap');
  directionButtons.forEach(button => {
    button.addEventListener('click', function () {
      const branch = this.dataset.branch || 'abuja';
      let address;

      switch (branch) {
        case 'lagos':
          address = '15A+Admiralty+Way,+Lekki+Phase+1,+Lagos,+Nigeria';
          break;
        case 'ph':
          address = '22+GRA+Phase+2,+Port+Harcourt,+Rivers+State,+Nigeria';
          break;
        default:
          address = 'Plot+1234,+Central+Business+District,+Abuja,+Nigeria';
      }

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(mapsUrl, '_blank');
    });
  });

  // Quick contact options
  const whatsappBtn = document.querySelector('a[href*="wa.me"]');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const message = encodeURIComponent("Hello! I'm interested in your real estate services.");
      window.open(`https://wa.me/2348123456789?text=${message}`, '_blank');
    });
  }
});