// =========================
// UPDATE PROPERTY SCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize update property page
    initUpdateProperty();
});

function initUpdateProperty() {
    // Set current date
    updateCurrentDate();
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize form tabs
    initFormTabs();
    
    // Initialize character counters
    initCharCounters();
    
    // Initialize form fields
    initFormFields();
    
    // Initialize image management
    initImageManagement();
    
    // Initialize price formatting
    initPriceFormatting();
    
    // Initialize modals
    initModals();
    
    // Initialize quick actions
    initQuickActions();
    
    // Initialize form submission
    initFormSubmission();
    
    // Initialize SEO preview
    initSEOPreview();
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

// Initialize form tabs
function initFormTabs() {
    const tabs = document.querySelectorAll('.form-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab panes
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Show selected tab pane
            const selectedPane = document.getElementById(`${tabId}Tab`);
            if (selectedPane) {
                selectedPane.classList.add('active');
            }
        });
    });
}

// Initialize character counters
function initCharCounters() {
    // Description character counter
    const description = document.getElementById('editPropertyDescription');
    const charCount = document.getElementById('editCharCount');
    
    if (description && charCount) {
        description.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Update color based on length
            if (count < 50) {
                charCount.style.color = '#ef4444';
            } else if (count < 100) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = '#22c55e';
            }
            
            // Update SEO preview
            updateSEOPreview();
        });
        
        // Initial count
        charCount.textContent = description.value.length;
    }
    
    // SEO title character counter
    const seoTitle = document.getElementById('seoTitle');
    const seoTitleCount = document.getElementById('seoTitleCount');
    
    if (seoTitle && seoTitleCount) {
        seoTitle.addEventListener('input', function() {
            const count = this.value.length;
            seoTitleCount.textContent = count;
            
            // Update color based on length
            if (count < 50) {
                seoTitleCount.style.color = '#ef4444';
            } else if (count > 60) {
                seoTitleCount.style.color = '#f59e0b';
            } else {
                seoTitleCount.style.color = '#22c55e';
            }
            
            // Update SEO preview
            updateSEOPreview();
        });
        
        // Initial count
        seoTitleCount.textContent = seoTitle.value.length;
    }
    
    // SEO description character counter
    const seoDesc = document.getElementById('seoDescription');
    const seoDescCount = document.getElementById('seoDescCount');
    
    if (seoDesc && seoDescCount) {
        seoDesc.addEventListener('input', function() {
            const count = this.value.length;
            seoDescCount.textContent = count;
            
            // Update color based on length
            if (count < 150) {
                seoDescCount.style.color = '#ef4444';
            } else if (count > 160) {
                seoDescCount.style.color = '#f59e0b';
            } else {
                seoDescCount.style.color = '#22c55e';
            }
            
            // Update SEO preview
            updateSEOPreview();
        });
        
        // Initial count
        seoDescCount.textContent = seoDesc.value.length;
    }
}

// Initialize form fields
function initFormFields() {
    // Update property header when form fields change
    const titleField = document.getElementById('editPropertyTitle');
    const statusField = document.getElementById('editPropertyStatus');
    const priceField = document.getElementById('editPropertyPrice');
    const cityField = document.getElementById('editPropertyCity');
    const stateField = document.getElementById('editPropertyState');
    
    if (titleField) {
        titleField.addEventListener('input', updatePropertyHeader);
    }
    
    if (statusField) {
        statusField.addEventListener('change', updatePropertyHeader);
    }
    
    if (priceField) {
        priceField.addEventListener('input', updatePropertyHeader);
    }
    
    if (cityField && stateField) {
        cityField.addEventListener('input', updatePropertyHeader);
        stateField.addEventListener('change', updatePropertyHeader);
    }
    
    // Original price toggle
    const showOriginalPrice = document.getElementById('showOriginalPrice');
    const originalPriceInput = document.querySelector('.original-price-input');
    
    if (showOriginalPrice && originalPriceInput) {
        showOriginalPrice.addEventListener('change', function() {
            if (this.checked) {
                originalPriceInput.classList.add('show');
            } else {
                originalPriceInput.classList.remove('show');
            }
        });
    }
    
    // Update price display
    initPriceFormatting();
}

