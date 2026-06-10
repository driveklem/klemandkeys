// =========================
// PROPERTIES LISTING SCRIPT (Dynamic)
// =========================

document.addEventListener('DOMContentLoaded', async function () {
    // 1. Initialize logic
    await initPropertiesPage();
});

let allPropertiesData = []; // Store fetched data
let currentPage = 1;
const itemsPerPage = 6; // Show 6 properties per page

async function initPropertiesPage() {
    // Show loading state
    const grid = document.getElementById('propertiesGrid');
    if (grid) grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading properties...</p></div>';

    // 1. Fetch Configuration (Locations, Types)
    await fetchConfiguration();

    // 2. Fetch Data
    await fetchProperties();

    // 3. Initialize UI handlers
    initFilters();
    initSorting();
    initPagination();
    initClearFilters();

    // 4. Initial Filter Application
    applyFilters();

    // Mobile Toggles
    initMobileToggles();

    // Initialize Animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }
}

// --- Fetch Configuration ---
async function fetchConfiguration() {
    try {
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('*')
            .eq('key', 'configuration')
            .maybeSingle();

        if (data && data.value) {
            const config = data.value;

            // Populate Location Filter
            const locFilter = document.getElementById('locationFilter');
            if (locFilter && config.locations && config.locations.length > 0) {
                locFilter.innerHTML = '<option value="">All Locations</option>';
                config.locations.forEach(loc => {
                    const opt = document.createElement('option');
                    opt.value = loc.toLowerCase();
                    opt.textContent = loc;
                    locFilter.appendChild(opt);
                });
            }

            // Populate Property Type Filter
            const typeFilterContainer = document.getElementById('propertyTypeFilters');
            if (typeFilterContainer && config.property_types && config.property_types.length > 0) {
                typeFilterContainer.innerHTML = `
                    <label class="filter-checkbox">
                        <input type="checkbox" name="propertyType" value="all" checked>
                        <span class="filter-checkmark"></span>
                        <span class="filter-label">All Properties</span>
                    </label>
                `;
                config.property_types.forEach(type => {
                    const typeLower = type.toLowerCase();
                    typeFilterContainer.innerHTML += `
                        <label class="filter-checkbox">
                            <input type="checkbox" name="propertyType" value="${typeLower}">
                            <span class="filter-checkmark"></span>
                            <span class="filter-label">${type}</span>
                        </label>
                    `;
                });

                // Re-attach event listeners for new checkboxes
                // Note: The original initFilters attaches to static elements, so we might need to delegate or re-attach.
                // Since this runs before initFilters, the listener attachment below (in initFilters replacement or modification) needs to handle it.
                // However, properties.js current structure attaches listener in initPropertiesPage -> initFilters -> but dynamically created elements need care.
                // We'll update initFilters logic or delegate.
                // Actually, initFilters handles dynamic attachment if we call it AFTER rendering. 
                // We call fetchConfiguration (which renders) BEFORE initFilters, so standard attachment should work!
            }
        }
    } catch (err) {
        console.error('Error loading configuration:', err);
    }
}

// --- Fetch Data from Supabase ---
async function fetchProperties() {
    try {
        // Simple fetch all for client-side filtering (efficient for < 1000 items)
        const { data, error } = await window.supabaseClient
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allPropertiesData = data || [];
        renderProperties(allPropertiesData);

    } catch (err) {
        console.error('Error fetching properties:', err);
        const grid = document.getElementById('propertiesGrid');
        if (grid) grid.innerHTML = `<div class="col-12 text-center text-danger py-5"><p>Error loading properties. Please try again later.</p></div>`;
    }
}

