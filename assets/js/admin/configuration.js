// ================================================
// ADMIN CONFIGURATION - FULLY DYNAMIC WITH MODALS
// ================================================

document.addEventListener('DOMContentLoaded', async function () {
    await initConfigurationPage();
});

let configData = {
    locations: [],
    property_types: [],
    contact: {
        phone: '',
        email: '',
        address: ''
    },
    social: {
        facebook: '',
        twitter: '',
        instagram: '',
        tiktok: ''
    },

};

async function initConfigurationPage() {
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        showNotification('Database connection error', 'error');
        return;
    }

    await loadConfiguration();
    initEventListeners();
    createModals();
}

async function loadConfiguration() {
    try {
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('*')
            .eq('key', 'configuration')
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (data && data.value) {
            configData = { ...configData, ...data.value };
        }

        renderAll();

    } catch (err) {
        console.error('Error loading configuration:', err);
        renderAll(); // Render with defaults
    }
}

function renderAll() {
    renderLocations();
    renderPropertyTypes();
    renderContactInfo();
    renderSocialMedia();

}

// ============ LOCATIONS ============
function renderLocations() {
    const container = document.getElementById('locationsContainer');
    if (!container) return;

    if (configData.locations.length === 0) {
        container.innerHTML = '<p class="text-muted small">No locations added yet. Click "Add New" to get started.</p>';
        return;
    }

    container.innerHTML = configData.locations.map((location, index) => `
        <div class="list-group-item">
            <span>${location}</span>
            <button class="btn btn-sm text-danger" onclick="removeLocation(${index})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function showAddLocationModal() {
    const modal = document.getElementById('addItemModal');
    const modalTitle = modal.querySelector('.modal-title');
    const input = document.getElementById('itemInput');
    const saveBtn = document.getElementById('saveItemBtn');

    modalTitle.textContent = 'Add New Location';
    input.value = '';
    input.placeholder = 'e.g., Maitama, Abuja';

    saveBtn.onclick = function () {
        const value = input.value.trim();
        if (value) {
            configData.locations.push(value);
            renderLocations();
            saveConfiguration();
            bootstrap.Modal.getInstance(modal).hide();
        }
    };

    new bootstrap.Modal(modal).show();
}

function removeLocation(index) {
    window.showCustomConfirm('Remove Location', 'Are you sure you want to remove this location?', () => {
        configData.locations.splice(index, 1);
        renderLocations();
        saveConfiguration();
    });
}

// ============ PROPERTY TYPES ============
function renderPropertyTypes() {
    const container = document.getElementById('propertyTypesContainer');
    if (!container) return;

    if (configData.property_types.length === 0) {
        container.innerHTML = '<p class="text-muted small">No property types added yet. Click "Add New" to get started.</p>';
        return;
    }

    container.innerHTML = configData.property_types.map((type, index) => `
        <div class="list-group-item">
            <span>${type}</span>
            <button class="btn btn-sm text-danger" onclick="removePropertyType(${index})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function showAddPropertyTypeModal() {
    const modal = document.getElementById('addItemModal');
    const modalTitle = modal.querySelector('.modal-title');
    const input = document.getElementById('itemInput');
    const saveBtn = document.getElementById('saveItemBtn');

    modalTitle.textContent = 'Add New Property Type';
    input.value = '';
    input.placeholder = 'e.g., Residential, Commercial';

    saveBtn.onclick = function () {
        const value = input.value.trim();
        if (value) {
            configData.property_types.push(value);
            renderPropertyTypes();
            saveConfiguration();
            bootstrap.Modal.getInstance(modal).hide();
        }
    };

    new bootstrap.Modal(modal).show();
}

function removePropertyType(index) {
    window.showCustomConfirm('Remove Property Type', 'Are you sure you want to remove this property type?', () => {
        configData.property_types.splice(index, 1);
        renderPropertyTypes();
        saveConfiguration();
    });
}

// ============ CONTACT INFO ============
function renderContactInfo() {
    const phoneInput = document.getElementById('contactPhone');
    const emailInput = document.getElementById('contactEmail');
    const addressInput = document.getElementById('contactAddress');

    if (phoneInput) phoneInput.value = configData.contact.phone || '';
    if (emailInput) emailInput.value = configData.contact.email || '';
    if (addressInput) addressInput.value = configData.contact.address || '';
}

function saveContactInfo() {
    const phoneInput = document.getElementById('contactPhone');
    const emailInput = document.getElementById('contactEmail');
    const addressInput = document.getElementById('contactAddress');

    configData.contact.phone = phoneInput ? phoneInput.value : '';
    configData.contact.email = emailInput ? emailInput.value : '';
    configData.contact.address = addressInput ? addressInput.value : '';

    saveConfiguration();
}

// ============ SOCIAL MEDIA ============
function renderSocialMedia() {
    const facebookInput = document.getElementById('socialFacebook');
    const twitterInput = document.getElementById('socialTwitter');
    const instagramInput = document.getElementById('socialInstagram');
    const tiktokInput = document.getElementById('socialTiktok');

    if (facebookInput) facebookInput.value = configData.social.facebook || '';
    if (twitterInput) twitterInput.value = configData.social.twitter || '';
    if (instagramInput) instagramInput.value = configData.social.instagram || '';
    if (tiktokInput) tiktokInput.value = configData.social.tiktok || '';
}

function saveSocialMedia() {
    const facebookInput = document.getElementById('socialFacebook');
    const twitterInput = document.getElementById('socialTwitter');
    const instagramInput = document.getElementById('socialInstagram');
    const tiktokInput = document.getElementById('socialTiktok');

    configData.social.facebook = facebookInput ? facebookInput.value : '';
    configData.social.twitter = twitterInput ? twitterInput.value : '';
    configData.social.instagram = instagramInput ? instagramInput.value : '';
    configData.social.tiktok = tiktokInput ? tiktokInput.value : '';

    saveConfiguration();
}



// ============ SAVE TO DATABASE ============
async function saveConfiguration() {
    const saveBtn = event ? event.target : null;
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    }

    try {
        const { error } = await window.supabaseClient
            .from('site_settings')
            .upsert({
                key: 'configuration',
                value: configData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'key'
            });

        if (error) throw error;

        showNotification('Configuration saved successfully!', 'success');

    } catch (err) {
        console.error('Error saving configuration:', err);
        showNotification('Failed to save configuration: ' + err.message, 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    }
}

// ============ EVENT LISTENERS ============
function initEventListeners() {
    // Add Location
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) {
        addLocationBtn.addEventListener('click', showAddLocationModal);
    }

    // Add Property Type
    const addTypeBtn = document.getElementById('addPropertyTypeBtn');
    if (addTypeBtn) {
        addTypeBtn.addEventListener('click', showAddPropertyTypeModal);
    }

    // Save Contact
    const saveContactBtn = document.getElementById('saveContactBtn');
    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', saveContactInfo);
    }

    // Save Social
    const saveSocialBtn = document.getElementById('saveSocialBtn');
    if (saveSocialBtn) {
        saveSocialBtn.addEventListener('click', saveSocialMedia);
    }


}

