// Report Found Item functionality with Flask API
const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (!userData) {
        showToast('You must be logged in to report a found item', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const form = document.getElementById('found-item-form');
    const fileInput = document.getElementById('item-image');
    const fileUploadArea = document.querySelector('.file-upload-area');

    // Check if elements exist before adding event listeners
    if (!form || !fileInput || !fileUploadArea) {
        console.error('Required form elements not found');
        return;
    }

    // File upload handling
    fileInput.addEventListener('change', handleFileSelect);
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('drop', handleFileDrop);

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            if (validateFile(file)) {
                updateFileUploadArea(file);
            }
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    }

    function handleFileDrop(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (validateFile(files[0])) {
                fileInput.files = files;
                updateFileUploadArea(files[0]);
            }
        }
    }

    function validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        
        if (!allowedTypes.includes(file.type)) {
            showToast('Please upload only PNG, JPG, or GIF images', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            showToast('File size must be less than 5MB', 'error');
            return false;
        }
        
        return true;
    }

    function updateFileUploadArea(file) {
        const fileName = file.name;
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        fileUploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--secondary-color);"></i>
            <p><strong>${fileName}</strong></p>
            <small>${fileSize} MB uploaded</small>
        `;
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form first
        if (!validateForm()) {
            showToast('Please fill in all required fields correctly', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            // Create FormData object
            const formData = new FormData(form);
            
            // Add user ID if logged in
            if (userData) {
                const user = JSON.parse(userData);
                formData.append('user_id', user.id);
            }
            
            // Send to Flask API
            const response = await fetch(`${API_URL}/report-found`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast(result.message, 'success');
                
                // Reset form
                form.reset();
                resetFileUploadArea();
                
                // Redirect to browse page after a delay
                setTimeout(() => {
                    window.location.href = 'browse.html';
                }, 2000);
            } else {
                showToast(result.error || 'Failed to report item', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('Network error. Please check if the Flask server is running on port 5000.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    function resetFileUploadArea() {
        fileUploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click to upload or drag and drop</p>
            <small>PNG, JPG up to 5MB</small>
        `;
    }

    // Set max date to today
    const dateInput = document.getElementById('date-found');
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
    dateInput.value = today;

    // Auto-suggest current location based on found location
    const locationInput = document.getElementById('location');
    const currentLocationSelect = document.getElementById('current-location');
    
    if (locationInput && currentLocationSelect) {
        locationInput.addEventListener('input', () => {
            const location = locationInput.value.toLowerCase();
            if (location.includes('police') || location.includes('station')) {
                currentLocationSelect.value = 'police-station';
            } else if (location.includes('coffee') || location.includes('shop') || location.includes('store')) {
                currentLocationSelect.value = 'lost-and-found';
            } else {
                currentLocationSelect.value = 'with-me';
            }
        });
    }
});

// Form validation
function validateForm() {
    const requiredFields = ['itemName', 'category', 'description', 'location', 'dateFound', 'contactInfo'];
    let isValid = true;

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (!field || !field.value.trim()) {
            if (field) field.style.borderColor = '#dc2626';
            isValid = false;
        } else {
            if (field) field.style.borderColor = 'var(--border)';
        }
    });

    return isValid;
}