// Update property header with current values
function updatePropertyHeader() {
    const titleField = document.getElementById('editPropertyTitle');
    const statusField = document.getElementById('editPropertyStatus');
    const priceField = document.getElementById('editPropertyPrice');
    const cityField = document.getElementById('editPropertyCity');
    const stateField = document.getElementById('editPropertyState');
    const priceUnit = document.getElementById('editPriceUnit');
    const currency = document.getElementById('editPropertyCurrency');
    
    // Update title
    const titleDisplay = document.getElementById('propertyDisplayTitle');
    if (titleField && titleDisplay) {
        titleDisplay.textContent = titleField.value || 'Property Title';
    }
    
    // Update status
    const statusDisplay = document.querySelector('.property-status');
    if (statusField && statusDisplay) {
        const status = statusField.value;
        let statusText = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === 'available') statusText = 'Available';
        if (status === 'sold') statusText = 'Sold';
        if (status === 'rental') statusText = 'For Rent';
        
        statusDisplay.textContent = statusText;
        statusDisplay.className = 'property-status';
        statusDisplay.classList.add(`status-${status}`);
    }
    
    // Update price
    const priceDisplay = document.getElementById('propertyDisplayPrice');
    const priceTypeDisplay = document.querySelector('.price-type');
    if (priceField && priceDisplay && priceTypeDisplay) {
        const price = parseFloat(priceField.value) || 0;
        const unit = priceUnit ? priceUnit.value : 'fixed';
        const currencyCode = currency ? currency.value : 'NGN';
        
        // Format price
        const formattedPrice = formatPrice(price, currencyCode);
        priceDisplay.textContent = formattedPrice;
        
        // Update price type
        let priceType = 'Fixed Price';
        if (unit === 'negotiable') priceType = 'Negotiable';
        if (unit === 'per-square') priceType = 'Per Square Meter';
        if (unit === 'monthly') priceType = 'Monthly Rent';
        if (unit === 'yearly') priceType = 'Yearly Rent';
        
        priceTypeDisplay.textContent = priceType;
    }
    
    // Update location
    const locationDisplay = document.getElementById('propertyDisplayLocation');
    if (cityField && stateField && locationDisplay) {
        const city = cityField.value || '';
        const state = stateField.options[stateField.selectedIndex]?.text || '';
        const locationText = city ? `${city}, ${state}` : 'Location not set';
        locationDisplay.textContent = locationText;
    }
}

