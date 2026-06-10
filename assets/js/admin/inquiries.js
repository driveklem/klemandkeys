// ================================================
// ADMIN INQUIRIES MANAGEMENT - DYNAMIC
// ================================================

document.addEventListener('DOMContentLoaded', async function () {
    await initInquiriesPage();
});

let allInquiries = [];

async function initInquiriesPage() {
    // Check Supabase client
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        showError('Database connection error');
        return;
    }

    // Fetch inquiries
    await fetchInquiries();

    // Initialize filters and actions
    initFilters();
}

async function fetchInquiries() {
    try {
        // 1. Fetch Inquiries
        const { data: inquiries, error } = await window.supabaseClient
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allInquiries = inquiries || [];

        // 2. Fetch Related Properties Manually (failsafe if FK missing)
        const propertyIds = [...new Set(allInquiries.map(i => i.property_id).filter(id => id))];

        if (propertyIds.length > 0) {
            const { data: props, error: propError } = await window.supabaseClient
                .from('properties')
                .select('id, title, location')
                .in('id', propertyIds);

            if (!propError && props) {
                // Map property data to inquiries
                allInquiries = allInquiries.map(item => {
                    const prop = props.find(p => p.id === item.property_id);
                    if (prop) {
                        item.properties = prop; // Mimic joined structure
                    }
                    return item;
                });
            }
        }

        renderInquiries(allInquiries);
        updateStats(allInquiries);

    } catch (err) {
        console.error('Error fetching inquiries:', err);
        showError('Failed to load inquiries.');
    }
}

function renderInquiries(inquiries) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (inquiries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No inquiries found</p>
                </td>
            </tr>
        `;
        return;
    }

    // List Render (Update message truncation)
    tbody.innerHTML = inquiries.map(inquiry => {
        // ... (existing variable definitions) ...
        const propertyTitle = inquiry.properties?.title || 'Unknown Property';
        const date = new Date(inquiry.created_at);
        const formattedDate = formatDate(date);
        const statusClass = getStatusClass(inquiry.status);
        const statusLabel = inquiry.status || 'new';

        // Truncate message to 40 chars
        const msgPreview = inquiry.message
            ? (inquiry.message.length > 40 ? inquiry.message.substring(0, 40) + '...' : inquiry.message)
            : 'No message';

        return `
            <tr data-inquiry-id="${inquiry.id}">
                <td>
                    <div><strong>${inquiry.name}</strong></div>
                    <div class="small text-muted">${inquiry.email}</div>
                    <div class="small text-muted">${inquiry.phone || 'N/A'}</div>
                </td>
                <td>
                    <div><strong>${propertyTitle}</strong></div>
                    <div class="small text-muted">${inquiry.properties?.location || ''}</div>
                </td>
                <td>
                    <div class="small text-muted" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${msgPreview}</div>
                </td>
                <td>${formattedDate}</td>
                <td>
                    <select class="form-select form-select-sm status-select" data-inquiry-id="${inquiry.id}" style="width: auto;">
                        <option value="new" ${statusLabel === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${statusLabel === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="closed" ${statusLabel === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-gold view-btn" data-inquiry-id="${inquiry.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-inquiry-id="${inquiry.id}" title="Delete Inquiry">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Add event listeners (Debug log)
    console.log('Attaching event listeners to ' + inquiries.length + ' rows');
    attachEventListeners();
}

// Make functions globally available for debugging
window.viewInquiry = viewInquiry;
window.deleteInquiry = deleteInquiry;

function attachEventListeners() {
    // View button
    const viewBtns = document.querySelectorAll('.view-btn');
    console.log('Found ' + viewBtns.length + ' view buttons');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent any default action
            console.log('View button clicked for ID:', this.dataset.inquiryId);
            const inquiryId = this.dataset.inquiryId;
            viewInquiry(inquiryId);
        });
    });

    // Sub-function for others
    attachOtherListeners();
}

function attachOtherListeners() {
    // Status change
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async function () {
            const inquiryId = this.dataset.inquiryId;
            const newStatus = this.value;
            await updateInquiryStatus(inquiryId, newStatus);
        });
    });

    // Delete button
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const inquiryId = this.dataset.inquiryId;
            confirmDelete(inquiryId);
        });
    });
}

function confirmDelete(inquiryId) {
    // Create modal
    const existingModal = document.querySelector('.delete-confirm-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal fade show delete-confirm-modal';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '1060'; // Higher than view modal if stacked

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header border-bottom-0">
                    <h5 class="modal-title fw-bold text-danger">Delete Inquiry?</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body py-4">
                    <p class="mb-0 text-muted">Are you sure you want to permanently delete this inquiry? This action cannot be undone.</p>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-danger px-4" id="confirmDeleteBtn">Delete</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
        // Show loading state
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Deleting...';
        this.disabled = true;

        await deleteInquiry(inquiryId);

        // Close modal after DOM has painted the updated list
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modal.remove();
            });
        });
    });
}

async function updateInquiryStatus(inquiryId, newStatus) {
    try {
        const { error } = await window.supabaseClient
            .from('inquiries')
            .update({ status: newStatus })
            .eq('id', inquiryId);

        if (error) throw error;

        // Update local data
        const inquiry = allInquiries.find(i => i.id === inquiryId);
        if (inquiry) {
            inquiry.status = newStatus;
            updateStats(allInquiries);
        }

        showNotification('Status updated successfully', 'success');

    } catch (err) {
        console.error('Error updating status:', err);
        showNotification('Failed to update status', 'error');
    }
}

