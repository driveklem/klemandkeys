// ================================================
// PROPERTY DETAIL PAGE - DYNAMIC SUPABASE VERSION
// ================================================

document.addEventListener('DOMContentLoaded', async function () {
    // Only run on property-detail page
    if (!window.location.pathname.includes('property-detail')) {
        return;
    }

    // Wait for Supabase client to be available
    let attempts = 0;
    while (!window.supabaseClient && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.supabaseClient) {
        console.error('Supabase client not available after waiting');
        return;
    }

    await initPropertyDetailPage();
});

async function initPropertyDetailPage() {
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) {
        showError('No property ID provided');
        return;
    }

    // Fetch property data
    try {
        const { data: property, error } = await window.supabaseClient
            .from('properties')
            .select('*')
            .eq('id', propertyId)
            .single();

        if (error) throw error;

        if (!property) {
            showError('Property not found');
            return;
        }

        // Render property details
        renderPropertyDetails(property);
        renderPropertySummary(property);
        loadSimilarProperties(property.id);

        // Initialize features
        initImageGallery(property.images || []);
        initInquiryForm(property);
        initFavoriteButton(property.id);

        // Track view (increment views column)
        await trackPropertyView(property.id);

    } catch (err) {
        console.error('Error loading property:', err);
        showError('Failed to load property details');
    }
}

function renderPropertyDetails(property) {
    // Update page title
    document.title = `${property.title} | Klem & Keys Realty`;

    // Update breadcrumb
    const breadcrumbSpan = document.querySelector('.property-breadcrumb span');
    if (breadcrumbSpan) {
        breadcrumbSpan.textContent = property.title;
    }

    // Update property header
    const titleElement = document.querySelector('.property-main-title');
    if (titleElement) {
        titleElement.textContent = property.title;
    }

    const locationElement = document.querySelector('.property-location span');
    if (locationElement) {
        locationElement.textContent = property.location;
    }

    const propertyIdElement = document.querySelector('.property-id');
    if (propertyIdElement) {
        propertyIdElement.textContent = `Property ID: ${formatRefId(property)}`;
    }

    // Update price
    const priceElement = document.querySelector('.property-price');
    if (priceElement) {
        const formattedPrice = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(property.price);
        priceElement.textContent = formattedPrice;
    }

    // Update status
    const statusElement = document.querySelector('.property-status');
    if (statusElement) {
        statusElement.textContent = property.status;
        statusElement.className = `property-status status-${property.status.toLowerCase()}`;
    }

    // Update description
    const descriptionElement = document.querySelector('.description-content');
    if (descriptionElement) {
        descriptionElement.innerHTML = `<p>${property.description || 'No description available.'}</p>`;
    }

    // Update features grid
    updateFeaturesGrid(property);
}

function updateFeaturesGrid(property) {
    const featuresGrid = document.querySelector('.features-grid');
    if (!featuresGrid) return;

    // 1. Core Features (Always present)
    let featuresHTML = `
        <div class="feature-item">
            <i class="fas fa-home"></i>
            <div>
                <strong>Property Type</strong>
                <span>${property.type || 'N/A'}</span>
            </div>
        </div>
        <div class="feature-item">
            <i class="fas fa-bed"></i>
            <div>
                <strong>Bedrooms</strong>
                <span>${property.bedrooms || 0}</span>
            </div>
        </div>
        <div class="feature-item">
            <i class="fas fa-bath"></i>
            <div>
                <strong>Bathrooms</strong>
                <span>${property.bathrooms || 0}</span>
            </div>
        </div>
        <div class="feature-item">
            <i class="fas fa-ruler-combined"></i>
            <div>
                <strong>Square Meters</strong>
                <span>${property.area || 0} sqm</span>
            </div>
        </div>
    `;

    // 2. Extended Features from 'features' JSON column
    let f = property.features;
    if (Array.isArray(f) && f.length > 0) f = f[0];
    f = f || {};

    if (f.year_built) {
        featuresHTML += `
            <div class="feature-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                    <strong>Year Built</strong>
                    <span>${f.year_built}</span>
                </div>
            </div>`;
    }

    if (f.parking_spaces) {
        featuresHTML += `
            <div class="feature-item">
                <i class="fas fa-car"></i>
                <div>
                    <strong>Parking/Garage</strong>
                    <span>${f.parking_spaces} Spaces</span>
                </div>
            </div>`;
    }

    // 3. Amenities (Array in features.amenities)
    if (f.amenities && Array.isArray(f.amenities)) {
        f.amenities.forEach(amenity => {
            let icon = 'fa-check-circle';
            // Map common amenities to specific icons
            const p = amenity.toLowerCase();
            if (p.includes('pool')) icon = 'fa-swimming-pool';
            else if (p.includes('gard')) icon = 'fa-tree';
            else if (p.includes('gym')) icon = 'fa-dumbbell';
            else if (p.includes('secur')) icon = 'fa-shield-alt';
            else if (p.includes('wifi') || p.includes('internet')) icon = 'fa-wifi';
            else if (p.includes('solar') || p.includes('power')) icon = 'fa-solar-panel';
            else if (p.includes('gen')) icon = 'fa-bolt';

            featuresHTML += `
                <div class="feature-item">
                    <i class="fas ${icon}"></i>
                    <div>
                        <strong>${amenity}</strong>
                        <span>Available</span>
                    </div>
                </div>`;
        });
    }

    // 4. Fallback for Status/Listed if grid is empty-ish or just to be complete
    featuresHTML += `
        <div class="feature-item">
            <i class="fas fa-info-circle"></i>
            <div>
                <strong>Status</strong>
                <span>${property.status}</span>
            </div>
        </div>
    `;

    featuresGrid.innerHTML = featuresHTML;
}