// Format price with currency symbol
function formatPrice(amount, currency = 'NGN') {
    const currencySymbols = {
        'NGN': '₦',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || '₦';
    
    // Format number with commas
    const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    return `${symbol}${formattedAmount}`;
}

// Initialize price formatting
function initPriceFormatting() {
    const priceInput = document.getElementById('editPropertyPrice');
    const priceDisplay = document.getElementById('editPriceDisplay');
    const priceUnit = document.getElementById('editPriceUnit');
    const currencySelect = document.getElementById('editPropertyCurrency');
    
    if (priceInput && priceDisplay) {
        const updatePriceDisplay = function() {
            const price = parseFloat(priceInput.value) || 0;
            const unit = priceUnit ? priceUnit.value : 'fixed';
            const currency = currencySelect ? currencySelect.value : 'NGN';
            
            let displayText = '';
            const formattedPrice = formatPrice(price, currency);
            
            switch (unit) {
                case 'fixed':
                    displayText = `Displayed as: ${formattedPrice}`;
                    break;
                case 'negotiable':
                    displayText = `Displayed as: ${formattedPrice} (Negotiable)`;
                    break;
                case 'per-square':
                    displayText = `Displayed as: ${formattedPrice} per square meter`;
                    break;
                case 'monthly':
                    displayText = `Displayed as: ${formattedPrice} per month`;
                    break;
                case 'yearly':
                    displayText = `Displayed as: ${formattedPrice} per year`;
                    break;
            }
            
            priceDisplay.textContent = displayText;
        };
        
        priceInput.addEventListener('input', updatePriceDisplay);
        if (priceUnit) priceUnit.addEventListener('change', updatePriceDisplay);
        if (currencySelect) currencySelect.addEventListener('change', updatePriceDisplay);
        
        // Initial update
        updatePriceDisplay();
    }
}

// Initialize image management
function initImageManagement() {
    // Image click to preview
    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach(container => {
        container.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-action')) {
                const img = this.querySelector('img');
                if (img) {
                    openImagePreview(img.src, img.alt);
                }
            }
        });
    });
    
    // Set as main button
    const setMainButtons = document.querySelectorAll('.set-main');
    setMainButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const imageItem = this.closest('.current-image-item');
            if (imageItem) {
                // Remove main class from all items
                document.querySelectorAll('.current-image-item').forEach(item => {
                    item.classList.remove('main-image');
                });
                
                // Add main class to clicked item
                imageItem.classList.add('main-image');
                
                // Update image in header
                const img = imageItem.querySelector('img');
                if (img) {
                    const headerImg = document.querySelector('.property-thumb-large img');
                    if (headerImg) {
                        headerImg.src = img.src;
                    }
                }
                
                showNotification('Main image updated successfully');
            }
        });
    });
    
    // Delete image button
    const deleteImageButtons = document.querySelectorAll('.delete-image');
    deleteImageButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const imageItem = this.closest('.current-image-item');
            if (imageItem) {
                const isMain = imageItem.classList.contains('main-image');
                
                if (isMain) {
                    if (confirm('This is the main image. Are you sure you want to delete it?')) {
                        imageItem.remove();
                        updateImageCount();
                        showNotification('Image deleted successfully');
                    }
                } else {
                    imageItem.remove();
                    updateImageCount();
                    showNotification('Image deleted successfully');
                }
            }
        });
    });
    
    // Add more images
    const addImageInput = document.querySelector('.add-image-placeholder .file-input');
    if (addImageInput) {
        addImageInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                addNewImages(files);
            }
        });
    }
    
    // Floor plan delete buttons
    const deleteFloorplanButtons = document.querySelectorAll('.delete-floorplan');
    deleteFloorplanButtons.forEach(button => {
        button.addEventListener('click', function() {
            const floorplanItem = this.closest('.floorplan-item');
            if (floorplanItem) {
                floorplanItem.remove();
                showNotification('Floor plan deleted successfully');
            }
        });
    });
    
    // Add floor plan
    const addFloorplanInput = document.querySelector('.add-placeholder .file-input');
    if (addFloorplanInput) {
        addFloorplanInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                addNewFloorplan(files[0]);
            }
        });
    }
    
    // Bulk delete button
    const bulkDeleteBtn = document.querySelector('.btn-bulk-delete');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function() {
            const selectedImages = document.querySelectorAll('.current-image-item.selected');
            if (selectedImages.length > 0) {
                if (confirm(`Delete ${selectedImages.length} selected images?`)) {
                    selectedImages.forEach(img => img.remove());
                    updateImageCount();
                    showNotification(`${selectedImages.length} images deleted successfully`);
                }
            } else {
                alert('Please select images first by clicking on them.');
            }
        });
    }
    
    // Image selection
    document.addEventListener('click', function(e) {
        const imageItem = e.target.closest('.current-image-item');
        if (imageItem && !e.target.closest('.btn-action')) {
            imageItem.classList.toggle('selected');
        }
    });
}

