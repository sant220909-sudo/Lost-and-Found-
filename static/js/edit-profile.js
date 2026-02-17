// Edit Profile Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentProfile();
    setupFormValidation();
    setupDeleteConfirmation();
});

function loadCurrentProfile() {
    // Load current user data
    const userData = getCurrentUser();
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Populate form with current data
    document.getElementById('fullName').value = userData.name || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('location').value = userData.location || '';
    document.getElementById('bio').value = userData.bio || '';
    
    // Set notification preferences
    if (userData.notifications) {
        document.querySelector('[name="emailNotifications"]').checked = userData.notifications.email !== false;
        document.querySelector('[name="smsNotifications"]').checked = userData.notifications.sms === true;
        document.querySelector('[name="successStories"]').checked = userData.notifications.stories !== false;
    }
    
    // Set privacy settings
    if (userData.privacy) {
        document.querySelector('[name="profileVisibility"]').value = userData.privacy.visibility || 'members';
        document.querySelector('[name="showPhone"]').checked = userData.privacy.showPhone === true;
    }
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (userData) {
        return JSON.parse(userData);
    }
    
    // Return default user for demo
    return {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        phone: '+1 (555) 123-4589',
        location: 'New York, NY',
        bio: 'Community member helping reunite lost items with their owners. Always happy to help!',
        notifications: {
            email: true,
            sms: false,
            stories: true
        },
        privacy: {
            visibility: 'members',
            showPhone: false
        }
    };
}

function setupFormValidation() {
    const form = document.getElementById('edit-profile-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            saveProfile();
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateForm() {
    let isValid = true;
    
    // Validate required fields
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    
    if (!fullName.value.trim()) {
        showFieldError(fullName, 'Full name is required');
        isValid = false;
    }
    
    if (!email.value.trim()) {
        showFieldError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, `${field.labels[0].textContent} is required`);
        return false;
    }
    
    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    if (typeof field === 'object' && field.target) {
        field = field.target;
    }
    
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveProfile() {
    const formData = new FormData(document.getElementById('edit-profile-form'));
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
        showToast('You must be logged in to save changes', 'error');
        return;
    }
    
    // Create updated user object
    const updatedUser = {
        name: formData.get('fullName'),
        email: formData.get('email'), // Email usually shouldn't be changed this way, but keeping for consistency
        phone: formData.get('phone'),
        location: formData.get('location'),
        bio: formData.get('bio'),
        notifications: {
            email: formData.get('emailNotifications') === 'on',
            sms: formData.get('smsNotifications') === 'on',
            stories: formData.get('successStories') === 'on'
        },
        privacy: {
            visibility: formData.get('profileVisibility'),
            showPhone: formData.get('showPhone') === 'on'
        }
    };
    
    // Send update to API
    fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update local storage with new data
            const newUserData = { ...currentUser, ...updatedUser };
            const storageKey = sessionStorage.getItem('userData') ? 'sessionStorage' : 'localStorage';
            
            if (storageKey === 'sessionStorage') {
                sessionStorage.setItem('userData', JSON.stringify(newUserData));
            } else {
                localStorage.setItem('userData', JSON.stringify(newUserData));
            }
            
            showToast('Profile updated successfully!', 'success');
            
            // Update navigation
            updateNavForLoggedInUser(newUserData);
            
            // Redirect back to profile page after a delay
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        } else {
            showToast(data.error || 'Failed to update profile', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showToast('Network error. Please try again later.', 'error');
    });
}

function changeAvatar() {
    showToast('Avatar upload functionality would be implemented here', 'info');
}

function removeAvatar() {
    showToast('Avatar removed', 'success');
}

function cancelEdit() {
    if (hasUnsavedChanges()) {
        if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
            window.location.href = 'profile.html';
        }
    } else {
        window.location.href = 'profile.html';
    }
}

function hasUnsavedChanges() {
    const currentUser = getCurrentUser();
    const form = document.getElementById('edit-profile-form');
    const formData = new FormData(form);
    
    // Check if any field has changed
    return (
        formData.get('fullName') !== currentUser.name ||
        formData.get('email') !== currentUser.email ||
        formData.get('phone') !== currentUser.phone ||
        formData.get('location') !== currentUser.location ||
        formData.get('bio') !== currentUser.bio
    );
}

function deleteAccount() {
    openModal('delete-account-modal');
}

function setupDeleteConfirmation() {
    const confirmInput = document.getElementById('deleteConfirmation');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmInput.addEventListener('input', () => {
        if (confirmInput.value === 'DELETE') {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('disabled');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('disabled');
        }
    });
}

function confirmAccountDeletion() {
    const confirmInput = document.getElementById('deleteConfirmation');
    
    if (confirmInput.value !== 'DELETE') {
        showToast('Please type "DELETE" to confirm', 'error');
        return;
    }
    
    // Clear all user data
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    
    // Clear user's items
    const allItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
    const currentUser = getCurrentUser();
    const filteredItems = allItems.filter(item => 
        item.contact !== currentUser.email && 
        item.postedBy !== currentUser.name
    );
    localStorage.setItem('lostFoundItems', JSON.stringify(filteredItems));
    
    showToast('Account deleted successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Reset delete confirmation
    if (modalId === 'delete-account-modal') {
        document.getElementById('deleteConfirmation').value = '';
        document.getElementById('confirmDeleteBtn').disabled = true;
    }
}

// Update navigation to show logged in state
function updateNavForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        loginBtn.href = 'profile.html';
        loginBtn.classList.add('logged-in');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// Warn about unsaved changes when leaving page
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
    }
});