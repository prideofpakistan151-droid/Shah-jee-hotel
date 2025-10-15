let bills = { 'Z': 0, 'U': 0, 'M': 0, 'B': 0, 'A': 0 };
let entries = [];
let editId = null;
let currentBill = null;
let currentSplitType = 'equal';

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    // Load current bill from session storage
    const billData = sessionStorage.getItem('currentBill');
    if (billData) {
        currentBill = JSON.parse(billData);
        bills = currentBill.totals;
        entries = currentBill.entries;
        
        // Update UI
        document.getElementById('billTitle').textContent = currentBill.name;
        document.getElementById('billInfo').textContent = 
            `Date: ${new Date(currentBill.date).toLocaleDateString()}${currentBill.description ? ` • ${currentBill.description}` : ''}`;
    }
    
    initParticipantBadges();
    updateDisplay();
    renderEntries();
    calculateQuickSplit();
});

// Initialize participant badges
function initParticipantBadges() {
    const container = document.getElementById('participantBadges');
    container.innerHTML = '';
    
    for (const [code, data] of Object.entries(nameMap)) {
        const badge = document.createElement('div');
        badge.className = 'participant-badge active';
        badge.innerHTML = `
            <span>${data.avatar}</span>
            <span>${data.name}</span>
        `;
        badge.dataset.code = code;
        badge.onclick = function() {
            this.classList.toggle('active');
            updateParticipantsInput();
            calculateQuickSplit();
        };
        container.appendChild(badge);
    }
    updateParticipantsInput();
}

// Update participants input
function updateParticipantsInput() {
    const activeBadges = document.querySelectorAll('.participant-badge.active');
    const participants = Array.from(activeBadges).map(badge => badge.dataset.code).join('');
    document.getElementById('participants').value = participants;
}

// Set split type
function setSplitType(type) {
    currentSplitType = type;
    
    // Update UI
    document.querySelectorAll('.split-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    calculateQuickSplit();
}

// Validate inputs
function validateInputs() {
    const price = parseFloat(document.getElementById('price').value);
    const participants = document.getElementById('participants').value;
    
    if (!price || price <= 0) {
        showNotification('Please enter a valid price', 'error');
        return false;
    }
    
    if (!participants) {
        showNotification('Please select at least one participant', 'error');
        return false;
    }
    
    return true;
}

// Calculate quick split
function calculateQuickSplit() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const participants = document.getElementById('participants').value;
    
    if (!participants || price <= 0) {
        document.getElementById('quickResults').innerHTML = '<div class="empty-state">Enter amount and select participants</div>';
        return;
    }
    
    const participantCount = participants.length;
    let resultsHTML = '';
    
    if (currentSplitType === 'equal') {
        const share = price / participantCount;
        
        participants.split('').forEach(code => {
            const person = nameMap[code];
            resultsHTML += `
                <div class="result-item">
                    <div class="result-name">${person.avatar} ${person.name}</div>
                    <div class="result-amount">₹${share.toFixed(2)}</div>
                </div>
            `;
        });
    }
    
    document.getElementById('quickResults').innerHTML = resultsHTML;
}

// Add entry
function addEntry() {
    if (!validateInputs()) return;

    const price = parseFloat(document.getElementById('price').value);
    const participants = document.getElementById('participants').value;
    const description = document.getElementById('entryDescription').value;

    // Editing existing entry
    if(editId) {
        const entry = entries.find(e => e.id === editId);
        if(entry) {
            // remove old contribution
            const oldShare = entry.price / entry.participants.length;
            for(const c of entry.participants) bills[c] -= oldShare;

            // update entry
            entry.price = price;
            entry.participants = participants;
            entry.description = description;

            // add new contribution
            const newShare = price / participants.length;
            for(const c of participants) bills[c] += newShare;

            editId = null;
            document.getElementById('addBtn').innerHTML = '<span>➕</span> Add Entry';
            showNotification('Entry updated successfully');
        }
    } else {
        // Add new entry
        const share = price / participants.length;
        for(const c of participants) bills[c] += share;

        const id = Date.now().toString();
        entries.push({id, price, participants, description});
        showNotification('Entry added successfully');
    }

    updateDisplay();
    renderEntries();
    clearForm();
    updateCurrentBill();
    calculateQuickSplit();
}

// Render entries
function renderEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<div class="text-center" style="padding: 20px; color: var(--text-secondary);">No entries yet</div>';
        return;
    }
    
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        entryDiv.setAttribute("data-id", entry.id);

        const names = entry.participants.split('').map(c => nameMap[c].name).join(', ');
        entryDiv.innerHTML = `
            <div class="entry-details">
                <div class="entry-amount">₹${entry.price.toFixed(2)}</div>
                <div>
                    <div><strong>${names}</strong></div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${entry.description || ''}</div>
                </div>
            </div>
            <div class="entry-actions">
                <div class="action-btns">
                    <button class="edit-btn" onclick="editEntry('${entry.id}')">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteEntry('${entry.id}')">❌ Delete</button>
                </div>
            </div>`;

        entriesList.appendChild(entryDiv);
    });
}