// Add new images to gallery
function addNewImages(files) {
    const galleryGrid = document.querySelector('.current-images-grid');
    const addImageItem = document.querySelector('.add-image-item');
    
    if (!galleryGrid || !addImageItem) return;
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = document.createElement('div');
            imageItem.className = 'current-image-item';
            imageItem.innerHTML = `
                <div class="image-container">
                    <img src="${e.target.result}" alt="New image">
                    <div class="image-overlay">
                        <button type="button" class="btn-action set-main">
                            <i class="fas fa-star"></i> Set as Main
                        </button>
                        <button type="button" class="btn-action delete-image">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Insert before add button
            galleryGrid.insertBefore(imageItem, addImageItem);
            
            // Add event listeners to new buttons
            const setMainBtn = imageItem.querySelector('.set-main');
            const deleteBtn = imageItem.querySelector('.delete-image');
            
            if (setMainBtn) {
                setMainBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    document.querySelectorAll('.current-image-item').forEach(item => {
                        item.classList.remove('main-image');
                    });
                    imageItem.classList.add('main-image');
                    showNotification('Main image updated successfully');
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    imageItem.remove();
                    updateImageCount();
                    showNotification('Image deleted successfully');
                });
            }
            
            // Add click to preview
            const imgContainer = imageItem.querySelector('.image-container');
            if (imgContainer) {
                imgContainer.addEventListener('click', function(e) {
                    if (!e.target.closest('.btn-action')) {
                        const img = this.querySelector('img');
                        if (img) {
                            openImagePreview(img.src, img.alt);
                        }
                    }
                });
            }
            
            updateImageCount();
        };
        
        reader.readAsDataURL(file);
    });
}

// Add new floor plan
function addNewFloorplan(file) {
    const floorplansList = document.querySelector('.floorplans-list');
    const addFloorplan = document.querySelector('.add-floorplan');
    
    if (!floorplansList || !addFloorplan) return;
    
    const floorplanItem = document.createElement('div');
    floorplanItem.className = 'floorplan-item';
    floorplanItem.innerHTML = `
        <div class="floorplan-info">
            <div class="floorplan-icon">
                <i class="${file.type === 'application/pdf' ? 'fas fa-file-pdf' : 'fas fa-image'}"></i>
            </div>
            <div class="floorplan-details">
                <h5>${file.name}</h5>
                <p>${formatFileSize(file.size)}</p>
            </div>
        </div>
        <button type="button" class="delete-floorplan">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Insert before add button
    floorplansList.insertBefore(floorplanItem, addFloorplan);
    
    // Add delete event listener
    const deleteBtn = floorplanItem.querySelector('.delete-floorplan');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            floorplanItem.remove();
            showNotification('Floor plan deleted successfully');
        });
    }
    
    showNotification('Floor plan added successfully');
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update image count
function updateImageCount() {
    const imageCount = document.querySelectorAll('.current-image-item').length;
    const uploadStats = document.querySelector('.upload-stats strong');
    if (uploadStats) {
        uploadStats.textContent = imageCount;
    }
}

// Open image preview modal
function openImagePreview(imageUrl, altText) {
    const modal = document.getElementById('imagePreviewModal');
    const modalImage = document.getElementById('modalPreviewImage');
    const modalClose = modal?.querySelector('.modal-close');
    
    if (modal && modalImage) {
        modalImage.src = imageUrl;
        modalImage.alt = altText;
        modal.classList.add('active');
        
        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        }
        
        // Close when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                modal.classList.remove('active');
            }
        });
    }
}

// Initialize modals
function initModals() {
    // Change status modal
    const changeStatusBtn = document.getElementById('changeStatusBtn');
    const statusModal = document.getElementById('statusChangeModal');
    
    if (changeStatusBtn && statusModal) {
        changeStatusBtn.addEventListener('click', function() {
            statusModal.classList.add('active');
        });
        
        // Close status modal
        const closeBtns = statusModal.querySelectorAll('.modal-close, .btn-cancel-status');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                statusModal.classList.remove('active');
            });
        });
        
        // Update status
        const updateBtn = statusModal.querySelector('.btn-update-status');
        if (updateBtn) {
            updateBtn.addEventListener('click', function() {
                const newStatus = document.getElementById('newPropertyStatus').value;
                const statusField = document.getElementById('editPropertyStatus');
                
                if (statusField) {
                    statusField.value = newStatus;
                    updatePropertyHeader();
                    showNotification('Property status updated successfully');
                }
                
                statusModal.classList.remove('active');
            });
        }
    }
    
    // Delete confirmation modal
    const deleteBtn = document.getElementById('deletePropertyBtn');
    const deleteModal = document.getElementById('deleteConfirmationModal');
    
    if (deleteBtn && deleteModal) {
        deleteBtn.addEventListener('click', function() {
            deleteModal.classList.add('active');
        });
        
        // Close delete modal
        const closeBtns = deleteModal.querySelectorAll('.modal-close, .btn-cancel-delete');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                deleteModal.classList.remove('active');
            });
        });
        
        // Confirm delete
        const confirmBtn = deleteModal.querySelector('.btn-confirm-delete');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                // In a real application, this would make an API call to delete the property
                console.log('Deleting property...');
                
                // Show notification
                showNotification('Property deleted successfully', 'success');
                
                // Redirect to manage properties page
                setTimeout(() => {
                    window.location.href = 'admin-manage-properties.html';
                }, 1500);
                
                deleteModal.classList.remove('active');
            });
        }
    }
}

