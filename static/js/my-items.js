// My Items Page JavaScript
let currentTab = 'all';
let currentEditingItem = null;
let currentDeletingItem = null;
let myItemsData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMyItems();
});

function loadMyItems() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
        // Redirect if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Fetch items from API
    fetch(`/api/items?user_id=${currentUser.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                myItemsData = data.items;
                displayItems(myItemsData);
                updateTabCounts();
            } else {
                showToast('Failed to load items', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading items:', error);
            showToast('Error loading items', 'error');
        });
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Reload items for current tab
    displayItems(myItemsData);
}

function displayItems(allItems) {
    const container = document.getElementById('items-container');
    const emptyState = document.getElementById('empty-state');
    
    // Filter items based on current tab
    let filteredItems = allItems;
    
    if (currentTab !== 'all') {
        filteredItems = allItems.filter(item => item.status === currentTab);
    }
    
    if (filteredItems.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredItems.map(item => `
        <div class="my-item-card" data-item-id="${item.id}">
            <div class="item-card-content">
                <div class="item-card-icon">
                    ${item.image}
                </div>
                
                <div class="item-card-details">
                    <div class="item-card-header">
                        <h3 class="item-card-title">${item.title}</h3>
                        <span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>
                    </div>
                    
                    <div class="item-card-info">
                        <div class="item-info-row">
                            <i class="fas fa-tag"></i>
                            <span>${formatCategory(item.category)}</span>
                        </div>
                        <div class="item-info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${item.location}</span>
                        </div>
                        <div class="item-info-row">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${formatDateTime(item.date, item.time)}</span>
                        </div>
                    </div>
                    
                    <p class="item-card-description">${item.description}</p>
                </div>
                
                <div class="item-card-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewItemDetail(${item.id})">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="editItem(${item.id})">
                        <i class="fas fa-edit"></i>
                        Edit Item
                    </button>
                    ${item.status !== 'recovered' ? `
                        <button class="btn btn-secondary btn-sm" onclick="markAsRecovered(${item.id})">
                            <i class="fas fa-heart"></i>
                            Mark Recovered
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateTabCounts() {
    const totalCount = myItemsData.length;
    const lostCount = myItemsData.filter(item => item.status === 'lost').length;
    const foundCount = myItemsData.filter(item => item.status === 'found').length;
    const recoveredCount = myItemsData.filter(item => item.status === 'recovered').length;
    
    // Update tab labels
    const allTab = document.querySelector('[data-tab="all"]');
    if (allTab) {
        allTab.innerHTML = `<i class="fas fa-list"></i> All Items (${totalCount})`;
    }
    
    const lostTab = document.querySelector('[data-tab="lost"]');
    if (lostTab) {
        lostTab.innerHTML = `<i class="fas fa-exclamation-circle"></i> Lost Items (${lostCount})`;
    }
    
    const foundTab = document.querySelector('[data-tab="found"]');
    if (foundTab) {
        foundTab.innerHTML = `<i class="fas fa-hand-holding"></i> Found Items (${foundCount})`;
    }
    
    const recoveredTab = document.querySelector('[data-tab="recovered"]');
    if (recoveredTab) {
        recoveredTab.innerHTML = `<i class="fas fa-heart"></i> Recovered (${recoveredCount})`;
    }
}

function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }
    
    fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Item deleted successfully', 'success');
            loadMyItems(); // Reload list
        } else {
            showToast(data.error || 'Failed to delete item', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error);
        showToast('Network error', 'error');
    });
}

function markAsRecovered(itemId) {
    if (!confirm('Mark this item as recovered?')) {
        return;
    }
    
    fetch(`/api/items/${itemId}/recover`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Item marked as recovered!', 'success');
            loadMyItems(); // Reload list
        } else {
            showToast(data.error || 'Failed to update status', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
        showToast('Network error', 'error');
    });
}

// Helpers
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatDateTime(dateStr, timeStr) {
    const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
    return date.toLocaleDateString() + (timeStr ? ` at ${timeStr}` : '');
}

function viewItemDetail(id) {
    window.location.href = `item-detail.html?id=${id}`;
}

function editItem(id) {
    // For now, just show a message as edit page is not implemented
    showToast('Edit functionality coming soon!', 'info');
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
    
    // Clear editing state
    if (modalId === 'edit-modal') {
        currentEditingItem = null;
    }
    if (modalId === 'delete-modal') {
        currentDeletingItem = null;
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