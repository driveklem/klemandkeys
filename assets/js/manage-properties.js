// =========================
// MANAGE PROPERTIES SCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    initManageProperties();
});

function initManageProperties() {
    // Set current date
    updateCurrentDate();
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize bulk actions
    initBulkActions();
    
    // Initialize filters
    initPropertyFilters();
    
    // Initialize search
    initPropertySearch();
    
    // Initialize table interactions
    initTableInteractions();
    
    // Initialize modals
    initModals();
    
    // Initialize pagination
    initPagination();
}

// Update current date in header
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Initialize bulk actions dropdown
function initBulkActions() {
    const bulkActionsBtn = document.getElementById('bulkActionsBtn');
    const bulkActionsDropdown = document.getElementById('bulkActionsDropdown');
    const closeBulkActions = document.querySelector('.close-bulk-actions');
    const applyBulkActionBtn = document.getElementById('applyBulkAction');
    const bulkActionSelect = document.getElementById('bulkActionSelect');
    
    if (bulkActionsBtn && bulkActionsDropdown) {
        bulkActionsBtn.addEventListener('click', function() {
            bulkActionsDropdown.classList.toggle('show');
        });
        
        if (closeBulkActions) {
            closeBulkActions.addEventListener('click', function() {
                bulkActionsDropdown.classList.remove('show');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!bulkActionsBtn.contains(e.target) && !bulkActionsDropdown.contains(e.target)) {
                bulkActionsDropdown.classList.remove('show');
            }
        });
        
        if (applyBulkActionBtn && bulkActionSelect) {
            applyBulkActionBtn.addEventListener('click', function() {
                const selectedAction = bulkActionSelect.value;
                if (!selectedAction) {
                    alert('Please select an action first.');
                    return;
                }
                
                const selectedProperties = getSelectedProperties();
                
                if (selectedProperties.length === 0) {
                    alert('Please select at least one property.');
                    return;
                }
                
                performBulkAction(selectedAction, selectedProperties);
                bulkActionsDropdown.classList.remove('show');
                bulkActionSelect.value = '';
            });
        }
    }
}

// Get all selected properties
function getSelectedProperties() {
    const selectedProperties = [];
    const checkboxes = document.querySelectorAll('.property-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const propertyRow = checkbox.closest('.property-row');
        if (propertyRow) {
            const propertyId = propertyRow.dataset.id;
            const propertyName = propertyRow.querySelector('.property-info h4').textContent;
            selectedProperties.push({
                id: propertyId,
                name: propertyName,
                element: propertyRow
            });
        }
    });
    
    return selectedProperties;
}

// Perform bulk action
function performBulkAction(action, properties) {
    console.log(`Performing ${action} on ${properties.length} properties:`, properties);
    
    switch (action) {
        case 'mark-available':
            properties.forEach(prop => {
                updatePropertyStatus(prop.element, 'available');
            });
            showNotification(`${properties.length} properties marked as Available`);
            break;
            
        case 'mark-sold':
            properties.forEach(prop => {
                updatePropertyStatus(prop.element, 'sold');
            });
            showNotification(`${properties.length} properties marked as Sold`);
            break;
            
        case 'mark-featured':
            properties.forEach(prop => {
                const checkbox = prop.element.querySelector('.featured-checkbox');
                if (checkbox) {
                    checkbox.checked = true;
                    // Update data attribute
                    prop.element.dataset.featured = 'true';
                }
            });
            showNotification(`${properties.length} properties marked as Featured`);
            break;
            
        case 'delete':
            if (confirm(`Are you sure you want to delete ${properties.length} selected properties?`)) {
                properties.forEach(prop => {
                    prop.element.remove();
                });
                showNotification(`${properties.length} properties deleted successfully`);
                updateEmptyState();
            }
            break;
            
        case 'export':
            exportToCSV(properties);
            showNotification('Properties exported to CSV');
            break;
            
        default:
            console.log('Unknown action:', action);
    }
}

// Update property status in table
function updatePropertyStatus(rowElement, newStatus) {
    const statusBadge = rowElement.querySelector('.status-badge');
    if (statusBadge) {
        // Update class
        statusBadge.className = 'status-badge';
        statusBadge.classList.add(`status-${newStatus}`);
        
        // Update text
        let statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        if (newStatus === 'available') statusText = 'Available';
        if (newStatus === 'sold') statusText = 'Sold';
        if (newStatus === 'rental') statusText = 'For Rent';
        statusBadge.textContent = statusText;
        
        // Update data attribute
        rowElement.dataset.status = newStatus;
    }
}

