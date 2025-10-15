// Previous Bills functionality
document.addEventListener('DOMContentLoaded', function() {
    loadBills();
});

function loadBills() {
    const bills = getBills();
    const billsList = document.getElementById('billsList');
    const emptyState = document.getElementById('emptyState');
    
    if (bills.length === 0) {
        billsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    billsList.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Sort bills by date (newest first)
    bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    billsList.innerHTML = '';
    
    bills.forEach(bill => {
        const billCard = document.createElement('div');
        billCard.className = 'bill-card';
        billCard.onclick = () => viewBillDetail(bill.id);
        
        // Calculate participant codes used in this bill
        const participantCodes = new Set();
        bill.entries.forEach(entry => {
            entry.participants.split('').forEach(code => participantCodes.add(code));
        });
        
        const categoryIcon = getCategoryIcon(bill.category);
        
        billCard.innerHTML = `
            <div class="bill-header">
                <div>
                    <div class="bill-name">${categoryIcon} ${bill.name}</div>
                    <div class="bill-date">${formatDate(bill.date)}</div>
                    ${bill.description ? `<div class="bill-description">${bill.description}</div>` : ''}
                </div>
                <div class="bill-total">₹${bill.totalAmount ? bill.totalAmount.toFixed(2) : '0.00'}</div>
            </div>
            <div class="bill-participants">
                ${Array.from(participantCodes).map(code => 
                    `<span class="participant-tag">${nameMap[code]?.avatar || '👤'} ${nameMap[code]?.name || code}</span>`
                ).join('')}
            </div>
            <div style="margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
                ${bill.entries.length} entries • Created ${formatDate(bill.createdAt)}
            </div>
        `;
        
        billsList.appendChild(billCard);
    });
}

function getCategoryIcon(category) {
    const icons = {
        'food': '🍕',
        'groceries': '🛒',
        'utilities': '⚡',
        'rent': '🏠',
        'transport': '🚗',
        'entertainment': '🎬',
        'other': '📦'
    };
    return icons[category] || '📁';
}

function viewBillDetail(billId) {
    navigateTo(`bill-detail.html?id=${billId}`);
}

function filterBills() {
    const searchQuery = document.getElementById('searchBills').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const bills = getBills();
    const billsList = document.getElementById('billsList');
    
    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.name.toLowerCase().includes(searchQuery) || 
                            (bill.description && bill.description.toLowerCase().includes(searchQuery));
        const matchesCategory = !categoryFilter || bill.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    if (filteredBills.length === 0) {
        billsList.innerHTML = '<div class="empty-state">No bills match your search criteria</div>';
        return;
    }
    
    billsList.innerHTML = '';
    filteredBills.forEach(bill => {
        const billCard = document.createElement('div');
        billCard.className = 'bill-card';
        billCard.onclick = () => viewBillDetail(bill.id);
        
        const participantCodes = new Set();
        bill.entries.forEach(entry => {
            entry.participants.split('').forEach(code => participantCodes.add(code));
        });
        
        const categoryIcon = getCategoryIcon(bill.category);
        
        billCard.innerHTML = `
            <div class="bill-header">
                <div>
                    <div class="bill-name">${categoryIcon} ${bill.name}</div>
                    <div class="bill-date">${formatDate(bill.date)}</div>
                </div>
                <div class="bill-total">₹${bill.totalAmount ? bill.totalAmount.toFixed(2) : '0.00'}</div>
            </div>
            <div class="bill-participants">
                ${Array.from(participantCodes).map(code => 
                    `<span class="participant-tag">${nameMap[code]?.avatar || '👤'} ${nameMap[code]?.name || code}</span>`
                ).join('')}
            </div>
        `;
        
        billsList.appendChild(billCard);
    });
}
