// Enhanced Navigation with Animation
function navigateTo(page) {
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        window.location.href = page;
    }, 200);
}

function goBack() {
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        window.history.back();
    }, 200);
}

// Enhanced Notification System
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${message}</span>
    `;
    
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Enhanced Name Mapping with Avatars
const nameMap = {
    'Z': { name: 'Zeshan', avatar: '👨‍💼', color: '#6366F1' },
    'U': { name: 'Umam', avatar: '👨‍🎓', color: '#10B981' },
    'M': { name: 'Rasool', avatar: '👨‍🔧', color: '#F59E0B' },
    'B': { name: 'Abdullah', avatar: '👨‍💻', color: '#EF4444' },
    'A': { name: 'Aziz', avatar: '👨‍🎨', color: '#8B5CF6' }
};

// Enhanced Settings Management
function getSettings() {
    const settings = localStorage.getItem('hostelBillSettings');
    return settings ? JSON.parse(settings) : {
        theme: 'light',
        currency: '₹',
        categories: ['food', 'groceries', 'utilities', 'rent', 'transport', 'entertainment', 'other'],
        defaultParticipants: ['Z', 'U', 'M', 'B', 'A'],
        notifications: true,
        autoBackup: false
    };
}

function saveSettings(settings) {
    localStorage.setItem('hostelBillSettings', JSON.stringify(settings));
}

// Enhanced Data Export with Compression
function exportData() {
    const data = {
        bills: getBills(),
        settings: getSettings(),
        participants: nameMap,
        exportDate: new Date().toISOString(),
        version: '2.0.0'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel-bills-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

// Enhanced Data Import with Validation
function importData() {
    document.getElementById('importFile').click();
}

function handleFileImport(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.bills || !Array.isArray(data.bills)) {
                throw new Error('Invalid data format');
            }
            
            // Backup current data
            const currentBackup = {
                bills: getBills(),
                settings: getSettings(),
                backupTime: new Date().toISOString()
            };
            localStorage.setItem('hostelBillBackup', JSON.stringify(currentBackup));
            
            // Import new data
            localStorage.setItem('hostelBills', JSON.stringify(data.bills));
            if (data.settings) {
                localStorage.setItem('hostelBillSettings', JSON.stringify(data.settings));
            }
            
            showNotification('Data imported successfully!', 'success');
            setTimeout(() => window.location.reload(), 1000);
            
        } catch (error) {
            showNotification('Failed to import data: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Enhanced Analytics Functions
function calculateSettlements(bills) {
    const totals = {};
    
    // Calculate totals for each person
    bills.forEach(bill => {
        if (bill.finalTotals) {
            Object.entries(bill.finalTotals).forEach(([person, amount]) => {
                totals[person] = (totals[person] || 0) + amount;
            });
        }
    });
    
    return totals;
}

// Enhanced Utility Functions
function formatCurrency(amount, currency = '₹') {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

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

// Enhanced Error Handling
window.addEventListener('error', function(e) {
    console.error('App Error:', e.error);
    showNotification('Something went wrong. Please refresh the app.', 'error');
});

// Service Worker Registration with Update Check
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/hostel-bill-manager/service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('New version available! Refresh to update.', 'info', 5000);
                        }
                    });
                });
            })
            .catch(error => {
                console.log('SW registration failed: ', error);
            });
        
        // Check for updates on page load
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Register service worker
    registerServiceWorker();
});

// Clear all data function
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
        localStorage.removeItem('hostelBills');
        localStorage.removeItem('hostelBillSettings');
        localStorage.removeItem('hostelBillBackup');
        localStorage.removeItem('customCategories');
        
        showNotification('All data cleared successfully!', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }
}