// Export properties to CSV
function exportToCSV(properties) {
    const csvContent = [
        ['ID', 'Property Name', 'Type', 'Location', 'Price', 'Status', 'Featured'],
        ...properties.map(prop => [
            prop.id,
            prop.name,
            prop.element.dataset.type,
            prop.element.querySelector('td:nth-child(4)').textContent,
            prop.element.querySelector('.property-price-cell').textContent,
            prop.element.querySelector('.status-badge').textContent,
            prop.element.dataset.featured === 'true' ? 'Yes' : 'No'
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initialize property filters
function initPropertyFilters() {
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    const filterLocation = document.getElementById('filterLocation');
    const filterDate = document.getElementById('filterDate');
    const applyFiltersBtn = document.querySelector('.btn-apply-filters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            resetFilters();
        });
    }
    
    // Apply filters when any filter changes
    [filterType, filterStatus, filterLocation, filterDate].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

// Apply filters to property table
function applyFilters() {
    const typeFilter = document.getElementById('filterType')?.value || 'all';
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    const locationFilter = document.getElementById('filterLocation')?.value || 'all';
    const dateFilter = document.getElementById('filterDate')?.value || 'all';
    
    const propertyRows = document.querySelectorAll('.property-row');
    let visibleCount = 0;
    
    propertyRows.forEach(row => {
        const type = row.dataset.type;
        const status = row.dataset.status;
        const location = row.dataset.location;
        const dateText = row.querySelector('td:nth-child(8)').textContent;
        
        let showRow = true;
        
        // Type filter
        if (typeFilter !== 'all' && type !== typeFilter) {
            showRow = false;
        }
        
        // Status filter
        if (statusFilter !== 'all' && status !== statusFilter) {
            showRow = false;
        }
        
        // Location filter
        if (locationFilter !== 'all' && location !== locationFilter) {
            showRow = false;
        }
        
        // Date filter (simplified implementation)
        if (dateFilter !== 'all' && !checkDateFilter(dateText, dateFilter)) {
            showRow = false;
        }
        
        if (showRow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update empty state
    updateEmptyState();
    
    // Update pagination info
    updatePaginationInfo(visibleCount, propertyRows.length);
}

// Check date filter
function checkDateFilter(dateText, filter) {
    const now = new Date();
    const rowDate = new Date(dateText);
    
    switch (filter) {
        case 'today':
            return rowDate.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return rowDate >= weekAgo;
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return rowDate >= monthAgo;
        default:
            return true;
    }
}

// Reset all filters
function resetFilters() {
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterLocation').value = 'all';
    document.getElementById('filterDate').value = 'all';
    document.getElementById('propertySearch').value = '';
    
    applyFilters();
}

// Initialize property search
function initPropertySearch() {
    const searchInput = document.getElementById('propertySearch');
    const searchBtn = document.querySelector('.btn-search');
    
    if (searchInput) {
        // Search on input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchProperties(this.value);
            }, 300);
        });
        
        // Search on button click
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                searchProperties(searchInput.value);
            });
        }
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProperties(this.value);
            }
        });
    }
}

// Search properties by name or ID
function searchProperties(query) {
    if (!query.trim()) {
        // If search is empty, just apply filters
        applyFilters();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const propertyRows = document.querySelectorAll('.property-row');
    let visibleCount = 0;
    
    propertyRows.forEach(row => {
        const propertyName = row.querySelector('.property-info h4').textContent.toLowerCase();
        const propertyId = row.querySelector('.property-id').textContent.toLowerCase();
        
        if (propertyName.includes(searchTerm) || propertyId.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    updateEmptyState();
    updatePaginationInfo(visibleCount, propertyRows.length);
}

// Initialize table interactions
function initTableInteractions() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.property-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Individual checkboxes
    const propertyCheckboxes = document.querySelectorAll('.property-checkbox');
    propertyCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllCheckbox();
        });
    });
    
    // Featured toggle
    const featuredCheckboxes = document.querySelectorAll('.featured-checkbox');
    featuredCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const propertyRow = this.closest('.property-row');
            if (propertyRow) {
                propertyRow.dataset.featured = this.checked ? 'true' : 'false';
                console.log(`Property ${propertyRow.dataset.id} featured status: ${this.checked}`);
            }
        });
    });
    
    // Action buttons
    initActionButtons();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (!selectAllCheckbox) return;
    
    const checkboxes = document.querySelectorAll('.property-checkbox');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Initialize action buttons
