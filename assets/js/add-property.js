// =========================
// ADD PROPERTY SCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize add property form
    initAddPropertyForm();
});

function initAddPropertyForm() {
    // Set current date
    updateCurrentDate();
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize form steps
    initFormSteps();
    
    // Initialize character counter
    initCharCounter();
    
    // Initialize image uploads
    initImageUploads();
    
    // Initialize map functionality
    initMapFunctionality();
    
    // Initialize price formatting
    initPriceFormatting();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize preview sidebar
    initPreviewSidebar();
    
    // Initialize form submission
    initFormSubmission();
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

// Initialize form steps navigation
function initFormSteps() {
    const nextButtons = document.querySelectorAll('.btn-next-step');
    const prevButtons = document.querySelectorAll('.btn-prev-step');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    const progressFill = document.getElementById('progressFill');
    
    // Next button handlers
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = document.querySelector('.form-step.active');
            const nextStepId = this.getAttribute('data-next');
            const nextStep = document.getElementById(`step${nextStepId}`);
            
            // Validate current step before proceeding
            if (validateStep(currentStep.id)) {
                // Hide current step
                currentStep.classList.remove('active');
                
                // Show next step
                nextStep.classList.add('active');
                
                // Update progress indicators
                updateProgressIndicators(nextStepId);
                
                // Update preview
                updatePreview();
            }
        });
    });
    
    // Previous button handlers
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = document.querySelector('.form-step.active');
            const prevStepId = this.getAttribute('data-prev');
            const prevStep = document.getElementById(`step${prevStepId}`);
            
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show previous step
            prevStep.classList.add('active');
            
            // Update progress indicators
            updateProgressIndicators(prevStepId);
        });
    });
    
    // Function to update progress indicators
    function updateProgressIndicators(stepId) {
        // Update step numbers
        progressSteps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            
            if (stepNumber < stepId) {
                step.classList.add('completed');
            } else if (stepNumber == stepId) {
                step.classList.add('active');
            }
        });
        
        // Update progress bar
        if (progressFill) {
            const progressPercentage = (stepId / 4) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }
}

// Validate form step
function validateStep(stepId) {
    const stepElement = document.getElementById(stepId);
    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;
    
    // Reset previous error states
    requiredFields.forEach(field => {
        field.classList.remove('error');
        const errorMsg = field.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Check each required field
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            // Add error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';
            
            field.parentElement.appendChild(errorMsg);
        }
    });
    
    // Special validation for step 1 (description length)
    if (stepId === 'step1') {
        const description = document.getElementById('propertyDescription');
        if (description && description.value.length < 50) {
            isValid = false;
            description.classList.add('error');
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Description must be at least 50 characters';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';
            
            description.parentElement.appendChild(errorMsg);
        }
    }
    
    // Special validation for step 3 (main image)
    if (stepId === 'step3') {
        const mainImageInput = document.getElementById('mainImage');
        if (mainImageInput && !mainImageInput.files.length) {
            isValid = false;
            mainImageInput.classList.add('error');
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Main image is required';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';
            
            mainImageInput.parentElement.appendChild(errorMsg);
        }
    }
    
    if (!isValid) {
        // Scroll to first error
        const firstError = stepElement.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

// Initialize character counter for description
function initCharCounter() {
    const description = document.getElementById('propertyDescription');
    const charCount = document.getElementById('charCount');
    
    if (description && charCount) {
        // Update count on input
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
        });
        
        // Initial count
        charCount.textContent = description.value.length;
    }
}

// Initialize image uploads
function initImageUploads() {
    initMainImageUpload();
    initGalleryUpload();
    initFloorplansUpload();
    initImagePreviewModal();
}

