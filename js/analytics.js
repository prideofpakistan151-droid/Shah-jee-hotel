// Analytics functionality
document.addEventListener('DOMContentLoaded', function() {
    loadAnalytics();
});

function loadAnalytics() {
    updateSummaryCards();
    updateCategoryChart();
    updateParticipantChart();
    updateMonthlyChart();
    updateSettlements();
}

function updateSummaryCards() {
    const bills = getBills();
    const totalSpent = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const avgPerBill = bills.length > 0 ? totalSpent / bills.length : 0;
    
    document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
    document.getElementById('totalBills').textContent = bills.length;
    document.getElementById('avgPerBill').textContent = `₹${avgPerBill.toFixed(2)}`;
}

function updateCategoryChart() {
    const categorySpending = getCategorySpending();
    const container = document.getElementById('categoryChart');
    
    if (Object.keys(categorySpending).length === 0) {
        container.innerHTML = '<div class="empty-state">No spending data available</div>';
        return;
    }
    
    let html = '<div class="chart-bars">';
    Object.entries(categorySpending).forEach(([category, amount]) => {
        const percentage = (amount / Object.values(categorySpending).reduce((a, b) => a + b, 0)) * 100;
        const icon = getCategoryIcon(category);
        
        html += `
            <div class="chart-bar-item">
                <div class="bar-label">
                    <span>${icon} ${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span>₹${amount.toFixed(2)} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%; background: ${getCategoryColor(category)};"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function updateParticipantChart() {
    const participantSpending = getParticipantSpending();
    const container = document.getElementById('participantChart');
    
    if (Object.keys(participantSpending).length === 0) {
        container.innerHTML = '<div class="empty-state">No participant data available</div>';
        return;
    }
    
    let html = '<div class="chart-bars">';
    Object.entries(participantSpending).forEach(([code, amount]) => {
        const person = nameMap[code];
        if (!person) return;
        
        const total = Object.values(participantSpending).reduce((a, b) => a + b, 0);
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        
        html += `
            <div class="chart-bar-item">
                <div class="bar-label">
                    <span>${person.avatar} ${person.name}</span>
                    <span>₹${amount.toFixed(2)} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%; background: ${person.color};"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function updateMonthlyChart() {
    const monthlySpending = getMonthlySpending();
    const container = document.getElementById('monthlyChart');
    
    if (Object.keys(monthlySpending).length === 0) {
        container.innerHTML = '<div class="empty-state">No monthly data available</div>';
        return;
    }
    
    // Get last 6 months
    const months = Object.keys(monthlySpending).sort().slice(-6);
    const maxAmount = Math.max(...Object.values(monthlySpending));
    
    let html = '<div class="chart-bars">';
    months.forEach(month => {
        const amount = monthlySpending[month];
        const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
        
        html += `
            <div class="chart-bar-item">
                <div class="bar-label">
                    <span>${month}</span>
                    <span>₹${amount.toFixed(2)}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%; background: var(--primary);"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function updateSettlements() {
    const bills = getBills();
    const totals = calculateSettlements(bills);
    const container = document.getElementById('settlementsList');
    
    if (Object.keys(totals).length === 0) {
        container.innerHTML = '<div class="empty-state">No settlement data available</div>';
        return;
    }
    
    // Convert to array and find who owes whom
    const people = Object.entries(totals).map(([person, balance]) => ({
        person,
        balance,
        name: nameMap[person]?.name || person
    })).sort((a, b) => a.balance - b.balance);
    
    let settlements = [];
    let i = 0, j = people.length - 1;
    
    while (i < j) {
        const debtor = people[i];
        const creditor = people[j];
        const amount = Math.min(-debtor.balance, creditor.balance);
        
        if (amount > 0.01) {
            settlements.push({
                from: debtor.name,
                to: creditor.name,
                amount: parseFloat(amount.toFixed(2))
            });
            
            debtor.balance += amount;
            creditor.balance -= amount;
        }
        
        if (Math.abs(debtor.balance) < 0.01) i++;
        if (Math.abs(creditor.balance) < 0.01) j--;
    }
    
    if (settlements.length === 0) {
        container.innerHTML = '<div class="empty-state">All settlements are balanced! 🎉</div>';
        return;
    }
    
    let html = '';
    settlements.forEach(settlement => {
        html += `
            <div class="settlement-item">
                <div class="settlement-from">${settlement.from}</div>
                <div class="settlement-arrow">→</div>
                <div class="settlement-to">${settlement.to}</div>
                <div class="settlement-amount">₹${settlement.amount.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getCategoryColor(category) {
    const colors = {
        'food': '#EF4444',
        'groceries': '#10B981',
        'utilities': '#F59E0B',
        'rent': '#6366F1',
        'transport': '#8B5CF6',
        'entertainment': '#EC4899',
        'other': '#6B7280'
    };
    return colors[category] || '#6B7280';
}

function exportAnalytics() {
    const analyticsData = {
        summary: {
            totalSpent: document.getElementById('totalSpent').textContent,
            totalBills: document.getElementById('totalBills').textContent,
            avgPerBill: document.getElementById('avgPerBill').textContent
        },
        categorySpending: getCategorySpending(),
        participantSpending: getParticipantSpending(),
        monthlySpending: getMonthlySpending(),
        settlements: calculateSettlements(getBills()),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Analytics exported successfully!', 'success');
}

function refreshAnalytics() {
    loadAnalytics();
    showNotification('Analytics data refreshed!', 'success');
}

// Add CSS for chart bars
const style = document.createElement('style');
style.textContent = `
    .chart-bars {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .chart-bar-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .bar-label {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 500;
    }
    .bar-track {
        height: 8px;
        background: var(--bg-secondary);
        border-radius: 4px;
        overflow: hidden;
    }
    .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    .settlement-item {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 16px;
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
    }
    .settlement-arrow {
        color: var(--text-secondary);
        font-weight: bold;
    }
`;
document.head.appendChild(style);