// Initialize quick actions
function initQuickActions() {
    // Duplicate property button
    const duplicateBtn = document.getElementById('duplicatePropertyBtn');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', function() {
            if (confirm('Create a duplicate of this property?')) {
                // In a real application, this would make an API call to duplicate the property
                console.log('Duplicating property...');
                showNotification('Property duplicated successfully. Redirecting to new property...', 'success');
                
                // Redirect to add property page with prefilled data
                setTimeout(() => {
                    window.location.href = 'admin-add-property.html?duplicate=1';
                }, 1500);
            }
        });
    }
    
    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveProperty('draft');
        });
    }
    
    // Update property button
    const updateBtn = document.getElementById('updatePropertyBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            saveProperty('publish');
        });
    }
}

// Initialize form submission
function initFormSubmission() {
    const form = document.getElementById('updatePropertyForm');
    
    if (!form) return;
    
    // Add validation to required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
    
    // Validate field function
    function validateField() {
        const parent = this.parentElement;
        const existingError = parent.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }
        
        this.classList.remove('error');
        
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.classList.add('error');
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';
            
            parent.appendChild(errorMsg);
            return false;
        }
        
        return true;
    }
}

// Save property function
function saveProperty(action) {
    const form = document.getElementById('updatePropertyForm');
    const updateBtn = document.getElementById('updatePropertyBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    
    if (!form) return;
    
    // Validate all required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField.call(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Collect form data
    const formData = new FormData();
    const formElements = form.elements;
    
    // Add all form fields
    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name && element.type !== 'file') {
            if (element.type === 'checkbox') {
                formData.append(element.name, element.checked);
            } else {
                formData.append(element.name, element.value);
            }
        }
    }
    
    // Add action type
    formData.append('action', action);
    
    console.log('Updating property:', Object.fromEntries(formData));
    
    // Show loading state
    if (updateBtn) {
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Updating...';
        updateBtn.disabled = true;
        
        if (saveDraftBtn) {
            saveDraftBtn.disabled = true;
        }
        
        // Simulate API call
        setTimeout(() => {
            // Reset buttons
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
            
            if (saveDraftBtn) {
                saveDraftBtn.disabled = false;
            }
            
            // Show success message
            const message = action === 'publish' 
                ? 'Property updated successfully!' 
                : 'Property saved as draft successfully!';
            
            showNotification(message, 'success');
            
        }, 2000);
    }
}

// Initialize SEO preview
function initSEOPreview() {
    const seoTitle = document.getElementById('seoTitle');
    const seoDesc = document.getElementById('seoDescription');
    const seoSlug = document.getElementById('seoSlug');
    
    if (seoTitle) {
        seoTitle.addEventListener('input', updateSEOPreview);
    }
    
    if (seoDesc) {
        seoDesc.addEventListener('input', updateSEOPreview);
    }
    
    if (seoSlug) {
        seoSlug.addEventListener('input', updateSEOPreview);
    }
    
    // Initial update
    updateSEOPreview();
}

// Update SEO preview
function updateSEOPreview() {
    const seoTitle = document.getElementById('seoTitle');
    const seoDesc = document.getElementById('seoDescription');
    const seoSlug = document.getElementById('seoSlug');
    const previewTitle = document.getElementById('seoPreviewTitle');
    const previewDesc = document.getElementById('seoPreviewDesc');
    const previewUrl = document.getElementById('seoPreviewUrl');
    
    if (seoTitle && previewTitle) {
        previewTitle.textContent = seoTitle.value || 'SEO Title';
    }
    
    if (seoDesc && previewDesc) {
        previewDesc.textContent = seoDesc.value || 'SEO Description';
    }
    
    if (seoSlug && previewUrl) {
        const slug = seoSlug.value || 'property-slug';
        previewUrl.textContent = `https://klemkeysrealty.com/properties/${slug}`;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `update-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#update-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'update-notification-styles';
        styles.textContent = `
            .update-notification {
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
            
            .update-notification.show {
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
            
            .update-notification.success {
                border-left-color: #22c55e;
            }
            
            .update-notification.success .notification-content i {
                color: #22c55e;
            }
            
            .update-notification.error {
                border-left-color: #ef4444;
            }
            
            .update-notification.error .notification-content i {
                color: #ef4444;
            }
        `;
        document.head.appendChild(styles);
    }
    
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