// Main image upload
function initMainImageUpload() {
    const mainImageUpload = document.getElementById('mainImageUpload');
    const mainImageInput = document.getElementById('mainImage');
    const mainImagePreview = document.getElementById('mainImagePreview');
    
    if (!mainImageUpload || !mainImageInput) return;
    
    // Click event
    mainImageUpload.addEventListener('click', function(e) {
        if (!e.target.closest('.remove-main-image')) {
            mainImageInput.click();
        }
    });
    
    // File selection
    mainImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            previewMainImage(file);
        }
    });
    
    // Drag and drop
    mainImageUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--gold-primary)';
        this.style.background = 'rgba(184, 146, 59, 0.05)';
    });
    
    mainImageUpload.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
    });
    
    mainImageUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            mainImageInput.files = e.dataTransfer.files;
            previewMainImage(file);
        }
    });
    
    // Preview function
    function previewMainImage(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            mainImagePreview.innerHTML = `
                <div class="main-image-preview">
                    <img src="${e.target.result}" alt="Main Property Image">
                    <button type="button" class="remove-main-image" title="Remove image">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            mainImagePreview.classList.add('show');
            
            // Add remove functionality
            const removeBtn = mainImagePreview.querySelector('.remove-main-image');
            if (removeBtn) {
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    mainImagePreview.innerHTML = '';
                    mainImagePreview.classList.remove('show');
                    mainImageInput.value = '';
                });
            }
            
            // Update preview
            updatePreview();
        };
        
        reader.readAsDataURL(file);
    }
}

// Gallery images upload
function initGalleryUpload() {
    const galleryUpload = document.getElementById('galleryUpload');
    const galleryInput = galleryUpload?.querySelector('.file-input');
    const galleryPreview = document.getElementById('galleryPreview');
    const imageCount = document.getElementById('imageCount');
    
    if (!galleryUpload || !galleryInput || !galleryPreview) return;
    
    let galleryImages = [];
    const MAX_IMAGES = 20;
    
    // Click event
    galleryUpload.addEventListener('click', function(e) {
        if (e.target.closest('.gallery-upload-item') || e.target.closest('.upload-placeholder')) {
            galleryInput.click();
        }
    });
    
    // File selection
    galleryInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const validImages = files.filter(file => file.type.startsWith('image/'));
        
        if (validImages.length > 0) {
            addGalleryImages(validImages);
        }
    });
    
    // Drag and drop
    galleryUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--gold-primary)';
        this.style.background = 'rgba(184, 146, 59, 0.05)';
    });
    
    galleryUpload.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
    });
    
    galleryUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        
        const files = Array.from(e.dataTransfer.files);
        const validImages = files.filter(file => file.type.startsWith('image/'));
        
        if (validImages.length > 0) {
            addGalleryImages(validImages);
        }
    });
    
    // Add images to gallery
    function addGalleryImages(images) {
        const remainingSlots = MAX_IMAGES - galleryImages.length;
        
        if (remainingSlots <= 0) {
            alert(`Maximum ${MAX_IMAGES} images allowed`);
            return;
        }
        
        const imagesToAdd = images.slice(0, remainingSlots);
        
        imagesToAdd.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageData = {
                    id: Date.now() + Math.random(),
                    url: e.target.result,
                    file: file
                };
                
                galleryImages.push(imageData);
                renderGalleryPreview();
                updateImageCount();
                updatePreview();
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Render gallery preview
    function renderGalleryPreview() {
        galleryPreview.innerHTML = '';
        
        // Add existing images
        galleryImages.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-preview-item';
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="Gallery image ${index + 1}">
                <button type="button" class="remove-gallery-image" data-id="${image.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            galleryPreview.appendChild(galleryItem);
            
            // Add click to preview
            galleryItem.addEventListener('click', function(e) {
                if (!e.target.closest('.remove-gallery-image')) {
                    openImagePreview(image.url, index);
                }
            });
        });
        
        // Add upload button if there's space
        if (galleryImages.length < MAX_IMAGES) {
            const uploadItem = document.createElement('div');
            uploadItem.className = 'gallery-upload-item';
            uploadItem.innerHTML = `
                <div class="upload-placeholder">
                    <i class="fas fa-plus"></i>
                    <p>Add Image</p>
                    <input type="file" accept="image/*" class="file-input" multiple>
                </div>
            `;
            galleryPreview.appendChild(uploadItem);
            
            // Add event listener to new input
            const newInput = uploadItem.querySelector('.file-input');
            if (newInput) {
                newInput.addEventListener('change', function(e) {
                    const files = Array.from(e.target.files);
                    const validImages = files.filter(file => file.type.startsWith('image/'));
                    
                    if (validImages.length > 0) {
                        addGalleryImages(validImages);
                    }
                });
            }
        }
        
        // Add remove functionality
        const removeButtons = galleryPreview.querySelectorAll('.remove-gallery-image');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const imageId = this.getAttribute('data-id');
                removeGalleryImage(imageId);
            });
        });
    }
    
    // Remove gallery image
    function removeGalleryImage(imageId) {
        galleryImages = galleryImages.filter(img => img.id != imageId);
        renderGalleryPreview();
        updateImageCount();
    }
    
    // Update image count
    function updateImageCount() {
        if (imageCount) {
            imageCount.textContent = galleryImages.length;
        }
    }
}

// Floor plans upload
function initFloorplansUpload() {
    const floorplansUpload = document.getElementById('floorplansUpload');
    const floorplansInput = floorplansUpload?.querySelector('.file-input');
    const floorplansList = document.getElementById('floorplansList');
    
    if (!floorplansUpload || !floorplansInput || !floorplansList) return;
    
    let floorplans = [];
    
    // Click event
    floorplansUpload.addEventListener('click', function(e) {
        if (e.target.closest('.upload-placeholder')) {
            floorplansInput.click();
        }
    });
    
    // File selection
    floorplansInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        if (files.length > 0) {
            addFloorplans(files);
        }
    });
    
    // Add floorplans
    function addFloorplans(files) {
        files.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const floorplanData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    url: e.target.result,
                    file: file
                };
                
                floorplans.push(floorplanData);
                renderFloorplansList();
            };
            
            if (file.type === 'application/pdf') {
                // For PDFs, we don't need to read as data URL
                const floorplanData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    file: file
                };
                
                floorplans.push(floorplanData);
                renderFloorplansList();
            } else {
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Render floorplans list
    function renderFloorplansList() {
        floorplansList.innerHTML = '';
        
        floorplans.forEach((floorplan, index) => {
            const floorplanItem = document.createElement('div');
            floorplanItem.className = 'floorplan-item';
            floorplanItem.innerHTML = `
                <div class="floorplan-info">
                    <div class="floorplan-icon">
                        <i class="${floorplan.type === 'application/pdf' ? 'fas fa-file-pdf' : 'fas fa-image'}"></i>
                    </div>
                    <div class="floorplan-details">
                        <h5>${floorplan.name}</h5>
                        <p>${floorplan.size}</p>
                    </div>
                </div>
                <button type="button" class="remove-floorplan" data-id="${floorplan.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            floorplansList.appendChild(floorplanItem);
        });
        
        // Add remove functionality
        const removeButtons = floorplansList.querySelectorAll('.remove-floorplan');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const floorplanId = this.getAttribute('data-id');
                removeFloorplan(floorplanId);
            });
        });
    }
    
    // Remove floorplan
    function removeFloorplan(floorplanId) {
        floorplans = floorplans.filter(fp => fp.id != floorplanId);
        renderFloorplansList();
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize image preview modal
function initImagePreviewModal() {
    const modal = document.getElementById('imagePreviewModal');
    const modalImage = document.getElementById('modalPreviewImage');
    const modalClose = modal?.querySelector('.modal-close');
    const removeBtn = modal?.querySelector('.btn-remove-image');
    const setMainBtn = modal?.querySelector('.btn-set-as-main');
    
    if (!modal) return;
    
    let currentImageIndex = -1;
    
    // Open image preview
    window.openImagePreview = function(imageUrl, index) {
        if (modalImage) {
            modalImage.src = imageUrl;
            currentImageIndex = index;
            modal.classList.add('active');
        }
    };
    
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
    
    // Remove image
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (currentImageIndex >= 0) {
                // Remove from gallery
                // This would need access to the galleryImages array
                // For now, just close the modal
                modal.classList.remove('active');
            }
        });
    }
    
    // Set as main image
    if (setMainBtn) {
        setMainBtn.addEventListener('click', function() {
            if (currentImageIndex >= 0) {
                // Set as main image
                // This would need access to the galleryImages array
                // For now, just close the modal
                modal.classList.remove('active');
            }
        });
    }
}