// --- Render Properties ---
function renderProperties(properties) {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;

    if (properties.length === 0) {
        grid.innerHTML = ''; // Empty, allow no-results logic to handle display
        return;
    }

    grid.innerHTML = properties.map(prop => {
        // Map Database Fields to Display Logic
        const image = (prop.images && prop.images.length > 0) ? prop.images[0] : 'assets/img/property-placeholder.jpg';
        const badge = prop.featured ? '<span class="property-listing-badge">Featured</span>' : '';
        const statusClass = getStatusClass(prop.status);
        const favActive = isFavorite(prop.id) ? 'active' : '';
        const favIcon = favActive ? 'fas fa-heart' : 'far fa-heart';
        const favTitle = favActive ? 'Remove from favorites' : 'Add to favorites';

        return `
            <div class="property-listing-card" 
                 data-id="${prop.id}"
                 data-type="${prop.type?.toLowerCase() || ''}" 
                 data-location="${prop.location?.toLowerCase() || ''}" 
                 data-price="${prop.price || 0}"
                 data-beds="${prop.bedrooms || 0}" 
                 data-status="${prop.status?.toLowerCase() || 'available'}">
                 
              <div class="property-listing-image">
                <img src="${image}" alt="${prop.title}" loading="lazy">
                ${badge}
                <span class="property-listing-status ${statusClass}">${prop.status || 'Available'}</span>
                <button class="btn-favorite ${favActive}" title="${favTitle}" onclick="toggleFavorite(this, '${prop.id}', event)">
                  <i class="${favIcon}"></i>
                </button>
              </div>
              
              <div class="property-listing-content">
                <h3 class="property-listing-title">${prop.title}</h3>
                <p class="property-listing-location">
                  <i class="fas fa-map-marker-alt"></i> ${prop.location}
                </p>
                <div class="property-listing-details">
                  ${prop.bedrooms ? `<span><i class="fas fa-bed"></i> ${prop.bedrooms} Beds</span>` : ''}
                  ${prop.bathrooms ? `<span><i class="fas fa-bath"></i> ${prop.bathrooms} Baths</span>` : ''}
                  ${prop.area ? `<span><i class="fas fa-ruler-combined"></i> ${prop.area} sqm</span>` : ''}
                </div>
                <div class="property-listing-description-box">
                    <p class="property-listing-description">
                    ${truncateText(prop.description, 80)}
                    </p>
                </div>
                <div class="property-listing-footer">
                  <div class="property-listing-price">₦${Number(prop.price).toLocaleString()}</div>
                  <a href="property-detail.html?id=${prop.id}" class="btn btn-view-listing">
                    View Details <i class="fas fa-arrow-right ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
        `;
    }).join('');
}

function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'available': return 'status-available';
        case 'sold': return 'status-sold bg-danger';
        case 'rent': return 'bg-info';
        default: return 'status-available';
    }
}

function truncateText(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}


// --- Filtering Logic (Client Side) ---
function handlePropertyTypeChange(e) {
    const target = e.target;
    const all = document.querySelector('input[name="propertyType"][value="all"]');

    if (target.value === 'all' && target.checked) {
        document.querySelectorAll('input[name="propertyType"]:not([value="all"])').forEach(c => c.checked = false);
    } else if (target.value !== 'all' && target.checked) {
        if (all) all.checked = false;
    }

    // If no type is checked, check 'all' by default (optional UX improvement)
    const anyChecked = document.querySelector('input[name="propertyType"]:checked');
    if (!anyChecked && all) {
        all.checked = true;
    }

    currentPage = 1;
    applyFilters();
}

