// =========================
// HOME PAGE SECTIONS SCRIPT
// Professional Version
// =========================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all sections
    initHomeSections();
});

function initHomeSections() {
    // Initialize featured properties
    initFeaturedProperties();

    // Initialize consultation form
    initConsultationForm();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize statistics counter (if needed)
    initStatistics();
}

// =========================
// FEATURED PROPERTIES
// =========================

async function initFeaturedProperties() {
    const featuredPropertiesContainer = document.getElementById('featuredPropertiesContainer');
    if (!featuredPropertiesContainer) {
        console.warn('Featured properties container not found');
        return;
    }

    // Show loading state
    featuredPropertiesContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-gold" role="status">
                <span class="visually-hidden">Loading properties...</span>
            </div>
            <p class="mt-3 text-muted">Loading featured properties...</p>
        </div>`;

    // Wait for Supabase client
    let attempts = 0;
    while (!window.supabaseClient && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.supabaseClient) {
        console.error('Supabase client not initialized after 3 seconds');
        featuredPropertiesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="mb-3">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning"></i>
                </div>
                <h5 class="text-muted">Unable to load properties</h5>
                <p class="text-muted small">Please refresh the page or try again later.</p>
            </div>`;
        return;
    }

    try {
        console.log('🔍 Fetching featured properties...');

        const { data: properties, error } = await window.supabaseClient
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        console.log(`✅ Fetched ${properties?.length || 0} properties`);

        if (!properties || properties.length === 0) {
            featuredPropertiesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="mb-3">
                        <i class="fas fa-home fa-3x text-muted opacity-50"></i>
                    </div>
                    <p class="text-muted">No properties available at the moment.</p>
                    <a href="contact.html" class="btn btn-primary mt-3">Contact Us</a>
                </div>`;
        } else {
            renderFeaturedProperties(properties, featuredPropertiesContainer);
        }

    } catch (err) {
        console.error('❌ Error fetching featured properties:', err);
        featuredPropertiesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="mb-3">
                    <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
                </div>
                <h5 class="text-danger">Error Loading Properties</h5>
                <p class="text-muted small">${err.message || 'Please try again later'}</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">Retry</button>
            </div>`;
    }
}

function renderFeaturedProperties(properties, container) {
    if (!container) {
        console.error('Featured properties container not found');
        return;
    }

    if (properties.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="mb-3">
                    <i class="fas fa-home fa-3x text-muted opacity-50"></i>
                </div>
                <p class="text-muted">No featured properties available currently.</p>
            </div>`;
        return;
    }

    // Use EXACT same structure as properties.html
    container.innerHTML = properties.map((prop) => {
        // Safe image handling
        let imageUrl = 'assets/img/hero-bg.jpg';
        if (prop.images && Array.isArray(prop.images) && prop.images.length > 0) {
            imageUrl = prop.images[0];
        }

        // Status class
        const statusClass = getStatusClass(prop.status);

        return `
        <div class="col-lg-4 col-md-6 col-sm-12">
          <div class="property-listing-card">
            <div class="property-listing-image">
              <img src="${imageUrl}" alt="${prop.title || 'Property'}" onerror="this.src='assets/img/hero-bg.jpg'" loading="lazy">
              
              <div class="d-flex align-items-center gap-2 position-absolute top-0 start-0 p-3 w-100" style="z-index: 2;">
                  <span class="property-listing-status ${statusClass} position-static m-0">${prop.status || 'Available'}</span>
              </div>
              
              <button class="btn-favorite" title="Add to favorites" onclick="event.preventDefault();">
                <i class="far fa-heart"></i>
              </button>
            </div>
            
            <div class="property-listing-content">
              <h3 class="property-listing-title">${prop.title || 'Untitled Property'}</h3>
              <p class="property-listing-location">
                <i class="fas fa-map-marker-alt"></i> ${prop.location || 'Location not specified'}
              </p>
              <div class="property-listing-details">
                ${prop.bedrooms ? `<span><i class="fas fa-bed"></i> ${prop.bedrooms} Beds</span>` : ''}
                ${prop.bathrooms ? `<span><i class="fas fa-bath"></i> ${prop.bathrooms} Baths</span>` : ''}
                ${prop.area ? `<span><i class="fas fa-ruler-combined"></i> ${prop.area} sqm</span>` : ''}
              </div>
              <p class="property-listing-description">
                ${truncateText(prop.description, 80)}
              </p>
              <div class="property-listing-footer">
                <div class="property-listing-price">₦${Number(prop.price || 0).toLocaleString()}</div>
                <a href="property-detail.html?id=${prop.id}" class="btn btn-view-listing">
                  View Details <i class="fas fa-arrow-right ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    console.log(`✅ Rendered ${properties.length} featured properties`);
}

// Helper functions (same as properties.js)
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'available': return 'status-available';
        case 'sold': return 'status-sold bg-danger';
        case 'rent': return 'bg-info';
        default: return 'status-available';
    }
}