// Initialize map functionality
function initMapFunctionality() {
    const mapPlaceholder = document.getElementById('mapPlaceholder');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const getLocationBtn = document.querySelector('.btn-get-location');
    
    if (mapPlaceholder) {
        mapPlaceholder.addEventListener('click', function() {
            // In a real application, this would open a map modal
            // For now, just set default Abuja coordinates
            if (latitudeInput) latitudeInput.value = '9.0765';
            if (longitudeInput) longitudeInput.value = '7.3986';
            
            alert('Map functionality would open here. Using default Abuja coordinates.');
        });
    }
    
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        if (latitudeInput) latitudeInput.value = position.coords.latitude.toFixed(6);
                        if (longitudeInput) longitudeInput.value = position.coords.longitude.toFixed(6);
                    },
                    function(error) {
                        alert('Unable to get your location. Please enable location services.');
                        console.error('Geolocation error:', error);
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });
    }
}

// Initialize price formatting
function initPriceFormatting() {
    const priceInput = document.getElementById('propertyPrice');
    const priceDisplay = document.getElementById('priceDisplay');
    const priceUnit = document.getElementById('priceUnit');
    const currencySelect = document.getElementById('propertyCurrency');
    
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
            
            // Update preview
            updatePreview();
        };
        
        priceInput.addEventListener('input', updatePriceDisplay);
        if (priceUnit) priceUnit.addEventListener('change', updatePriceDisplay);
        if (currencySelect) currencySelect.addEventListener('change', updatePriceDisplay);
        
        // Initial update
        updatePriceDisplay();
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