function initImageGallery(images) {
    const mainImage = document.getElementById('mainPropertyImage');
    const thumbnailsContainer = document.querySelector('.property-thumbnails');

    if (!mainImage || !thumbnailsContainer) return;

    if (!images || images.length === 0) {
        mainImage.src = 'assets/img/hero-bg.jpg';
        mainImage.alt = 'Property Image';
        thumbnailsContainer.innerHTML = '<p class="text-muted">No images available</p>';
        return;
    }

    // Set main image
    mainImage.src = images[0];
    mainImage.alt = 'Property Main Image';

    // Render thumbnails
    thumbnailsContainer.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${img}">
            <img src="${img}" alt="Property Image ${index + 1}" onerror="this.src='assets/img/hero-bg.jpg'">
        </div>
    `).join('');

    // Add click handlers
    const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function () {
            const imageUrl = this.getAttribute('data-image');
            mainImage.src = imageUrl;
            mainImage.alt = `Property Image ${index + 1}`;

            // Update active state
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initInquiryForm(property) {
    const inquiryForm = document.getElementById('propertyInquiryForm');
    if (!inquiryForm) return;

    // Set minimum date to today
    const inquiryDate = document.getElementById('inquiryDate');
    if (inquiryDate) {
        const today = new Date().toISOString().split('T')[0];
        inquiryDate.min = today;
        inquiryDate.value = today;
    }

    inquiryForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = inquiryForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';

        try {
            const formData = {
                property_id: property.id,
                name: document.getElementById('inquiryName').value,
                email: document.getElementById('inquiryEmail').value,
                phone: document.getElementById('inquiryPhone').value,
                message: document.getElementById('inquiryMessage').value,
                viewing_date: document.getElementById('inquiryDate').value,
                status: 'new'
            };

            const { error } = await window.supabaseClient
                .from('inquiries')
                .insert([formData]);

            if (error) throw error;

            showNotification('Inquiry sent successfully! We will contact you soon.', 'success');
            inquiryForm.reset();
            if (inquiryDate) {
                inquiryDate.value = new Date().toISOString().split('T')[0];
            }

        } catch (err) {
            console.error('Error submitting inquiry:', err);
            showNotification('Failed to send inquiry. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

function initFavoriteButton(propertyId) {
    const favorites = JSON.parse(localStorage.getItem('property_favorites')) || [];
    const isFavorited = favorites.includes(propertyId);

    // Find or create favorite button
    let favoriteBtn = document.querySelector('.btn-favorite-property');

    if (!favoriteBtn) {
        favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'btn-favorite-property';
        favoriteBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${isFavorited ? '#ef4444' : '#0b2d4d'};
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(favoriteBtn);
    }

    updateFavoriteButton(favoriteBtn, isFavorited);

    favoriteBtn.addEventListener('click', function () {
        const favorites = JSON.parse(localStorage.getItem('property_favorites')) || [];
        const index = favorites.indexOf(propertyId);

        if (index > -1) {
            favorites.splice(index, 1);
            updateFavoriteButton(this, false);
            showNotification('Removed from favorites', 'info');
        } else {
            favorites.push(propertyId);
            updateFavoriteButton(this, true);
            showNotification('Added to favorites', 'success');
        }

        localStorage.setItem('property_favorites', JSON.stringify(favorites));
    });
}

function updateFavoriteButton(btn, isFavorited) {
    btn.innerHTML = `
        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
        <span>${isFavorited ? 'Favorited' : 'Mark as Favorite'}</span>
    `;
    btn.style.background = isFavorited ? '#ef4444' : '#0b2d4d';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h2>${message}</h2>
                <a href="properties.html" class="btn btn-primary mt-3">
                    <i class="fas fa-arrow-left me-2"></i>Back to Properties
                </a>
            </div>
        `;
    }
}

// Add CSS animations
document.head.appendChild(style);

// --- Helpers & New Render Logic ---

function formatPrice(price) {
    if (!price) return '0';
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
    }).format(price).replace('NGN', '').trim(); // Remove NGN if present to manage symbol manually if needed, or rely on locale
}