// ============ CREATE MODALS ============
function createModals() {
    const modalHTML = `
        <!-- Add Item Modal -->
        <div class="modal fade" id="addItemModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg" style="background: var(--bg-surface); color: var(--text-primary);">
                    <div class="modal-header border-0" style="background: var(--bg-surface-2);">
                        <h5 class="modal-title fw-bold" style="color: var(--text-primary);">Add New Item</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="form-label fw-semibold" style="color: var(--text-primary);">Name</label>
                            <input type="text" class="form-control" id="itemInput" placeholder="Enter name"
                                style="background: var(--bg-surface-3); border-color: var(--border); color: var(--text-primary);">
                        </div>
                    </div>
                    <div class="modal-footer border-0" style="background: var(--bg-surface-2);">
                        <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn px-4 fw-semibold" id="saveItemBtn"
                            style="background: var(--gold); color: #fff; border: none;">Add</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============ UTILITIES ============
function showNotification(message, type = 'info') {
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';

    const notification = document.createElement('div');
    notification.className = 'position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <div class="alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} d-flex align-items-center" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            <div>${message}</div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions globally accessible
window.removeLocation = removeLocation;
window.removePropertyType = removePropertyType;
window.showAddLocationModal = showAddLocationModal;
window.showAddPropertyTypeModal = showAddPropertyTypeModal;
