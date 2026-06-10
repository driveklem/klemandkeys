/* =========================================
   Klem & Keys Admin - Add Property Logic
   Multi-step form, Image Upload, & Supabase Insert
========================================= */

document.addEventListener('DOMContentLoaded', async () => {

    // --- References ---
    const form = document.getElementById('addPropertyForm');
    const propertyId = new URLSearchParams(window.location.search).get('id');
    const isEditMode = !!propertyId;

    // --- 0. Fetch Dynamic Configuration ---
    // Must happen before we try to set values in Edit Mode
    await fetchConfiguration();

    async function fetchConfiguration() {
        try {
            const { data, error } = await window.supabaseClient
                .from('site_settings')
                .select('*')
                .eq('key', 'configuration')
                .maybeSingle();

            if (data && data.value) {
                const config = data.value;

                // Populate Locations
                const locationSelect = document.getElementById('propertyLocation');
                if (locationSelect && config.locations && config.locations.length > 0) {
                    locationSelect.innerHTML = '<option value="">Select Location</option>';
                    config.locations.forEach(loc => {
                        const opt = document.createElement('option');
                        opt.value = loc;
                        opt.textContent = loc;
                        locationSelect.appendChild(opt);
                    });
                }

                // Populate Property Types
                const typeSelect = document.getElementById('propertyType');
                if (typeSelect && config.property_types && config.property_types.length > 0) {
                    typeSelect.innerHTML = '<option value="">Select Type</option>';
                    config.property_types.forEach(type => {
                        const opt = document.createElement('option');
                        opt.value = type.toLowerCase(); // Use lowercase for value
                        opt.textContent = type;
                        typeSelect.appendChild(opt);
                    });
                }
            }
        } catch (err) {
            console.error('Error loading configuration:', err);
        }
    }

    // --- 1. Multi-Step Logic (Preserve existing logic from HTML, improved) ---
    // Note: The HTML already has inline script for basic navigation. 
    // We will hook into the submit event primarily.

    // --- 2. Image Handling ---
    let mainImageFile = null;
    let galleryFiles = [];
    let originalPropertyData = null; // Store original data for edit mode

    const mainImageInput = document.getElementById('mainImage');
    const galleryInput = document.getElementById('galleryImages');

    // Helper: Show Previews
    function updatePreview(input, files) {
        const uploadArea = input.closest('.image-upload-area');

        // Remove existing previews
        const existingPreviews = uploadArea.querySelectorAll('.preview-image, .preview-grid');
        existingPreviews.forEach(el => el.remove());

        if (!files || files.length === 0) return;

        if (files.length === 1 && files[0].type.startsWith('image/')) {
            // Single Image Preview
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image mt-3';
                img.style.maxHeight = '200px';
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                img.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                uploadArea.appendChild(img);
            }
            reader.readAsDataURL(files[0]);
        } else {
            // Multiple Files / Grid Preview
            const grid = document.createElement('div');
            grid.className = 'preview-grid mt-3 d-flex flex-wrap gap-2';
            uploadArea.appendChild(grid);

            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '80px';
                        img.style.height = '80px';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '4px';
                        img.style.border = '1px solid #ddd';
                        grid.appendChild(img);
                    }
                    reader.readAsDataURL(file);
                } else if (file.type === 'application/pdf') {
                    const pdfIcon = document.createElement('div');
                    pdfIcon.innerHTML = `<div class="d-flex flex-column align-items-center justify-content-center bg-light border rounded" style="width: 80px; height: 80px;">
                        <i class="fas fa-file-pdf text-danger fa-2x mb-1"></i>
                        <span style="font-size: 0.6rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 70px;">${file.name}</span>
                    </div>`;
                    grid.appendChild(pdfIcon);
                }
            });
        }

        // Update Text
        const boldText = uploadArea.querySelector('p strong');
        if (boldText) {
            // Store original text if not already stored
            if (!boldText.getAttribute('data-original-text')) {
                boldText.setAttribute('data-original-text', boldText.textContent);
            }
            boldText.textContent = `${files.length} file(s) selected`;
        }
    }

    if (mainImageInput) {
        mainImageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                mainImageFile = e.target.files[0];
                updatePreview(mainImageInput, [mainImageFile]);
            }
        });
    }

    if (galleryInput) {
        galleryInput.addEventListener('change', (e) => {
            galleryFiles = Array.from(e.target.files);
            updatePreview(galleryInput, galleryFiles);
        });
    }

    // --- 3. Pre-fill for Edit Mode ---
    if (isEditMode) {
        document.querySelector('.welcome-title').textContent = 'Edit Property';
        document.querySelector('.page-path strong').textContent = 'Edit Property';
        fetchPropertyDetails(propertyId);
    }

    async function fetchPropertyDetails(id) {
        try {
            const { data, error } = await window.supabaseClient
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            originalPropertyData = data; // Store for later use
            populateForm(data);
        } catch (error) {
            console.error('Error fetching details:', error);
            alert('Failed to load property details.');
        }
    }

    function populateForm(data) {
        // Basic Info
        setVal('propertyTitle', data.title);
        setVal('propertyType', data.type);
        setVal('propertyStatus', data.status);
        setVal('propertyDescription', data.description);

        // Details
        setVal('bedrooms', data.bedrooms);
        setVal('bathrooms', data.bathrooms);
        setVal('areaSize', data.area);
        setVal('propertyPrice', data.price);
        setVal('propertyLocation', data.location);

        // === HANDLE OPTIONAL FIELDS via "features" JSON ===
        // If your DB doesn't have columns, we use existing 'features' JSON column
        let features = data.features;

        // Handle array wrapper if present (DB expects array)
        if (Array.isArray(features) && features.length > 0) {
            features = features[0];
        }

        if (features) {
            // Map known fields if they exist in features
            if (features.parking_spaces) setVal('parkingSpaces', features.parking_spaces);
            if (features.year_built) setVal('yearBuilt', features.year_built);

            // Map amenities (assuming checkboxes have class 'amenity-checkbox' and value matches feature key)
            // Note: HTML might not have these yet, but this logic prepares for it
            if (features.amenities && Array.isArray(features.amenities)) {
                features.amenities.forEach(amenity => {
                    const checkbox = document.querySelector(`input[type="checkbox"][value="${amenity}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }

        // === HANDLE IMAGES (Single Array in DB) ===
        const allImages = data.images || [];
        const mainImage = allImages.length > 0 ? allImages[0] : null; // First image is main
        const galleryImages = allImages.slice(1); // Rest are gallery

        // Display existing main image
        if (mainImage) {
            const mainInput = document.getElementById('mainImage');
            if (mainInput) mainInput.setAttribute('data-has-image', 'true');

            const mainPreviewContainer = document.getElementById('mainImagePreview');
            if (mainPreviewContainer) {
                mainPreviewContainer.innerHTML = `
                    <div class="existing-image-preview">
                        <img src="${mainImage}" alt="Main Image" style="max-width: 200px; border-radius: 8px;">
                        <p class="text-muted small mt-2">Current main image (upload new to replace)</p>
                    </div>
                `;
            }
        }

        // Display existing gallery images
        if (galleryImages.length > 0) {
            const galleryPreviewContainer = document.getElementById('galleryPreview');
            if (galleryPreviewContainer) {
                const imagesHTML = galleryImages.map((url, index) => `
                    <div class="existing-gallery-item" style="display: inline-block; margin: 10px;">
                        <img src="${url}" alt="Gallery ${index + 1}" style="max-width: 150px; border-radius: 8px;">
                    </div>
                `).join('');

                galleryPreviewContainer.innerHTML = `
                    <div class="existing-gallery-preview">
                        ${imagesHTML}
                        <p class="text-muted small mt-2">Current gallery images (${galleryImages.length})</p>
                    </div>
                `;
            }
        }
    }

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    }

    // --- 4. Form Submission ---
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.querySelector('.btn-submit-property');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Saving...';
            submitBtn.disabled = true;

            try {
                // 1. Upload Images
                let mainImageUrl = null;
                if (mainImageFile) {
                    mainImageUrl = await uploadImage(mainImageFile);
                }

                let galleryUrls = [];
                if (galleryFiles.length > 0) {
                    for (const file of galleryFiles) {
                        const url = await uploadImage(file);
                        if (url) galleryUrls.push(url);
                    }
                }

                // If Edit Mode, keep existing images if new ones not uploaded (Implementation logic:
                // We need to know current images. For simplicity, we are appending or replacing in this basic version.
                // A full implementation would need a way to see/remove existing images in UI. 
                // For MVP: If new Main Image uploaded, replace. 

                // 2. Prepare Data
                const features = {
                    parking_spaces: getInt('parkingSpaces'),
                    year_built: getInt('yearBuilt'),
                    amenities: []
                };

                // Gather amenities if checkboxes exist
                const amenityCheckboxes = document.querySelectorAll('input[type="checkbox"].amenity-checkbox:checked');
                amenityCheckboxes.forEach(cb => features.amenities.push(cb.value));

                const formData = {
                    title: getVal('propertyTitle'),
                    type: getVal('propertyType').toLowerCase(),
                    status: getVal('propertyStatus'),
                    description: getVal('propertyDescription'),
                    bedrooms: getInt('bedrooms'),
                    bathrooms: getInt('bathrooms'),
                    area: getInt('areaSize'),
                    price: parseFloat(getVal('propertyPrice')) || 0,
                    location: getVal('propertyLocation'),
                    features: features
                };

                // Handle images: Single 'images' array in DB
                // Start with existing images if in edit mode
                let finalImages = [];

                if (isEditMode && originalPropertyData && originalPropertyData.images) {
                    finalImages = [...originalPropertyData.images]; // Copy existing
                }

                // If new MAIN image is uploaded, it replaces index 0 (or becomes index 0)
                if (mainImageUrl) {
                    if (finalImages.length > 0) {
                        finalImages[0] = mainImageUrl; // Replace main
                    } else {
                        finalImages.push(mainImageUrl); // Add as first
                    }
                }

                // If new GALLERY images are uploaded, append them
                if (galleryUrls.length > 0) {
                    finalImages.push(...galleryUrls);
                }

                // Assign to formData
                formData.images = finalImages.length > 0 ? finalImages : [];

                // Sanitize features (ensure plain object) AND Wrap in Array because DB expects JSON Array
                formData.features = [JSON.parse(JSON.stringify(features))];

                console.log('🚀 Submitting Property Data:', JSON.stringify(formData, null, 2));

                // 3. Insert / Update
                let error;
                if (isEditMode) {
                    const res = await window.supabaseClient
                        .from('properties')
                        .update(formData)
                        .eq('id', propertyId);
                    error = res.error;
                } else {
                    const res = await window.supabaseClient
                        .from('properties')
                        .insert([formData]);
                    error = res.error;
                }

                if (error) throw error;

                // Success
                // Success
                showToast('Property saved successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'properties.html';
                }, 1500);

            } catch (err) {
                console.error('Error saving property:', err);
                showToast('Error: ' + err.message, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Toast Notification Helper
    function showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.custom-toast');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Add animation keyframes if not exists
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async function uploadImage(file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log('Uploading image:', fileName);

            const { data, error } = await window.supabaseClient.storage
                .from('properties') // Bucket name
                .upload(filePath, file);

            if (error) {
                console.error('Upload error:', error);
                alert(`Image upload failed: ${error.message}. Please ensure the 'properties' storage bucket exists in Supabase.`);
                return null;
            }

            // Get Public URL
            const { data: urlData } = window.supabaseClient.storage
                .from('properties')
                .getPublicUrl(filePath);

            console.log('Image uploaded successfully:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (err) {
            console.error('Image upload exception:', err);
            return null;
        }
    }

    function getVal(id) {
        return document.getElementById(id)?.value || '';
    }

    function getInt(id) {
        return parseInt(document.getElementById(id)?.value || '0', 10);
    }

});
