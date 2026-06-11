/* =========================================
   Klem & Keys Admin - Property Management
   Fetch, Filter, Display, and Delete Properties
   With Client-Side Pagination
========================================= */

document.addEventListener('DOMContentLoaded', async () => {

    // --- References ---
    const tableBody = document.getElementById('propertiesTableBody');
    const propertyGrid = document.getElementById('gridView');
    const tableView = document.getElementById('tableView');
    const loadingState = ``;

    // Filters
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const clearPropsBtn = document.getElementById('clearFilters');

    // Stats
    const totalCountEl = document.querySelector('.results-count strong:last-child'); // "of 45 properties"
    const showingCountEl = document.querySelector('.results-count strong:first-child'); // "1-10"

    // Pagination Controls
    const itemsPerPageSelect = document.getElementById('itemsPerPage'); // Make sure this ID exists in HTML
    // Note: If no previous/next buttons exist in HTML, we might need to inject them or user needs to add them. 
    // Assuming standard admin template usually has them or I will check HTML next.

    // State
    let allProperties = [];
    let filteredProperties = [];
    let currentPage = 1;
    let itemsPerPage = 10; // Default matches dropdown usually
    let currentView = 'table'; // 'table' or 'grid'

    // --- 1. Fetch Properties ---
    async function fetchProperties() {
        if (tableBody) tableBody.innerHTML = loadingState;

        try {
            const { data, error } = await window.supabaseClient
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            allProperties = data || [];
            filteredProperties = [...allProperties];
            renderApp();

        } catch (error) {
            console.error('Error fetching properties:', error);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">Error loading data: ${error.message}</td></tr>`;
            window.showCustomAlert('Failed to load properties', 'danger');
        }
    }

    // --- 2. Main Render Logic ---
    function renderApp() {
        // 1. Calculate Pagination
        const totalItems = filteredProperties.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = filteredProperties.slice(startIndex, endIndex);

        // 2. Update Stats
        if (totalCountEl) totalCountEl.textContent = `${totalItems} properties`;
        if (showingCountEl) {
            const displayStart = totalItems === 0 ? 0 : startIndex + 1;
            const displayEnd = Math.min(endIndex, totalItems);
            showingCountEl.textContent = `${displayStart}-${displayEnd}`;
        }

        // 3. Render Views
        renderTable(pageData);
        renderGrid(pageData);

        // 4. Render Pagination Controls
        renderPaginationControls(totalPages);
    }

    // --- 3. View Renderers ---
    function renderTable(properties) {
        if (!tableBody) return;

        if (properties.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5">
                        <div class="d-flex flex-column align-items-center justify-content-center text-muted">
                            <i class="fas fa-folder-open fa-3x mb-3 text-secondary opacity-50"></i>
                            <h5 class="fw-bold mb-1">No Properties Found</h5>
                            <p class="small mb-3">Your property list is currently empty.</p>
                            <a href="property-add.html" class="btn btn-sm btn-primary-gold">
                                <i class="fas fa-plus-circle me-1"></i> Add New Property
                            </a>
                        </div>
                    </td>
                </tr>`;
        } else {
            tableBody.innerHTML = properties.map(prop => `
                <tr class="property-row">
                    <td><input type="checkbox" class="form-check-input row-checkbox" value="${prop.id}"></td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;"><small class="text-muted text-truncate d-inline-block" style="max-width: 80px;" title="${formatRefId(prop)}">${formatRefId(prop)}</small></td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">
                        <img src="${getPropertyImage(prop)}" alt="Img" class="table-img" style="width:40px; height:40px; border-radius: 4px; object-fit: cover;">
                    </td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">
                        <strong class="text-truncate d-inline-block" style="max-width: 150px;" title="${prop.title}">${prop.title}</strong>
                    </td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">
                        <span class="text-truncate d-inline-block" style="max-width: 120px;" title="${prop.location}">${prop.location}</span>
                    </td>
                    <td class="text-price" onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">₦${formatPrice(prop.price)}</td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;"><span class="text-capitalize">${prop.type}</span></td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;"><span class="badge ${getStatusBadgeClass(prop.status)}">${prop.status}</span></td>
                    <td onclick="openPropertyModal('${prop.id}')" style="cursor: pointer;">${new Date(prop.created_at).toLocaleDateString()}</td>
                    <td>
                        <div class="d-flex flex-nowrap align-items-center gap-2">
                            <a href="../property-detail.html?id=${prop.id}" target="_blank" class="btn-icon-view" title="View Public Page">
                                <i class="fas fa-eye"></i>
                            </a>
                            <button class="btn-icon" onclick="window.location.href='property-add.html?id=${prop.id}'" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon text-danger delete-btn" data-id="${prop.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');

            attachActionListeners();
        }
    }

    function renderGrid(properties) {
        if (!propertyGrid) return;

        if (properties.length === 0) {
            propertyGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No properties found.</p>
                </div>`;
        } else {
            propertyGrid.innerHTML = properties.map(prop => `
                <div class="property-card">
                    <div class="property-card-image" style="background-image: url('${getPropertyImage(prop)}');">
                        <span class="badge ${getStatusBadgeClass(prop.status)} card-status-badge">${prop.status}</span>
                        <div class="card-price-badge">₦${formatPrice(prop.price)}</div>
                    </div>
                    <div class="property-card-body">
                        <h5 class="property-card-title mb-1">${prop.title}</h5>
                        <div class="text-muted small mb-3"><i class="fas fa-map-marker-alt text-gold me-1"></i> ${prop.location}</div>
                        
                        <div class="property-card-actions mt-3 d-flex gap-2">
                            <a href="../property-detail.html?id=${prop.id}" target="_blank" class="btn btn-sm btn-outline-darkblue" style="flex: 1;">
                                <i class="fas fa-eye"></i> View
                            </a>
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.location.href='property-add.html?id=${prop.id}'" style="flex: 1;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${prop.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            attachActionListeners();
        }
    }

    function renderPaginationControls(totalPages) {
        // Look for existing pagination wrapper or create one if needed
        let paginationWrapper = document.getElementById('paginationControls');

        // If it doesn't exist, we might need to inject it or update existing logic
        // For now, looking at the layout, let's assume standard Bootstrap pagination controls exist or we will hook into prev/next buttons

        // Update Previous Button
        const prevBtn = document.querySelector('.pagination .page-item:first-child');
        if (prevBtn) {
            if (currentPage === 1) prevBtn.classList.add('disabled');
            else prevBtn.classList.remove('disabled');

            // Remove old listeners to avoid duplicates (naive approach is re-render, better is separate init)
            // Ideally we separate rendering from event binding for static elements. 
            // BUT simplified: we will just update state classes here. Event listeners handle logic.
        }

        // Update Next Button
        const nextBtn = document.querySelector('.pagination .page-item:last-child');
        if (nextBtn) {
            if (currentPage >= totalPages) nextBtn.classList.add('disabled');
            else nextBtn.classList.remove('disabled');
        }

        // Render Page Numbers (Simplified 1, 2, 3...)
        const paginationList = document.querySelector('.pagination');
        if (paginationList) {
            // Clear middle items (keep first and last)
            const children = Array.from(paginationList.children);
            if (children.length > 2) {
                // Determine page range to show
                // ... implementation detail ...
                // For MVP, just updating prev/next state is often enough if we only have prev/next buttons.
                // If there are numbers, let's render them.

                // Let's look for a container specifically for numbers
                // If standard bootstrap pagination: [Previous] [1] [2] [3] [Next]

                // Remove all except first and last
                while (paginationList.children.length > 2) {
                    paginationList.removeChild(paginationList.children[1]);
                }

                // Add Page Numbers
                for (let i = 1; i <= totalPages; i++) {
                    // Show max 5 pages logic or simple all pages if small count
                    if (totalPages > 7 && Math.abs(currentPage - i) > 2 && i !== 1 && i !== totalPages) {
                        if (paginationList.lastElementChild.previousElementSibling.textContent !== '...') {
                            const ellipsis = document.createElement('li');
                            ellipsis.className = 'page-item disabled';
                            ellipsis.innerHTML = '<span class="page-link">...</span>';
                            paginationList.insertBefore(ellipsis, paginationList.lastElementChild);
                        }
                        continue;
                    }

                    const li = document.createElement('li');
                    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                    li.innerHTML = `<button class="page-link" onclick="window.goToPage(${i})">${i}</button>`;
                    paginationList.insertBefore(li, paginationList.lastElementChild);
                }
            }
        }
    }

    // Export goToPage to window for the onclick handlers
    window.goToPage = function (page) {
        currentPage = page;
        renderApp();
    };

    // --- 4. Helpers ---
    function formatPrice(price) {
        return Number(price).toLocaleString();
    }

    function getPropertyImage(prop) {
        if (prop.images && prop.images.length > 0) {
            return prop.images[0];
        }
        return '../assets/img/hero-bg.jpg';
    }

    function formatRefId(property) {
        if (!property.id) return 'N/A';
        const year = new Date(property.created_at).getFullYear();
        const paddedId = String(property.id).padStart(3, '0');
        return `KK-${year}-${paddedId}`;
    }

    function getStatusBadgeClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'available': return 'bg-success';
            case 'sold': return 'bg-danger';
            case 'pending': return 'bg-warning text-dark';
            case 'rented': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    function attachActionListeners() {
        // Delete Buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteProperty(id);
            });
        });
    }

    // --- 5. Filtering ---
    function filterProperties() {
        const term = searchInput.value.toLowerCase();
        const status = statusFilter.value.toLowerCase();
        const type = typeFilter.value.toLowerCase();
        const loc = locationFilter.value.toLowerCase();

        filteredProperties = allProperties.filter(prop => {
            const matchesSearch = prop.title.toLowerCase().includes(term) || prop.location.toLowerCase().includes(term);
            const matchesStatus = status ? prop.status.toLowerCase() === status : true;
            const matchesType = type ? prop.type.toLowerCase() === type : true;
            const matchesLoc = loc ? prop.location.toLowerCase().includes(loc) : true;

            return matchesSearch && matchesStatus && matchesType && matchesLoc;
        });

        currentPage = 1; // Reset to page 1 on filter
        renderApp();
    }

    // Event Listeners for filters
    if (searchInput) searchInput.addEventListener('input', filterProperties);
    if (statusFilter) statusFilter.addEventListener('change', filterProperties);
    if (typeFilter) typeFilter.addEventListener('change', filterProperties);
    if (locationFilter) locationFilter.addEventListener('change', filterProperties);
    if (clearPropsBtn) clearPropsBtn.addEventListener('click', () => {
        searchInput.value = '';
        statusFilter.value = '';
        typeFilter.value = '';
        locationFilter.value = '';
        filterProperties();
    });

    // --- 6. View Toggle ---
    const viewButtons = document.querySelectorAll('.view-toggle button');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            viewButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const view = e.currentTarget.getAttribute('data-view');
            if (view === 'grid') {
                if (tableView) tableView.style.display = 'none';
                if (propertyGrid) propertyGrid.classList.add('active');
                currentView = 'grid';
            } else {
                if (propertyGrid) propertyGrid.classList.remove('active');
                if (tableView) tableView.style.display = 'block';
                currentView = 'table';
            }
        });
    });

    // --- 7. Items Per Page Dropdown ---
    if (itemsPerPageSelect) {
        // Set initial value
        itemsPerPageSelect.value = itemsPerPage;

        itemsPerPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderApp();
        });
    }

    // --- 8. Global Previous/Next Buttons ---
    // If they exist in static HTML (usually they do)
    const prevPageBtn = document.querySelector('.page-item:first-child .page-link');
    const nextPageBtn = document.querySelector('.page-item:last-child .page-link');

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderApp();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                renderApp();
            }
        });
    }

    // --- 9. Delete Action ---
    function deleteProperty(id) {
        // Create modal
        const existingModal = document.querySelector('.delete-confirm-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal fade show delete-confirm-modal';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '1060';

        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg" style="background: var(--bg-surface); color: var(--text-primary);">
                    <div class="modal-header border-0" style="background: var(--bg-surface-2);">
                        <h5 class="modal-title fw-bold" style="color: #ef4444;">Delete Property?</h5>
                        <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body py-4">
                        <p class="mb-0" style="color: var(--text-secondary);">Are you sure you want to permanently delete this property? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer border-0" style="background: var(--bg-surface-2);">
                        <button type="button" class="btn btn-secondary px-4" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="button" class="btn btn-danger px-4 fw-semibold" id="confirmPropDeleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('confirmPropDeleteBtn').addEventListener('click', async function () {
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Deleting...';
            this.disabled = true;

            try {
                // Step 1: Delete all related inquiries first
                const { error: inquiriesError } = await window.supabaseClient
                    .from('inquiries')
                    .delete()
                    .eq('property_id', id);

                if (inquiriesError) {
                    console.warn('No inquiries to delete or error deleting inquiries:', inquiriesError);
                    // Continue anyway - property might not have inquiries
                }

                // Step 2: Now delete the property
                const { error } = await window.supabaseClient
                    .from('properties')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // Remove from local array and re-render
                allProperties = allProperties.filter(p => p.id !== id);
                filterProperties();

                // Close modal after DOM has painted the updated list
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        modal.remove();
                    });
                });

            } catch (error) {
                console.error('Delete error:', error);
                window.showCustomAlert('Failed to delete property: ' + error.message, 'danger');
                modal.remove();
            }
        });
    }

    // --- 10. Export to CSV ---
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportToCSV();
        });
    }

    function exportToCSV() {
        if (!allProperties || allProperties.length === 0) {
            window.showCustomAlert('No properties to export.', 'info');
            return;
        }

        // CSV Header
        const headers = ['Ref ID', 'Title', 'Location', 'Price', 'Status', 'Type', 'Bedrooms', 'Bathrooms', 'Area (sqm)', 'Date Added'];

        // Map data to CSV rows
        const rows = allProperties.map(p => {
            const date = new Date(p.created_at).toLocaleDateString();
            const refId = formatRefId(p);
            // Escape commas in strings by wrapping in quotes
            const title = `"${(p.title || '').replace(/"/g, '""')}"`;
            const loc = `"${(p.location || '').replace(/"/g, '""')}"`;

            return [
                refId,
                title,
                loc,
                p.price,
                p.status,
                p.type,
                p.bedrooms || 0,
                p.bathrooms || 0,
                p.size || 0,
                date
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `klem_properties_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Modal Logic
    window.openPropertyModal = function(id) {
        const prop = allProperties.find(p => p.id == id);
        if (!prop) return;

        document.getElementById('modalPropertyTitle').textContent = prop.title;
        document.getElementById('modalPropertyImage').src = getPropertyImage(prop);
        document.getElementById('modalPropertyLocation').textContent = prop.location || 'N/A';
        document.getElementById('modalPropertyPrice').textContent = '₦' + formatPrice(prop.price);
        document.getElementById('modalPropertyStatus').innerHTML = `<span class="badge ${getStatusBadgeClass(prop.status)}">${prop.status}</span>`;
        document.getElementById('modalPropertyType').textContent = prop.type || 'N/A';
        document.getElementById('modalPropertyDate').textContent = new Date(prop.created_at).toLocaleDateString();
        document.getElementById('modalPropertyDescription').textContent = prop.description || 'No description provided.';
        
        document.getElementById('modalEditBtn').href = 'property-add.html?id=' + prop.id;

        const modal = new bootstrap.Modal(document.getElementById('propertyDetailsModal'));
        modal.show();
    };

    // Initialize
    fetchProperties();

});
