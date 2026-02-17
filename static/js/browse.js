// Browse Items Page JavaScript

const API_URL = '/api';

let allItems = [];
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
    fetchItems();
    setupEventListeners();
});

// Fetch items from API
async function fetchItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const data = await response.json();
        
        if (data.success) {
            allItems = data.items;
            applyFilters();
        } else {
            console.error('Failed to fetch items:', data.error);
            showToast('Failed to load items', 'error');
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        showToast('Network error. Is the server running?', 'error');
    }
}

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    statusFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    locationFilter.addEventListener('input', debounce(applyFilters, 300));
    sortSelect.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    loadMoreBtn.addEventListener('click', loadMoreItems);
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
    const searchTerm = searchInput.value.toLowerCase().trim();
    const statusValue = statusFilter.value;
    const categoryValue = categoryFilter.value;
    const locationTerm = locationFilter.value.toLowerCase().trim();
    const sortValue = sortSelect.value;

    // Combine sample items with user-created items
    // const userItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
    // const combinedItems = [...allItems, ...userItems];
    const combinedItems = [...allItems];

    // Filter items
    filteredItems = combinedItems.filter(item => {
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
    sortItems(sortValue);

    // Reset pagination
    currentPage = 1;
    displayedItems = [];

    // Display results
    loadMoreItems();
    updateResultsCount();
}

// Sort items based on selected option
function sortItems(sortValue) {
    switch (sortValue) {
        case 'newest':
            filteredItems.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
            break;
        case 'oldest':
            filteredItems.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
            break;
        case 'location':
            filteredItems.sort((a, b) => a.location.localeCompare(b.location));
            break;
    }
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
    loadMoreBtn.style.display = hasMoreItems ? 'flex' : 'none';
}

// Render items to the grid
function renderItems() {
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
            <div class="item-image">${item.image}</div>
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
                    <span class="item-date">${formatDate(item.date, item.time)}</span>
                </div>
                ${item.reward ? `<div class="item-reward">Reward: ${item.reward}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(date, time) {
    const itemDate = new Date(date + ' ' + time);
    const now = new Date();
    const diffTime = Math.abs(now - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return itemDate.toLocaleDateString();
    }
}

// Update results count
function updateResultsCount() {
    const count = filteredItems.length;
    const showing = Math.min(displayedItems.length, count);
    resultsCount.textContent = `Showing ${showing} of ${count} items`;
}

// Clear all filters
function clearAllFilters() {
    searchInput.value = '';
    statusFilter.value = '';
    categoryFilter.value = '';
    locationFilter.value = '';
    sortSelect.value = 'newest';
    
    applyFilters();
    showToast('Filters cleared', 'info');
}

// Open item detail page
function openItemDetail(itemId) {
    // Store item ID in localStorage for the detail page
    localStorage.setItem('selectedItemId', itemId);
    window.location.href = 'item-detail.html';
}

// Get URL parameters (for search from home page)
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Handle search from home page
document.addEventListener('DOMContentLoaded', () => {
    const searchQuery = getUrlParameter('search');
    if (searchQuery) {
        searchInput.value = decodeURIComponent(searchQuery);
        applyFilters();
        showToast(`Searching for "${searchQuery}"`, 'info');
    }
});