// Initialize form validation
function initFormValidation() {
    const form = document.getElementById('addPropertyForm');
    
    if (!form) return;
    
    // Add real-time validation to required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Validate individual field
    function validateField(field) {
        const parent = field.parentElement;
        const existingError = parent.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }
        
        field.classList.remove('error');
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('error');
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';
            
            parent.appendChild(errorMsg);
            return false;
        }
        
        // Special validation for email fields
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.classList.add('error');
                
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Please enter a valid email address';
                errorMsg.style.color = '#ef4444';
                errorMsg.style.fontSize = '0.85rem';
                errorMsg.style.marginTop = '0.25rem';
                
                parent.appendChild(errorMsg);
                return false;
            }
        }
        
        // Special validation for number fields
        if (field.type === 'number' && field.value.trim()) {
            if (field.min && parseFloat(field.value) < parseFloat(field.min)) {
                field.classList.add('error');
                
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = `Value must be at least ${field.min}`;
                errorMsg.style.color = '#ef4444';
                errorMsg.style.fontSize = '0.85rem';
                errorMsg.style.marginTop = '0.25rem';
                
                parent.appendChild(errorMsg);
                return false;
            }
        }
        
        return true;
    }
}

// Initialize preview sidebar
function initPreviewSidebar() {
    const toggleBtn = document.getElementById('togglePreview');
    const previewContent = document.getElementById('previewContent');
    
    if (toggleBtn && previewContent) {
        let isPreviewVisible = true;
        
        toggleBtn.addEventListener('click', function() {
            isPreviewVisible = !isPreviewVisible;
            
            if (isPreviewVisible) {
                previewContent.style.display = 'block';
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
                toggleBtn.title = 'Hide Preview';
            } else {
                previewContent.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                toggleBtn.title = 'Show Preview';
            }
        });
    }
    
    // Initial preview update
    updatePreview();
}

