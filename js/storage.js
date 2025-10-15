// Storage functions for bills
function getBills() {
    const bills = localStorage.getItem('hostelBills');
    return bills ? JSON.parse(bills) : [];
}

function saveBill(bill) {
    const bills = getBills();
    
    // Check if bill already exists (for updating)
    const existingIndex = bills.findIndex(b => b.id === bill.id);
    
    if (existingIndex >= 0) {
        bills[existingIndex] = bill;
    } else {
        bills.push(bill);
    }
    
    localStorage.setItem('hostelBills', JSON.stringify(bills));
    return bill;
}

function getBillById(id) {
    const bills = getBills();
    return bills.find(bill => bill.id === id);
}

function deleteBillById(id) {
    const bills = getBills();
    const updatedBills = bills.filter(bill => bill.id !== id);
    localStorage.setItem('hostelBills', JSON.stringify(updatedBills));
    return updatedBills;
}

// Enhanced bill operations
function getBillsByCategory(category) {
    const bills = getBills();
    return bills.filter(bill => bill.category === category);
}

function getBillsByDateRange(startDate, endDate) {
    const bills = getBills();
    return bills.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate >= new Date(startDate) && billDate <= new Date(endDate);
    });
}

function getRecentBills(days = 7) {
    const bills = getBills();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return bills.filter(bill => new Date(bill.createdAt) > cutoffDate);
}

// Participant management
function getParticipants() {
    return Object.keys(nameMap);
}

function addParticipant(code, name, avatar = '👤', color = '#6B7280') {
    nameMap[code] = { name, avatar, color };
    // Note: In a real app, you'd save this to localStorage
    showNotification(`Participant ${name} added!`, 'success');
}

// Analytics data helpers
function getCategorySpending() {
    const bills = getBills();
    const spending = {};
    
    bills.forEach(bill => {
        const category = bill.category || 'other';
        spending[category] = (spending[category] || 0) + (bill.totalAmount || 0);
    });
    
    return spending;
}

function getMonthlySpending() {
    const bills = getBills();
    const monthly = {};
    
    bills.forEach(bill => {
        const month = new Date(bill.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthly[month] = (monthly[month] || 0) + (bill.totalAmount || 0);
    });
    
    return monthly;
}

function getParticipantSpending() {
    const bills = getBills();
    const spending = {};
    
    bills.forEach(bill => {
        if (bill.finalTotals) {
            Object.entries(bill.finalTotals).forEach(([person, amount]) => {
                spending[person] = (spending[person] || 0) + amount;
            });
        }
    });
    
    return spending;
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

// Backup and restore
function createBackup() {
    const backup = {
        bills: getBills(),
        settings: getSettings(),
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    };
    
    localStorage.setItem('hostelBillBackup', JSON.stringify(backup));
    return backup;
}

function restoreBackup() {
    const backup = localStorage.getItem('hostelBillBackup');
    if (!backup) {
        throw new Error('No backup found');
    }
    
    const data = JSON.parse(backup);
    localStorage.setItem('hostelBills', JSON.stringify(data.bills));
    
    if (data.settings) {
        localStorage.setItem('hostelBillSettings', JSON.stringify(data.settings));
    }
    
    return data;
}
