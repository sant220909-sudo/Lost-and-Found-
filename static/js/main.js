// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-icon');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Search functionality
const heroSearch = document.getElementById('hero-search');
const searchBtn = document.querySelector('.search-btn');

if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
}

if (heroSearch) {
    heroSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

function handleSearch() {
    const query = heroSearch.value.trim();
    if (query) {
        // For now, redirect to browse page with search query
        window.location.href = `browse.html?search=${encodeURIComponent(query)}`;
    }
}

// Sample data for recent items
const sampleItems = [
    {
        id: 1,
        title: "iPhone 13 Pro",
        description: "Lost near Central Park, black case with blue phone",
        status: "lost",
        location: "Central Park, NYC",
        date: "2 hours ago",
        image: "📱"
    },
    {
        id: 2,
        title: "Brown Leather Wallet",
        description: "Found on subway platform, contains ID and credit cards",
        status: "found",
        location: "Times Square Station",
        date: "5 hours ago",
        image: "👛"
    },
    {
        id: 3,
        title: "Silver Watch",
        description: "Lost during morning jog, sentimental value",
        status: "lost",
        location: "Brooklyn Bridge",
        date: "1 day ago",
        image: "⌚"
    },
    {
        id: 4,
        title: "Blue Backpack",
        description: "Found in coffee shop, contains textbooks",
        status: "found",
        location: "Greenwich Village",
        date: "2 days ago",
        image: "🎒"
    }
];

// Populate recent items
function populateRecentItems() {
    const grid = document.getElementById('recent-items-grid');
    if (!grid) return;

    // Combine sample items with user-created items
    const userItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
    const combinedItems = [...sampleItems, ...userItems];
    
    // Sort by date and take the most recent 4 items
    const recentItems = combinedItems
        .sort((a, b) => new Date(b.date + ' ' + (b.time || '12:00')) - new Date(a.date + ' ' + (a.time || '12:00')))
        .slice(0, 4);

    grid.innerHTML = recentItems.map(item => `
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
                    <span class="item-date">${formatItemDate(item.date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Format date for homepage display
function formatItemDate(date) {
    const itemDate = new Date(date);
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

// Open item detail (for homepage)
function openItemDetail(itemId) {
    localStorage.setItem('selectedItemId', itemId);
    window.location.href = 'item-detail.html';
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    if (!toastMessage || !toastIcon) return;
    
    toastMessage.textContent = message;
    
    // Update icon based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle';
    }
    
    // Clear any existing timeout
    if (toast.hideTimeout) {
        clearTimeout(toast.hideTimeout);
    }
    
    toast.classList.add('show');
    
    toast.hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
        toast.hideTimeout = null;
    }, 4000);
}

function closeToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    if (toast.hideTimeout) {
        clearTimeout(toast.hideTimeout);
        toast.hideTimeout = null;
    }
    
    toast.classList.remove('show');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    populateRecentItems();
    
    // Show welcome toast only once per session
    if (!sessionStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            showToast('Welcome to FindIt! Help reunite lost items with their owners.', 'info');
            sessionStorage.setItem('welcomeShown', 'true');
        }, 1000);
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Check if user is logged in
function checkAuthStatus() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (userData) {
        const user = JSON.parse(userData);
        updateNavForLoggedInUser(user);
    }
}

function updateNavForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        // Insert notification bell if not exists
        const navItem = loginBtn.parentElement;
        if (!document.getElementById('notification-btn')) {
            const notificationLi = document.createElement('li');
            notificationLi.className = 'nav-item notification-item-nav';
            notificationLi.innerHTML = `
                <a href="#" class="nav-link" id="notification-btn" onclick="toggleNotifications(event)">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="notification-badge" style="display: none;">0</span>
                </a>
            `;
            navItem.parentNode.insertBefore(notificationLi, navItem);
        }

        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        loginBtn.href = '#';
        loginBtn.classList.add('logged-in');
        loginBtn.addEventListener('click', showUserMenu);
        
        // Start polling for notifications
        startNotificationPolling(user.id);
    }
}

// Notification System
let notificationInterval;
let lastSeenNotificationId = parseInt(localStorage.getItem('lastSeenNotificationId') || '0');

function startNotificationPolling(userId) {
    if (notificationInterval) clearInterval(notificationInterval);
    
    // Initial check
    checkNotifications(userId);
    
    // Poll every 30 seconds
    notificationInterval = setInterval(() => {
        checkNotifications(userId);
    }, 30000);
}

async function checkNotifications(userId) {
    try {
        const response = await fetch(`/api/notifications?user_id=${userId}`);
        const data = await response.json();
        
        if (data.success && data.notifications.length > 0) {
            updateNotificationUI(data.notifications);
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function updateNotificationUI(notifications) {
    const badge = document.getElementById('notification-badge');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update badge
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Check for new notifications to show toast
    const newestId = notifications[0].id;
    if (newestId > lastSeenNotificationId) {
        const newNotifs = notifications.filter(n => n.id > lastSeenNotificationId);
        
        // Show toast for the most recent one
        if (newNotifs.length > 0) {
            showToast(newNotifs[0].message, 'info');
        }
        
        lastSeenNotificationId = newestId;
        localStorage.setItem('lastSeenNotificationId', lastSeenNotificationId);
    }
}

function toggleNotifications(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const existingMenu = document.querySelector('.notification-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Close user menu if open
    closeUserMenu();
    
    const userId = JSON.parse(localStorage.getItem('userData')).id;
    fetchAndShowNotifications(userId, e.target.closest('.nav-link'));
}

async function fetchAndShowNotifications(userId, targetElement) {
    try {
        const response = await fetch(`/api/notifications?user_id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            showNotificationMenu(data.notifications, targetElement);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function showNotificationMenu(notifications, targetElement) {
    const menu = document.createElement('div');
    menu.className = 'notification-menu';
    
    if (notifications.length === 0) {
        menu.innerHTML = '<div class="notification-empty">No notifications</div>';
    } else {
        menu.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
            </div>
            <div class="notification-list">
                ${notifications.map(n => `
                    <div class="notification-item ${n.read ? 'read' : 'unread'}" onclick="markAsRead(${n.id}, '${n.type}', ${n.item_id})">
                        <div class="notif-icon">
                            <i class="fas ${getNotificationIcon(n.type)}"></i>
                        </div>
                        <div class="notif-content">
                            <div class="notif-title">${n.title}</div>
                            <div class="notif-message">${n.message}</div>
                            <div class="notif-time">${formatTimeAgo(n.created_at)}</div>
                        </div>
                        ${!n.read ? '<div class="notif-dot"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    document.body.appendChild(menu);
    
    // Position menu
    const rect = targetElement.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 10) + 'px';
    menu.style.right = (window.innerWidth - rect.right - 10) + 'px'; // Align right relative to window
    if (parseInt(menu.style.right) < 10) menu.style.right = '10px';
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeNotificationMenu);
    }, 100);
}

function closeNotificationMenu(e) {
    // If clicking inside the menu, don't close (unless it's an item click which is handled)
    if (e && e.target.closest('.notification-menu')) return;
    
    const menu = document.querySelector('.notification-menu');
    if (menu) {
        menu.remove();
    }
    document.removeEventListener('click', closeNotificationMenu);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'claim': return 'fa-hand-paper';
        case 'message': return 'fa-envelope';
        case 'system': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

async function markAsRead(notifId, type, itemId) {
    try {
        await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
        
        // Refresh UI
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            if (current > 0) {
                const newCount = current - 1;
                badge.textContent = newCount;
                if (newCount === 0) badge.style.display = 'none';
            }
        }
        
        // Redirect if applicable
        if (type === 'claim' && itemId) {
            window.location.href = `my-items.html`; // Or item detail
        }
        
        closeNotificationMenu();
        
    } catch (error) {
        console.error('Error marking read:', error);
    }
}

function showUserMenu(e) {
    e.preventDefault();
    
    // Create dropdown menu
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-item" onclick="viewProfile()">
            <i class="fas fa-user"></i> Profile
        </div>
        <div class="user-menu-item" onclick="viewMyItems()">
            <i class="fas fa-list"></i> My Items
        </div>
        <div class="user-menu-item" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Position menu
    const rect = e.target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = rect.bottom + 10 + 'px';
    menu.style.right = '20px';
    menu.style.zIndex = '1001';
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeUserMenu);
    }, 100);
}

function closeUserMenu() {
    const menu = document.querySelector('.user-menu');
    if (menu) {
        menu.remove();
    }
    document.removeEventListener('click', closeUserMenu);
}

function viewProfile() {
    window.location.href = 'profile.html';
}

function viewMyItems() {
    window.location.href = 'my-items.html';
}

function logout() {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}