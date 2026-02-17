// Browse Items Page with Flask API Integration
const API_URL = '/api';

let filteredItems = [];
let displayedItems = [];
let itemsPerPage = 6;
let currentPage = 1;

// DOM Elements
const itemsGrid = document.getElementById('items-grid');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const categoryFilter = document.getElementById('category-filter');
const locationFilter = document.getElementById('location-filter');
const sortSelect = document.getElementById('sort-select');
const clearFiltersBtn = document.getElementById('clear-filters');
const loadMoreBtn = document.getElementById('load-more-btn');
const resultsCount = document.getElementById('results-count');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (locationFilter) locationFilter.addEventListener('input', debounce(applyFilters, 300));
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreItems);
}

// Load items from Flask API
async function loadItems() {
    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/items`);
        const data = await response.json();
        
        if (data.success) {
            filteredItems = data.items;
            applyFilters();
        } else {
            showError('Failed to load items');
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showError('Network error. Please check if the Flask server is running on port 5000.');
    }
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply filters and sorting
function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const locationTerm = locationFilter ? locationFilter.value.toLowerCase().trim() : '';
    const sortValue = sortSelect ? sortSelect.value : 'newest';

    // Filter items
    let filtered = filteredItems.filter(item => {
        const matchesSearch = !searchTerm || 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusValue || item.status === statusValue;
        const matchesCategory = !categoryValue || item.category === categoryValue;
        const matchesLocation = !locationTerm || 
            item.location.toLowerCase().includes(locationTerm);

        return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });

    // Sort items
    filtered = sortItems(filtered, sortValue);

    // Reset pagination
    currentPage = 1;
    displayedItems = [];
    filteredItems = filtered;

    // Display results
    loadMoreItems();
    updateResultsCount();
}

// Sort items based on selected option
function sortItems(items, sortValue) {
    const sorted = [...items];
    
    switch (sortValue) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.date_reported) - new Date(a.date_reported));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.date_reported) - new Date(b.date_reported));
            break;
        case 'location':
            sorted.sort((a, b) => a.location.localeCompare(b.location));
            break;
    }
    
    return sorted;
}

// Load more items (pagination)
function loadMoreItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newItems = filteredItems.slice(startIndex, endIndex);

    if (newItems.length > 0) {
        displayedItems = [...displayedItems, ...newItems];
        renderItems();
        currentPage++;
    }

    // Hide load more button if no more items
    const hasMoreItems = endIndex < filteredItems.length;
    if (loadMoreBtn) {
        loadMoreBtn.style.display = hasMoreItems ? 'flex' : 'none';
    }
}

// Render items to the grid
function renderItems() {
    if (!itemsGrid) return;
    
    if (displayedItems.length === 0) {
        itemsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No items found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
        return;
    }

    itemsGrid.innerHTML = displayedItems.map(item => `
        <div class="item-card" onclick="openItemDetail(${item.id})">
            <div class="item-image">
                ${item.image_path ? 
                    `<img src="${API_URL.replace('/api', '')}/uploads/${item.image_path}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;">` :
                    item.image || '📦'
                }
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title}</h3>
                    <span class="status-badge status-${item.status}">${item.status}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span class="item-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${item.location}
                    </span>
                    <span class="item-date">${formatDate(item.date)}</span>
                </div>
                ${item.reward ? `<div class="item-reward">Reward: ${item.reward}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(date) {
    const itemDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return itemDate.toLocaleDateString();
    }
}

// Update results count
function updateResultsCount() {
    if (!resultsCount) return;
    
    const count = filteredItems.length;
    const showing = Math.min(displayedItems.length, count);
    resultsCount.textContent = `Showing ${showing} of ${count} items`;
}

// Clear all filters
function clearAllFilters() {
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (locationFilter) locationFilter.value = '';
    if (sortSelect) sortSelect.value = 'newest';
    
    loadItems();
    showToast('Filters cleared', 'info');
}

// Open item detail page
function openItemDetail(itemId) {
    localStorage.setItem('selectedItemId', itemId);
    window.location.href = 'item-detail.html';
}

// Show loading state
function showLoading() {
    if (itemsGrid) {
        itemsGrid.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading items...</p>
            </div>
        `;
    }
}

// Show error state
function showError(message) {
    if (itemsGrid) {
        itemsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Items</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="loadItems()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
    }
}

// Get URL parameters (for search from home page)
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Handle search from home page
document.addEventListener('DOMContentLoaded', () => {
    const searchQuery = getUrlParameter('search');
    if (searchQuery && searchInput) {
        searchInput.value = decodeURIComponent(searchQuery);
        showToast(`Searching for "${searchQuery}"`, 'info');
    }
});