async function deleteInquiry(inquiryId) {
    try {
        const { error } = await window.supabaseClient
            .from('inquiries')
            .delete()
            .eq('id', inquiryId);

        if (error) throw error;

        // Remove from local data
        allInquiries = allInquiries.filter(i => i.id !== inquiryId);
        renderInquiries(allInquiries);
        updateStats(allInquiries);

        showNotification('Inquiry deleted successfully', 'success');

    } catch (err) {
        console.error('Error deleting inquiry:', err);
        showNotification('Failed to delete inquiry', 'error');
    }
}

function viewInquiry(inquiryId) {
    console.log('viewInquiry called with ID:', inquiryId);
    // Convert ID to number if needed (Supabase IDs are likely numbers)
    // But data attribute is string.
    // Try relaxed comparison (==) or string comparison
    const inquiry = allInquiries.find(i => i.id == inquiryId);

    if (!inquiry) {
        console.error('Inquiry not found in local data for ID:', inquiryId);
        console.log('All Inquiries:', allInquiries);
        return;
    }

    const propertyTitle = inquiry.properties?.title || 'Unknown Property';
    const propertyLocation = inquiry.properties?.location || 'N/A';

    // Create modal with proper styling
    const existingModal = document.querySelector('.custom-inquiry-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal fade show custom-inquiry-modal';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '1055'; // Ensure on top

    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-light border-bottom-0 p-4">
                    <div>
                        <h5 class="modal-title fw-bold text-dark mb-1">Inquiry Details</h5>
                        <div class="text-muted small">ID: #${inquiry.id} • ${new Date(inquiry.created_at).toLocaleString()}</div>
                    </div>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                
                <div class="modal-body p-4">
                    <!-- Contact Info Section -->
                    <div class="row g-4 mb-4">
                        <div class="col-md-6">
                            <label class="text-uppercase text-muted small fw-bold mb-2">Client Name</label>
                            <div class="fw-medium text-dark">${inquiry.name}</div>
                        </div>
                        <div class="col-md-6">
                            <label class="text-uppercase text-muted small fw-bold mb-2">Phone</label>
                            <div><a href="tel:${inquiry.phone}" class="text-dark text-decoration-none">${inquiry.phone || 'N/A'}</a></div>
                        </div>
                        <div class="col-12">
                            <label class="text-uppercase text-muted small fw-bold mb-2">Email</label>
                            <div><a href="mailto:${inquiry.email}" class="text-decoration-none" style="color: #b8923b; font-weight: 500;">${inquiry.email}</a></div>
                        </div>
                    </div>

                    <hr class="text-muted opacity-25 my-4">

                    <!-- Property Info -->
                    <div class="row g-4 mb-4">
                        <div class="col-md-8">
                            <label class="text-uppercase text-muted small fw-bold mb-2">Property Interest</label>
                            <div class="fw-bold text-dark fs-5">${propertyTitle}</div>
                            <div class="text-muted small"><i class="fas fa-map-marker-alt me-1"></i> ${propertyLocation}</div>
                            ${inquiry.property_id ? `<a href="../property-detail.html?id=${inquiry.property_id}" target="_blank" class="btn btn-sm btn-gold mt-2">Open Property Page <i class="fas fa-external-link-alt ms-1"></i></a>` : ''}
                        </div>
                        <div class="col-md-4">
                            <label class="text-uppercase text-muted small fw-bold mb-2">Current Status</label>
                            <div><span class="badge ${getStatusClass(inquiry.status)} px-3 py-2">${inquiry.status || 'new'}</span></div>
                        </div>
                    </div>

                    <!-- Message Body -->
                    <div class="bg-light p-4 rounded-3 border">
                        <label class="text-uppercase text-muted small fw-bold mb-3 d-block">Message Content</label>
                        <div class="text-dark" style="white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6;">${inquiry.message || 'No message provided.'}</div>
                    </div>
                </div>

                <div class="modal-footer border-top-0 p-4 bg-light rounded-bottom">
                    <button type="button" class="btn btn-secondary px-4" onclick="this.closest('.modal').remove()">Close</button>
                    ${inquiry.status === 'new' ? `<button type="button" class="btn btn-info px-4 text-white" onclick="updateInquiryStatus(${inquiry.id}, 'read'); this.closest('.modal').remove()">Mark as Read</button>` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function updateStats(inquiries) {
    const totalElement = document.querySelector('.stat-value.text-primary');
    const unreadElement = document.querySelector('.stat-value.text-warning');
    const sidebarBadge = document.getElementById('unreadInquiriesBadge');

    if (totalElement) {
        totalElement.textContent = inquiries.length;
    }

    const newCount = inquiries.filter(i => i.status === 'new').length;

    if (unreadElement) {
        unreadElement.textContent = newCount;
    }

    if (sidebarBadge) {
        sidebarBadge.textContent = newCount;
        sidebarBadge.style.display = newCount > 0 ? 'inline-block' : 'none';
    }
}

function initFilters() {
    // Add filter dropdown if needed
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;

    const filterHTML = `
        <div class="mb-3">
            <select class="form-select" id="statusFilter" style="width: auto; display: inline-block;">
                <option value="all">All Inquiries</option>
                <option value="new">New Only</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
            </select>
        </div>
    `;

    const title = contentArea.querySelector('h1');
    if (title) {
        title.insertAdjacentHTML('afterend', filterHTML);

        document.getElementById('statusFilter').addEventListener('change', function () {
            const filterValue = this.value;
            if (filterValue === 'all') {
                renderInquiries(allInquiries);
            } else {
                const filtered = allInquiries.filter(i => i.status === filterValue);
                renderInquiries(filtered);
            }
        });
    }
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return days + ' days ago';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'new':
            return 'bg-success';
        case 'contacted':
            return 'bg-warning';
        case 'closed':
            return 'bg-secondary';
        default:
            return 'bg-primary';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    const tbody = document.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <p>${message}</p>
                </td>
            </tr>
        `;
    }
}