function getPropertyImage(property) {
    if (property.images && property.images.length > 0) {
        return property.images[0];
    }
    return 'assets/img/hero-bg.jpg';
}

function formatRefId(property) {
    if (!property.id) return 'N/A';
    const year = new Date(property.created_at).getFullYear();
    const paddedId = String(property.id).padStart(3, '0');
    return `KK-${year}-${paddedId}`;
}

function renderPropertySummary(property) {
    const list = document.getElementById('propertySummaryList');
    if (!list) return;

    const summaryItems = [
        { label: 'Price:', value: formatPrice(property.price) },
        { label: 'Property Type:', value: property.type },
        { label: 'Location:', value: property.location },
        { label: 'Bedrooms:', value: property.bedrooms },
        { label: 'Bathrooms:', value: property.bathrooms },
        { label: 'Square Meters:', value: `${property.area || 0} sqm` },
        { label: 'Added On:', value: new Date(property.created_at).toLocaleDateString() },
        { label: 'Ref ID:', value: formatRefId(property) }
    ];

    list.innerHTML = summaryItems.map(item => `
        <div class="summary-item">
            <span class="summary-label">${item.label}</span>
            <span class="summary-value">${item.value || 'N/A'}</span>
        </div>
    `).join('');
}

async function loadSimilarProperties(currentId) {
    const list = document.getElementById('similarPropertiesList');
    if (!list) return;

    try {
        const { data: similarProps, error } = await window.supabaseClient
            .from('properties')
            .select('*')
            .neq('id', currentId)
            .limit(3);

        if (error) throw error;

        if (!similarProps || similarProps.length === 0) {
            list.innerHTML = '<p class="text-muted text-center py-3 small">No similar properties found.</p>';
            return;
        }

        list.innerHTML = similarProps.map(prop => `
            <div class="similar-property">
                <a href="property-detail.html?id=${prop.id}" class="similar-link">
                    <div class="similar-image">
                        <img src="${getPropertyImage(prop)}" alt="${prop.title}" onerror="this.src='assets/img/hero-bg.jpg'">
                    </div>
                    <div class="similar-info">
                        <h4>${prop.title}</h4>
                        <p class="similar-location">
                            <i class="fas fa-map-marker-alt"></i> ${prop.location}
                        </p>
                        <div class="similar-price">${formatPrice(prop.price)}</div>
                    </div>
                </a>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error loading similar properties:', err);
        list.innerHTML = '<p class="text-muted text-center small">Unable to load recommendations.</p>';
    }
}

// 4. Inquiry Form Handler
function initInquiryForm(property) {
    const form = document.getElementById('propertyInquiryForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const msgContainer = document.createElement('div');
        msgContainer.className = 'mt-3 text-center';

        // Clear previous messages
        const existingMsg = form.querySelector('.inquiry-msg');
        if (existingMsg) existingMsg.remove();

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';

            // Gather Data
            const formData = {
                name: document.getElementById('inquiryName').value,
                email: document.getElementById('inquiryEmail').value,
                phone: document.getElementById('inquiryPhone').value,
                message: document.getElementById('inquiryMessage').value,
                property_id: property.id,
                type: 'property_inquiry',
                status: 'new',
                created_at: new Date().toISOString()
            };

            // Validation (Basic)
            if (!formData.name || !formData.email || !formData.phone) {
                throw new Error('Please fill in all required fields.');
            }

            // Submit to Supabase
            const { error } = await window.supabaseClient
                .from('inquiries')
                .insert([formData]);

            if (error) throw error;

            // Success
            msgContainer.classList.add('inquiry-msg', 'text-success');
            msgContainer.innerHTML = '<i class="fas fa-check-circle me-1"></i> Inquiry sent successfully!';
            form.reset();

        } catch (err) {
            console.error('Inquiry Error:', err);
            msgContainer.classList.add('inquiry-msg', 'text-danger');
            msgContainer.innerHTML = `<i class="fas fa-exclamation-circle me-1"></i> ${err.message || 'Failed to send inquiry.'}`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            form.appendChild(msgContainer);
            // Auto hide message after 5s
            setTimeout(() => { if (msgContainer.parentNode) msgContainer.remove(); }, 5000);
        }
    });
}

// Track Property View
async function trackPropertyView(propertyId) {
    try {
        // First, get current views
        const { data: property, error: fetchError } = await window.supabaseClient
            .from('properties')
            .select('views')
            .eq('id', propertyId)
            .single();

        if (fetchError) {
            console.error('Error fetching current views:', fetchError);
            return;
        }

        // Increment views
        const currentViews = property?.views || 0;
        const { error: updateError } = await window.supabaseClient
            .from('properties')
            .update({ views: currentViews + 1 })
            .eq('id', propertyId);

        if (updateError) {
            console.error('Error updating views:', updateError);
        }
    } catch (err) {
        console.error('Error tracking view:', err);
    }
}