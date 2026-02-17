// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    loadUserProfile();
    setupEditButton();
    
    // Update navigation
    const userData = getUserData();
    if (userData) {
        updateNavForLoggedInUser(userData);
    }
});

function setupEditButton() {
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        console.log('Edit button found, adding event listener');
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Edit button clicked');
            editProfile();
        });
    } else {
        console.error('Edit button not found');
    }
}

function editProfile() {
    console.log('editProfile function called');
    
    // Test if the file exists first
    fetch('edit-profile.html')
        .then(response => {
            console.log('edit-profile.html fetch response:', response.status);
            if (response.ok) {
                console.log('✅ edit-profile.html is accessible, navigating...');
                window.location.href = 'edit-profile.html';
            } else {
                console.error('❌ edit-profile.html returned status:', response.status);
                showToast('Edit profile page not found', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Error checking edit-profile.html:', error);
            // Try direct navigation anyway
            console.log('Trying direct navigation...');
            try {
                window.location.href = 'edit-profile.html';
            } catch (navError) {
                console.error('Navigation failed:', navError);
                showToast('Unable to open edit profile page', 'error');
            }
        });
}

function loadUserProfile() {
    // In a real app, this would fetch user data from a server
    const userData = getUserData();
    
    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    updateProfileDisplay(userData);
    updateStats();
}

function getUserData() {
    // Check for logged in user
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (userData) {
        return JSON.parse(userData);
    }
    
    // Return dummy data for demo purposes
    return {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        phone: '+1 (555) ***-**89',
        location: 'New York, NY',
        joinDate: 'February 15, 2024',
        verified: true
    };
}

function updateProfileDisplay(user) {
    // Update profile name and email
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    
    // Update info grid
    const infoItems = document.querySelectorAll('.info-item span');
    if (infoItems.length >= 6) {
        infoItems[0].textContent = user.name;
        infoItems[1].textContent = user.email;
        infoItems[2].textContent = user.phone;
        infoItems[3].textContent = user.location;
        infoItems[4].textContent = user.joinDate;
    }
}

function updateStats() {
    const currentUser = getUserData();
    
    if (!currentUser || !currentUser.id) {
        console.warn('User ID not found, using local storage fallback or empty stats');
        // Fallback to local storage if no ID (legacy support)
        const userItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
        const myItems = userItems.filter(item => 
            item.contact === currentUser.email || 
            item.postedBy === currentUser.name
        );
        
        const lostItems = myItems.filter(item => item.status === 'lost').length;
        const foundItems = myItems.filter(item => item.status === 'found').length;
        const recoveredItems = myItems.filter(item => item.status === 'recovered').length;
        const totalItems = myItems.length;
        
        updateStatDOM(totalItems, lostItems, foundItems, recoveredItems);
        return;
    }
    
    // Fetch real stats from API
    fetch(`/api/users/${currentUser.id}/stats`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.stats;
                updateStatDOM(stats.total, stats.lost, stats.found, stats.recovered);
            } else {
                console.error('Failed to load stats:', data.error);
            }
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
        });
}

function updateStatDOM(total, lost, found, recovered) {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = total;
        statNumbers[1].textContent = lost;
        statNumbers[2].textContent = found;
        statNumbers[3].textContent = recovered;
    }
}

function viewMyItems() {
    window.location.href = 'my-items.html';
}

function logout() {
    // Clear user data
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    
    showToast('Logging out...', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function updateNavForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        loginBtn.href = 'profile.html';
        loginBtn.classList.add('logged-in');
    }
}