// Update initFilters to delegate or attach
function initFilters() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        applyFilters();
    }, 300));

    // Property Type (Delegation for dynamic elements)
    const typeContainer = document.getElementById('propertyTypeFilters');
    if (typeContainer) {
        typeContainer.addEventListener('change', (e) => {
            if (e.target.name === 'propertyType') {
                handlePropertyTypeChange(e);
            }
        });
    }

    // Location
    const locFilter = document.getElementById('locationFilter');
    if (locFilter) locFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to page 1 on filter change
        applyFilters();
    });

    // Price
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const priceSlider = document.getElementById('priceSlider');

    if (minPriceInput) minPriceInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        applyFilters();
    }, 300));
    if (maxPriceInput) maxPriceInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        applyFilters();
    }, 300));

    if (priceSlider) {
        priceSlider.addEventListener('input', function () {
            if (minPriceInput) minPriceInput.value = this.value;
            currentPage = 1;
            applyFilters();
        });
    }

    // Bedrooms
    document.querySelectorAll('.btn-bedroom').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-bedroom').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPage = 1;
            applyFilters();
        });
    });

    // Status
    document.querySelectorAll('input[name="status"]').forEach(cb => {
        cb.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    });

    // Mobile Toggle Logic
    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) applyBtn.addEventListener('click', () => {
        applyFilters();
        // Close sidebar on mobile
        const filtersSidebar = document.getElementById('propertiesFilters');
        const filterOverlay = document.getElementById('filterOverlay');
        if (filtersSidebar) filtersSidebar.classList.remove('active');
        if (filterOverlay) filterOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

function handlePropertyTypeChange() {
    const all = document.querySelector('input[name="propertyType"][value="all"]');
    if (this.value === 'all' && this.checked) {
        document.querySelectorAll('input[name="propertyType"]:not([value="all"])').forEach(c => c.checked = false);
    } else if (this.value !== 'all' && this.checked) {
        if (all) all.checked = false;
    }
    currentPage = 1;
    applyFilters();
}

function applyFilters() {
    const propertiesToFilter = allPropertiesData || [];

    // Filter Data
    let filtered = propertiesToFilter.filter(prop => {
        // Collect Filter Values
        const types = Array.from(document.querySelectorAll('input[name="propertyType"]:checked')).map(c => c.value);
        const locationVal = document.getElementById('locationFilter')?.value.toLowerCase();
        const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
        const bedsBtn = document.querySelector('.btn-bedroom.active');
        const minBeds = (bedsBtn && bedsBtn.dataset.beds !== 'any') ? parseInt(bedsBtn.dataset.beds) : 0;
        const statuses = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(c => c.value);

        // Type
        if (types.length > 0 && !types.includes('all')) {
            if (!types.includes(prop.type?.toLowerCase())) return false;
        }

        // Location
        if (locationVal && !prop.location?.toLowerCase().includes(locationVal)) return false;

        // Price
        const price = parseFloat(prop.price) || 0;
        if (price < minPrice || price > maxPrice) return false;

        // Beds
        const beds = parseInt(prop.bedrooms) || 0;
        if (beds < minBeds) return false;

        // Status
        if (statuses.length > 0 && !statuses.includes(prop.status?.toLowerCase())) return false;

        return true;
    });

    // Sort
    const sortBy = document.getElementById('sortBy')?.value || 'newest';
    filtered.sort((a, b) => {
        const pA = parseFloat(a.price) || 0;
        const pB = parseFloat(b.price) || 0;
        if (sortBy === 'price-low') return pA - pB;
        if (sortBy === 'price-high') return pB - pA;
        // created_at desc (default newest)
        return new Date(b.created_at) - new Date(a.created_at);
    });

    // Update Counts
    updateCount(filtered.length);
    toggleNoResults(filtered.length);

    // Pagination Slice
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filtered.slice(start, end);

    renderProperties(paginatedItems);
    renderPagination(filtered.length);
}

// --- Sorting ---
function initSorting() {
    const el = document.getElementById('sortBy');
    if (el) el.addEventListener('change', applyFilters);
    const elMob = document.getElementById('sortByMobile');
    if (elMob) elMob.addEventListener('change', (e) => {
        if (el) el.value = e.target.value;
        applyFilters();
    });
}

// --- Utilities ---
function updateCount(count) {
    const el = document.getElementById('propertiesCount');
    if (el) el.textContent = count;
}

function toggleNoResults(count) {
    const el = document.getElementById('noResults');
    if (el) el.style.display = count === 0 ? 'block' : 'none';
}

function initClearFilters() {
    const btns = [document.getElementById('clearFilters'), document.getElementById('clearFiltersNoResults')];
    btns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            // Reset UI
            document.querySelector('input[name="propertyType"][value="all"]').checked = true;
            document.querySelectorAll('input[name="propertyType"]:not([value="all"])').forEach(c => c.checked = false);
            if (document.getElementById('locationFilter')) document.getElementById('locationFilter').value = '';
            if (document.getElementById('minPrice')) document.getElementById('minPrice').value = '';
            if (document.getElementById('maxPrice')) document.getElementById('maxPrice').value = '';
            document.querySelectorAll('.btn-bedroom').forEach(b => b.classList.remove('active'));
            document.querySelector('.btn-bedroom[data-beds="any"]')?.classList.add('active');

            currentPage = 1;
            applyFilters();
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// --- Pagination Logic ---
function initPagination() {
    // This is called initially, but we update pagination inside applyFilters/render
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');

    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><i class="fas fa-chevron-left"></i></a>`;
    prevLi.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationContainer.appendChild(prevLi);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            applyFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        paginationContainer.appendChild(li);
    }

    // Next Button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><i class="fas fa-chevron-right"></i></a>`;
    nextLi.onclick = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            applyFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationContainer.appendChild(nextLi);
}

// --- Favorites ---
function isFavorite(id) {
    const favs = JSON.parse(localStorage.getItem('property_favorites')) || [];
    return favs.includes(id);
}

window.toggleFavorite = function (btn, id, event) {
    event.preventDefault();
    event.stopPropagation();

    let favs = JSON.parse(localStorage.getItem('property_favorites')) || [];

    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i>';
        showNotification('Removed from favorites');
    } else {
        favs.push(id);
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        showNotification('Added to favorites');
    }

    localStorage.setItem('property_favorites', JSON.stringify(favs));
};

function showNotification(msg) {
    const div = document.createElement('div');
    div.className = 'property-notification show'; // simplified
    div.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; background: white; 
        padding: 15px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999; border-left: 4px solid #b8923b; font-weight: 500;
        animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 10px;
    `;
    div.innerHTML = `<i class="fas fa-check-circle" style="color:#b8923b;"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

function initMobileToggles() {
    const toggle = document.getElementById('mobileFilterToggle');
    const closeBtn = document.getElementById('closeFilters');
    const sidebar = document.getElementById('propertiesFilters');
    const overlay = document.getElementById('filterOverlay');

    if (toggle && sidebar && overlay) {
        // Open filter
        toggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close filter via overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close filter via close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    }
}