function initActionButtons() {
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const propertyRow = this.closest('.property-row');
            const propertyName = propertyRow.querySelector('.property-info h4').textContent;
            const propertyId = propertyRow.dataset.id;
            
            showDeleteModal(propertyName, propertyId, propertyRow);
        });
    });
    
    // Duplicate buttons
    const duplicateButtons = document.querySelectorAll('.btn-action.duplicate');
    duplicateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const propertyRow = this.closest('.property-row');
            const propertyName = propertyRow.querySelector('.property-info h4').textContent;
            const propertyId = propertyRow.dataset.id;
            
            duplicateProperty(propertyRow);
        });
    });
}

// Show delete confirmation modal
function showDeleteModal(propertyName, propertyId, propertyRow) {
    const deleteModal = document.getElementById('deleteModal');
    const deletePropertyName = document.getElementById('deletePropertyName');
    const cancelBtn = document.querySelector('.btn-cancel-delete');
    const confirmBtn = document.querySelector('.btn-confirm-delete');
    const modalClose = deleteModal.querySelector('.modal-close');
    
    if (deletePropertyName) {
        deletePropertyName.textContent = propertyName;
    }
    
    deleteModal.classList.add('active');
    
    // Close modal functions
    function closeModal() {
        deleteModal.classList.remove('active');
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Confirm deletion
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            // In real application, make API call to delete property
            console.log(`Deleting property: ${propertyName} (ID: ${propertyId})`);
            
            propertyRow.remove();
            closeModal();
            updateEmptyState();
            showNotification('Property deleted successfully');
        };
    }
}

// Duplicate property
function duplicateProperty(propertyRow) {
    const propertyId = propertyRow.dataset.id;
    const propertyName = propertyRow.querySelector('.property-info h4').textContent;
    
    console.log(`Duplicating property: ${propertyName} (ID: ${propertyId})`);
    
    // In real application, this would make an API call to duplicate the property
    // For now, just show a notification
    showNotification('Property duplicated successfully. Edit the new listing.');
    
    // Redirect to add property page with prefilled data
    // window.location.href = `admin-add-property.html?duplicate=${propertyId}`;
}

// Initialize modals
function initModals() {
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Initialize pagination
function initPagination() {
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const pageNumbers = document.querySelectorAll('.pagination-number');
    const perPageSelect = document.getElementById('perPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (!this.disabled) {
                navigateToPage('prev');
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            navigateToPage('next');
        });
    }
    
    pageNumbers.forEach(button => {
        button.addEventListener('click', function() {
            const pageNum = parseInt(this.textContent);
            navigateToPage(pageNum);
        });
    });
    
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function() {
            changePerPage(parseInt(this.value));
        });
    }
}

// Navigate to page
function navigateToPage(page) {
    console.log(`Navigating to page: ${page}`);
    // In real application, this would load new data from server
}

// Change items per page
function changePerPage(count) {
    console.log(`Changing items per page to: ${count}`);
    // In real application, this would reload data with new pagination
}

// Update pagination info
function updatePaginationInfo(visible, total) {
    const startRow = document.getElementById('startRow');
    const endRow = document.getElementById('endRow');
    const totalRows = document.getElementById('totalRows');
    
    if (startRow) startRow.textContent = visible > 0 ? '1' : '0';
    if (endRow) endRow.textContent = visible;
    if (totalRows) totalRows.textContent = total;
}

// Update empty state visibility
function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const propertyRows = document.querySelectorAll('.property-row');
    const visibleRows = Array.from(propertyRows).filter(row => row.style.display !== 'none');
    
    if (emptyState) {
        if (visibleRows.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .admin-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--white);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        border-left: 4px solid var(--gold-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-width: 300px;
        max-width: 400px;
        z-index: 3000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
    }
    
    .admin-notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    
    .notification-content i {
        color: var(--gold-primary);
        font-size: 1.2rem;
    }
    
    .notification-content span {
        color: var(--text-dark);
        font-size: 0.95rem;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 1.25rem;
        cursor: pointer;
        line-height: 1;
    }
    
    .admin-notification.success {
        border-left-color: #22c55e;
    }
    
    .admin-notification.success .notification-content i {
        color: #22c55e;
    }
    
    .admin-notification.error {
        border-left-color: #ef4444;
    }
    
    .admin-notification.error .notification-content i {
        color: #ef4444;
    }
`;
document.head.appendChild(notificationStyles);