// Edit entry
function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if(entry) {
        document.getElementById('price').value = entry.price;
        document.getElementById('entryDescription').value = entry.description || '';
        
        // Set participant badges
        const badges = document.querySelectorAll('.participant-badge');
        badges.forEach(badge => {
            badge.classList.remove('active');
            if (entry.participants.includes(badge.dataset.code)) {
                badge.classList.add('active');
            }
        });
        updateParticipantsInput();
        
        editId = id;
        document.getElementById('addBtn').innerHTML = '<span>💾</span> Save Changes';
        
        // Scroll to input section
        document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        const entry = entries.find(e => e.id === id);
        if(entry) {
            const share = entry.price / entry.participants.length;
            for(const c of entry.participants) bills[c] -= share;
            entries = entries.filter(e => e.id !== id);
            updateDisplay();
            renderEntries();
            updateCurrentBill();
            showNotification('Entry deleted successfully');
        }
    }
}

// Update display
function updateDisplay() {
    let html = '';
    for(const [code, total] of Object.entries(bills)) {
        const person = nameMap[code];
        html += `<div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>${person.avatar} ${person.name}:</span>
            <span style="font-weight: 700; color: var(--primary);">₹${total.toFixed(2)}</span>
        </div>`;
    }
    document.getElementById('totalsContent').innerHTML = html;
}

// Show final totals
function showFinal() {
    let html = '<h4>Final Settlement:</h4>';
    let totalSum = 0;
    for(const [code,total] of Object.entries(bills)) {
        const person = nameMap[code];
        html += `<div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>${person.avatar} ${person.name}:</span>
            <span style="font-weight: 700; color: var(--primary);">₹${total.toFixed(2)}</span>
        </div>`;
        totalSum += total;
    }
    html += `<hr style="margin: 16px 0;">
    <div style="display: flex; justify-content: space-between; font-weight: 700;">
        <span>Total Amount:</span>
        <span>₹${totalSum.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 8px;">
        <span>Pay to Shah jee:</span>
        <span>₹${totalSum.toFixed(2)}</span>
    </div>`;
    
    document.getElementById('finalContent').innerHTML = html;
    document.getElementById('finalTotals').style.display = 'block';
    
    // Update current bill with final totals
    if (currentBill) {
        currentBill.finalTotals = {...bills};
        updateCurrentBill();
    }
}

// Clear form
function clearForm() {
    document.getElementById('price').value = '';
    document.getElementById('entryDescription').value = '';
    
    calculateQuickSplit();
}

// Filter log
function filterLog() {
    const query = document.getElementById('searchLog').value.toLowerCase();
    const items = document.querySelectorAll('.entry-item');
    
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

// Update current bill in session storage
function updateCurrentBill() {
    if (currentBill) {
        currentBill.totals = {...bills};
        currentBill.entries = [...entries];
        currentBill.totalAmount = entries.reduce((sum, entry) => sum + entry.price, 0);
        sessionStorage.setItem('currentBill', JSON.stringify(currentBill));
    }
}

// Save bill
function saveBill() {
    if (!currentBill) {
        showNotification('No bill data to save', 'error');
        return;
    }
    
    if (entries.length === 0) {
        showNotification('Please add at least one entry before saving', 'error');
        return;
    }
    
    // Calculate total amount
    currentBill.totalAmount = entries.reduce((sum, entry) => sum + entry.price, 0);
    
    // Save to local storage
    saveBill(currentBill);
    
    showNotification('Bill saved successfully!', 'success');
    
    // Clear session storage and redirect to home
    setTimeout(() => {
        sessionStorage.removeItem('currentBill');
        navigateTo('index.html');
    }, 1500);
}

// Save quick bill
function saveQuickBill() {
    if (entries.length === 0) {
        // Create a quick bill from current inputs
        const price = parseFloat(document.getElementById('price').value);
        if (price && price > 0) {
            addEntry();
        }
    }
    saveBill();
}

// Reset current bill
function resetCurrentBill() {
    if (confirm('Are you sure you want to reset all entries? This cannot be undone.')) {
        bills = { 'Z':0,'U':0,'M':0,'B':0,'A':0 };
        entries = [];
        updateDisplay();
        renderEntries();
        updateCurrentBill();
        showNotification('All entries have been reset');
    }
}

// Clear all entries
function clearAllEntries() {
    if (confirm('Are you sure you want to clear all entries?')) {
        entries = [];
        // Reset bills but keep the structure
        for (const key in bills) {
            bills[key] = 0;
        }
        updateDisplay();
        renderEntries();
        updateCurrentBill();
        showNotification('All entries cleared');
    }
}
