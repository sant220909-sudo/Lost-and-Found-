// Item Detail Page JavaScript with Flask API Integration
const API_URL = '/api';

let currentItem = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadItemDetail();
});

// Load item detail from Flask API
async function loadItemDetail() {
    const itemId = localStorage.getItem('selectedItemId');
    if (!itemId) {
        showError('No item selected');
        return;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/items/${itemId}`);
        const data = await response.json();
        
        if (data.success && data.item) {
            currentItem = data.item;
            renderItemDetail();
        } else {
            showError('Item not found');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showError('Network error. Please check if the Flask server is running on port 5000.');
    }
}

// Render item detail
function renderItemDetail() {
    const container = document.getElementById('detail-container');
    
    // Get category emoji
    const categoryEmoji = getCategoryEmoji(currentItem.category);
    
    // Determine image display
    let imageDisplay;
    if (currentItem.image_path) {
        // Show uploaded image
        const imageUrl = `${API_URL.replace('/api', '')}/uploads/${currentItem.image_path}`;
        imageDisplay = `<img src="${imageUrl}" alt="${currentItem.title}" style="width:100%;height:auto;max-height:500px;object-fit:contain;border-radius:12px;display:block;" onerror="this.onerror=null;this.parentElement.innerHTML='${categoryEmoji}';">`;
    } else {
        // Show category emoji
        imageDisplay = categoryEmoji;
    }
    
    container.innerHTML = `
        <div class="detail-card">
            <div class="detail-image-section">
                <div class="detail-image">${imageDisplay}</div>
                <div class="status-badge-large status-${currentItem.status}">
                    <i class="fas fa-${currentItem.status === 'lost' ? 'exclamation-circle' : 'hand-holding'}"></i>
                    ${currentItem.status.toUpperCase()}
                </div>
            </div>
            
            <div class="detail-content">
                <div class="detail-header">
                    <h1 class="detail-title">${currentItem.title}</h1>
                    ${currentItem.reward ? `<div class="reward-badge">Reward: ${currentItem.reward}</div>` : ''}
                </div>
                
                <div class="detail-description">
                    <h3>Description</h3>
                    <p>${currentItem.description}</p>
                </div>
                
                <div class="detail-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <div>
                                <strong>Category</strong>
                                <span>${formatCategory(currentItem.category)}</span>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <strong>Location</strong>
                                <span>${currentItem.location}</span>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <strong>Date & Time</strong>
                                <span>${formatDateTime(currentItem.date, currentItem.time)}</span>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <div>
                                <strong>Posted by</strong>
                                <span>${currentItem.posted_by}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-actions">
                    ${currentItem.status === 'lost' ? 
                        `<button class="btn btn-primary" onclick="openClaimModal()">
                            <i class="fas fa-hand-holding"></i>
                            I Think This Is Mine
                        </button>` :
                        `<button class="btn btn-secondary" onclick="openClaimModal()">
                            <i class="fas fa-user-check"></i>
                            This Is My Item
                        </button>`
                    }
                    
                    <button class="btn btn-outline" onclick="openContactModal()">
                        <i class="fas fa-envelope"></i>
                        Contact ${currentItem.status === 'lost' ? 'Owner' : 'Finder'}
                    </button>
                    
                    <button class="btn btn-outline" onclick="shareItem()">
                        <i class="fas fa-share-alt"></i>
                        Share
                    </button>
                </div>
                
                <div class="safety-notice">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <strong>Safety Notice:</strong>
                        <p>Always meet in public places when exchanging items. Verify ownership before handing over valuable items.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Update page title
    document.title = `${currentItem.title} - FindIt`;
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        'electronics': '📱',
        'accessories': '👓',
        'bags': '🎒',
        'documents': '🆔',
        'jewelry': '💍',
        'clothing': '👕',
        'other': '📦'
    };
    return emojis[category] || '📦';
}

// Format category for display
function formatCategory(category) {
    const categories = {
        'electronics': 'Electronics',
        'accessories': 'Accessories',
        'bags': 'Bags & Luggage',
        'documents': 'Documents',
        'jewelry': 'Jewelry',
        'clothing': 'Clothing',
        'other': 'Other'
    };
    return categories[category] || category;
}

// Format date and time for display
function formatDateTime(date, time) {
    if (!date) return 'Date not available';
    
    try {
        const dateTimeStr = time ? `${date} ${time}` : date;
        const itemDate = new Date(dateTimeStr);
        
        if (isNaN(itemDate.getTime())) {
            return date;
        }
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        let formatted = itemDate.toLocaleDateString('en-US', options);
        
        if (time) {
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            formatted += ' at ' + itemDate.toLocaleTimeString('en-US', timeOptions);
        }
        
        return formatted;
    } catch (error) {
        return date;
    }
}

// Show loading state
function showLoading() {
    const container = document.getElementById('detail-container');
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading item details...</p>
            </div>
        `;
    }
}

// Show error when item not found
function showError(message = 'Item not found') {
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Error</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="goBack()">
                <i class="fas fa-arrow-left"></i>
                Go Back
            </button>
        </div>
    `;
}

// Go back to browse page
function goBack() {
    window.history.back();
}

// Open contact modal
function openContactModal() {
    document.getElementById('modal-poster-name').textContent = currentItem.posted_by;
    document.getElementById('modal-contact-email').textContent = currentItem.contact;
    openModal('contact-modal');
}

// Open claim modal
function openClaimModal() {
    openModal('claim-modal');
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Clear form fields
    if (modalId === 'claim-modal') {
        document.getElementById('claim-description').value = '';
        document.getElementById('claim-contact').value = '';
    }
}

// Send message
function sendMessage() {
    showToast('Message sent successfully! The poster will contact you soon.', 'success');
    closeModal('contact-modal');
}

// Submit claim
function submitClaim() {
    const description = document.getElementById('claim-description').value.trim();
    const contact = document.getElementById('claim-contact').value.trim();
    
    if (!description || !contact) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(contact)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Get current user if logged in
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    let user = {};
    if (userData) {
        user = JSON.parse(userData);
    }
    
    // Send claim to backend
    fetch(`${API_URL}/items/${currentItem.id}/claim`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            description: description,
            email: contact,
            name: user.name || 'Anonymous',
            phone: user.phone || ''
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Claim submitted successfully! The poster will review your claim.', 'success');
            closeModal('claim-modal');
        } else {
            showToast(data.error || 'Failed to submit claim', 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting claim:', error);
        showToast('Network error. Please try again later.', 'error');
    });
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Share item
function shareItem() {
    if (navigator.share) {
        navigator.share({
            title: currentItem.title,
            text: `Check out this ${currentItem.status} item: ${currentItem.title}`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!', 'success');
        });
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