function truncateText(text, length) {
    if (!text) return 'Premium property in a prime location.';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// =========================
// CONSULTATION FORM
// =========================

function initConsultationForm() {
    const consultationForm = document.getElementById('consultationForm');
    if (!consultationForm) return;

    consultationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('consultationName').value,
            phone: document.getElementById('consultationPhone').value,
            email: document.getElementById('consultationEmail').value,
            type: document.getElementById('consultationType').value,
            message: document.getElementById('consultationMessage').value,
            timestamp: new Date().toISOString()
        };

        // Validate required fields
        if (!formData.name || !formData.phone) {
            showFormMessage('Please fill in all required fields', 'error');
            return;
        }

        // Validate phone number (simple validation)
        const phoneRegex = /^[0-9\-\+]{9,15}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            showFormMessage('Please enter a valid phone number', 'error');
            return;
        }

        // Validate email if provided
        if (formData.email && !isValidEmail(formData.email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const submitBtn = consultationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processing...';
        submitBtn.disabled = true;

        // Submit to Supabase
        const { data, error } = await window.supabaseClient
            .from('inquiries')
            .insert([{
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                message: formData.message,
                type: 'consultation', // Fixed type for this form
                status: 'new',
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Error submitting inquiry:', error);
            showFormMessage('Something went wrong. Please try again later.', 'error');
        } else {
            // Show success message
            showFormMessage('Thank you! We will contact you within 24 hours.', 'success');
            consultationForm.reset();
        }

        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });

    // Add input validation on blur
    const inputs = consultationForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            // Remove error state when user starts typing
            this.classList.remove('is-invalid');
            const errorElement = this.nextElementSibling;
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.remove();
            }
        });
    });
}

function validateField(field) {
    if (!field.value.trim() && field.hasAttribute('required')) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }

    if (field.id === 'consultationPhone' && field.value) {
        const phoneRegex = /^[0-9\-\+]{9,15}$/;
        if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');

    // Remove existing error message
    const existingError = field.nextElementSibling;
    if (existingError && existingError.classList.contains('invalid-feedback')) {
        existingError.remove();
    }

    // Create and insert error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveConsultationRequest(data) {
    // Get existing requests or initialize empty array
    let requests = JSON.parse(localStorage.getItem('consultation_requests')) || [];

    // Add new request with ID and timestamp
    const request = {
        id: Date.now(),
        ...data,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    requests.unshift(request); // Add to beginning

    // Keep only last 50 requests
    if (requests.length > 50) {
        requests = requests.slice(0, 50);
    }

    // Save back to localStorage
    localStorage.setItem('consultation_requests', JSON.stringify(requests));

    console.log('Consultation request saved:', request);
}

function simulateNotificationEmail(data) {
    // In a real application, this would send an email via API
    console.log('Notification email would be sent:', {
        to: 'admin@klemkeysrealty.com',
        subject: `New Consultation Request from ${data.name}`,
        body: `
New consultation request received:

Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email || 'Not provided'}
Interest: ${data.type || 'Not specified'}
Message: ${data.message || 'No additional message'}

Date: ${new Date().toLocaleString()}
        `
    });
}

function showFormMessage(message, type = 'success') {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles if not already added
    if (!document.querySelector('#form-message-styles')) {
        const styles = document.createElement('style');
        styles.id = 'form-message-styles';
        styles.textContent = `
            .form-message {
                margin-top: 1.5rem;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                font-size: 0.95rem;
                font-weight: 500;
                animation: slideInUp 0.3s ease;
            }
            
            .form-message-success {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.2);
                color: #059669;
            }
            
            .form-message-error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #dc2626;
            }
            
            .message-content {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Insert after form
    const form = document.getElementById('consultationForm');
    form.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 5000);
}

// =========================
// SCROLL ANIMATIONS
// =========================

function initScrollAnimations() {
    // Add fade-in-up class to all section elements
    const animateElements = document.querySelectorAll('.feature-card, .featured-property-card, .service-card, .excellence-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in-up');
    });

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all animate elements
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// =========================
// STATISTICS COUNTER (Optional)
// =========================

function initStatistics() {
    const statElements = document.querySelectorAll('.stat-number');
    if (statElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statElements.forEach(stat => observer.observe(stat));
}

function startCounter(element) {
    const target = parseInt(element.getAttribute('data-count') || element.textContent);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, duration / steps);
}

// =========================
// UTILITY FUNCTIONS
// =========================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount) {
    return '₦' + amount.toLocaleString('en-US');
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initHomeSections,
        initFeaturedProperties,
        initConsultationForm
    };
}