// Update preview with form data
function updatePreview() {
    // Update title
    const titleInput = document.getElementById('propertyTitle');
    const previewTitle = document.getElementById('previewTitle');
    if (titleInput && previewTitle) {
        previewTitle.textContent = titleInput.value || 'Property Title';
    }
    
    // Update location
    const stateSelect = document.getElementById('propertyState');
    const cityInput = document.getElementById('propertyCity');
    const previewLocation = document.getElementById('previewLocation');
    if (stateSelect && cityInput && previewLocation) {
        const stateText = stateSelect.options[stateSelect.selectedIndex]?.text || '';
        const cityText = cityInput.value || '';
        const locationText = cityText ? `${cityText}, ${stateText}` : 'Location not set';
        previewLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${locationText}`;
    }
    
    // Update bedrooms
    const bedroomsSelect = document.getElementById('bedrooms');
    const previewBedrooms = document.getElementById('previewBedrooms');
    if (bedroomsSelect && previewBedrooms) {
        const beds = bedroomsSelect.value || '0';
        previewBedrooms.textContent = `${beds} ${beds === '1' ? 'Bed' : 'Beds'}`;
    }
    
    // Update bathrooms
    const bathroomsSelect = document.getElementById('bathrooms');
    const previewBathrooms = document.getElementById('previewBathrooms');
    if (bathroomsSelect && previewBathrooms) {
        const baths = bathroomsSelect.value || '0';
        previewBathrooms.textContent = `${baths} ${baths === '1' ? 'Bath' : 'Baths'}`;
    }
    
    // Update area
    const areaInput = document.getElementById('areaSize');
    const areaUnit = document.getElementById('areaUnit');
    const previewArea = document.getElementById('previewArea');
    if (areaInput && areaUnit && previewArea) {
        const area = areaInput.value || '0';
        const unit = areaUnit.options[areaUnit.selectedIndex]?.text || 'sqm';
        previewArea.textContent = `${area} ${unit}`;
    }
    
    // Update price
    const priceInput = document.getElementById('propertyPrice');
    const priceUnit = document.getElementById('priceUnit');
    const currencySelect = document.getElementById('propertyCurrency');
    const previewPrice = document.getElementById('previewPrice');
    if (priceInput && previewPrice) {
        const price = parseFloat(priceInput.value) || 0;
        const currency = currencySelect ? currencySelect.value : 'NGN';
        const unit = priceUnit ? priceUnit.value : 'fixed';
        
        let priceText = formatPrice(price, currency);
        
        switch (unit) {
            case 'negotiable':
                priceText += ' (Negotiable)';
                break;
            case 'per-square':
                priceText += ' per sqm';
                break;
            case 'monthly':
                priceText += ' /month';
                break;
            case 'yearly':
                priceText += ' /year';
                break;
        }
        
        previewPrice.textContent = priceText;
    }
    
    // Update status
    const statusSelect = document.getElementById('propertyStatus');
    const previewStatus = document.getElementById('previewStatus');
    if (statusSelect && previewStatus) {
        const status = statusSelect.value || 'available';
        let statusText = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === 'available') statusText = 'Available';
        if (status === 'sold') statusText = 'Sold';
        if (status === 'rental') statusText = 'For Rent';
        
        previewStatus.textContent = `Status: ${statusText}`;
    }
    
    // Update description
    const descriptionInput = document.getElementById('propertyDescription');
    const previewDescription = document.getElementById('previewDescription');
    if (descriptionInput && previewDescription) {
        const description = descriptionInput.value || 'No description added yet.';
        previewDescription.textContent = description.length > 200 
            ? description.substring(0, 200) + '...' 
            : description;
    }
    
    // Update features
    const amenities = document.querySelectorAll('.amenity-input:checked');
    const previewFeatures = document.getElementById('previewFeatures');
    if (previewFeatures) {
        if (amenities.length > 0) {
            previewFeatures.innerHTML = '';
            amenities.forEach(checkbox => {
                const label = checkbox.closest('.amenity-label');
                if (label) {
                    const featureName = label.textContent.trim();
                    const featureItem = document.createElement('span');
                    featureItem.className = 'feature-item';
                    featureItem.textContent = featureName;
                    previewFeatures.appendChild(featureItem);
                }
            });
        } else {
            previewFeatures.innerHTML = '<span class="feature-item">No features selected</span>';
        }
    }
}

// Initialize form submission
function initFormSubmission() {
    const form = document.getElementById('addPropertyForm');
    const submitBtn = form?.querySelector('.btn-submit-property');
    const saveDraftBtn = form?.querySelector('.btn-save-draft');
    
    if (!form) return;
    
    // Submit form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all steps
        const steps = document.querySelectorAll('.form-step');
        let isValid = true;
        
        steps.forEach(step => {
            if (!validateStep(step.id)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            submitProperty('publish');
        }
    });
    
    // Save as draft
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            submitProperty('draft');
        });
    }
    
    // Submit property function
    function submitProperty(action) {
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
        
        // Add main image
        const mainImageInput = document.getElementById('mainImage');
        if (mainImageInput && mainImageInput.files[0]) {
            formData.append('mainImage', mainImageInput.files[0]);
        }
        
        // Add gallery images
        // Note: In a real application, you would need to handle multiple file uploads properly
        
        // Add action type
        formData.append('action', action);
        
        console.log('Submitting property:', Object.fromEntries(formData));
        
        // Show loading state
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Publishing...';
            submitBtn.disabled = true;
            
            if (saveDraftBtn) {
                saveDraftBtn.disabled = true;
            }
            
            // Simulate API call
            setTimeout(() => {
                // Reset buttons
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (saveDraftBtn) {
                    saveDraftBtn.disabled = false;
                }
                
                // Show success message
                const message = action === 'publish' 
                    ? 'Property published successfully!' 
                    : 'Property saved as draft successfully!';
                
                showNotification(message, 'success');
                
                // Redirect to manage properties page
                setTimeout(() => {
                    window.location.href = 'admin-manage-properties.html';
                }, 1500);
                
            }, 2000);
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `form-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#form-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'form-notification-styles';
        styles.textContent = `
            .form-notification {
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
            
            .form-notification.show {
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
            
            .form-notification.success {
                border-left-color: #22c55e;
            }
            
            .form-notification.success .notification-content i {
                color: #22c55e;
            }
            
            .form-notification.error {
                border-left-color: #ef4444;
            }
            
            .form-notification.error .notification-content i {
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