// Enhanced Storage Management
const STORAGE_KEYS = {
    BILLS: 'hostelBills_v2',
    SETTINGS: 'hostelBillSettings_v2',
    BACKUP: 'hostelBillBackup_v2',
    CATEGORIES: 'customCategories_v2'
};

// Enhanced bill operations with validation
function getBills() {
    try {
        const bills = localStorage.getItem(STORAGE_KEYS.BILLS);
        if (!bills) return [];
        
        const parsedBills = JSON.parse(bills);
        return Array.isArray(parsedBills) ? parsedBills : [];
    } catch (error) {
        console.error('Error loading bills:', error);
        showNotification('Error loading bills data', 'error');
        return [];
    }
}

function saveBill(bill) {
    try {
        // Validate bill data
        if (!bill.id || !bill.name || !bill.date) {
            throw new Error('Invalid bill data');
        }

        const bills = getBills();
        const existingIndex = bills.findIndex(b => b.id === bill.id);
        
        if (existingIndex >= 0) {
            bills[existingIndex] = bill;
        } else {
            bills.push(bill);
        }
        
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
        return true;
    } catch (error) {
        console.error('Error saving bill:', error);
        showNotification('Error saving bill', 'error');
        return false;
    }
}

function deleteBillById(id) {
    try {
        const bills = getBills();
        const updatedBills = bills.filter(bill => bill.id !== id);
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updatedBills));
        return true;
    } catch (error) {
        console.error('Error deleting bill:', error);
        showNotification('Error deleting bill', 'error');
        return false;
    }
}

// Enhanced settings management
function getSettings() {
    try {
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const defaultSettings = {
            theme: 'light',
            currency: '₹',
            categories: ['food', 'groceries', 'utilities', 'rent', 'transport', 'entertainment', 'other'],
            defaultParticipants: ['Z', 'U', 'M', 'B', 'A'],
            notifications: true,
            autoBackup: false
        };
        
        return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (error) {
        console.error('Error loading settings:', error);
        return defaultSettings;
    }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Data validation
function validateBillData(bill) {
    const required = ['id', 'name', 'date', 'entries'];
    const missing = required.filter(field => !bill[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    if (!Array.isArray(bill.entries)) {
        throw new Error('Entries must be an array');
    }
    
    return true;
}

// Backup and restore with compression
function createBackup() {
    const backup = {
        bills: getBills(),
        settings: getSettings(),
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    };
    
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
    return backup;
}

function restoreBackup() {
    try {
        const backup = localStorage.getItem(STORAGE_KEYS.BACKUP);
        if (!backup) {
            throw new Error('No backup found');
        }
        
        const data = JSON.parse(backup);
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(data.bills));
        
        if (data.settings) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        }
        
        return data;
    } catch (error) {
        console.error('Error restoring backup:', error);
        throw error;
    }
}

// Clear all data
function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}
