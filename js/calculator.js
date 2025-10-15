let bills = { 'Z': 0, 'U': 0, 'M': 0, 'B': 0, 'A': 0 };
let entries = [];
let editId = null;
let currentBill = null;
let currentSplitType = 'equal';

// Initialize calculator with proper data loading
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentBill();
    initParticipantBadges();
    updateDisplay();
    renderEntries();
    calculateQuickSplit();
});

function loadCurrentBill() {
    try {
        const billData = sessionStorage.getItem('currentBill');
        if (billData) {
            currentBill = JSON.parse(billData);
            bills = currentBill.totals || { 'Z': 0, 'U': 0, 'M': 0, 'B': 0, 'A': 0 };
            entries = currentBill.entries || [];
            
            // Update UI
            document.getElementById('billTitle').textContent = currentBill.name;
            document.getElementById('billInfo').textContent = 
                `Date: ${new Date(currentBill.date).toLocaleDateString()}${currentBill.description ? ` • ${currentBill.description}` : ''}`;
        } else {
            // Create new bill if none exists
            createNewBillFromSession();
        }
    } catch (error) {
        console.error('Error loading current bill:', error);
        showNotification('Error loading bill data', 'error');
    }
}

function createNewBillFromSession() {
    currentBill = {
        id: Date.now().toString(),
        name: 'New Bill',
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        description: '',
        createdAt: new Date().toISOString(),
        entries: [],
        totals: { 'Z': 0, 'U': 0, 'M': 0, 'B': 0, 'A': 0 },
        finalTotals: null,
        totalAmount: 0
    };
    updateCurrentBill();
}

// Enhanced save function
function saveBill() {
    if (!currentBill) {
        showNotification('No bill data to save', 'error');
        return;
    }
    
    if (entries.length === 0) {
        showNotification('Please add at least one entry before saving', 'error');
        return;
    }
    
    try {
        // Update current bill data
        currentBill.totals = { ...bills };
        currentBill.entries = [...entries];
        currentBill.totalAmount = entries.reduce((sum, entry) => sum + entry.price, 0);
        currentBill.updatedAt = new Date().toISOString();
        
        // Validate before saving
        validateBillData(currentBill);
        
        // Save to localStorage
        const success = saveBill(currentBill);
        
        if (success) {
            showNotification('Bill saved successfully!', 'success');
            
            // Clear session storage and redirect
            setTimeout(() => {
                sessionStorage.removeItem('currentBill');
                navigateTo('index.html');
            }, 1500);
        } else {
            showNotification('Failed to save bill', 'error');
        }
    } catch (error) {
        console.error('Error saving bill:', error);
        showNotification('Error saving bill: ' + error.message, 'error');
    }
}

// Enhanced add entry with validation
function addEntry() {
    if (!validateInputs()) return;

    const price = parseFloat(document.getElementById('price').value);
    const participants = document.getElementById('participants').value;
    const description = document.getElementById('entryDescription').value;

    try {
        if (editId) {
            // Editing existing entry
            const entry = entries.find(e => e.id === editId);
            if (entry) {
                // Remove old contribution
                const oldShare = entry.price / entry.participants.length;
                for (const c of entry.participants) {
                    bills[c] = (bills[c] || 0) - oldShare;
                }

                // Update entry
                entry.price = price;
                entry.participants = participants;
                entry.description = description;

                // Add new contribution
                const newShare = price / participants.length;
                for (const c of participants) {
                    bills[c] = (bills[c] || 0) + newShare;
                }

                editId = null;
                document.getElementById('addBtn').innerHTML = '<span>➕</span> Add Entry';
                showNotification('Entry updated successfully');
            }
        } else {
            // Add new entry
            const share = price / participants.length;
            for (const c of participants) {
                bills[c] = (bills[c] || 0) + share;
            }

            const id = Date.now().toString();
            entries.push({
                id,
                price,
                participants,
                description,
                createdAt: new Date().toISOString()
            });
            showNotification('Entry added successfully');
        }

        updateDisplay();
        renderEntries();
        clearForm();
        updateCurrentBill();
        calculateQuickSplit();
    } catch (error) {
        console.error('Error adding entry:', error);
        showNotification('Error adding entry', 'error');
    }
}

// Update current bill in session storage
function updateCurrentBill() {
    if (currentBill) {
        currentBill.totals = { ...bills };
        currentBill.entries = [...entries];
        currentBill.totalAmount = entries.reduce((sum, entry) => sum + entry.price, 0);
        currentBill.updatedAt = new Date().toISOString();
        
        try {
            sessionStorage.setItem('currentBill', JSON.stringify(currentBill));
        } catch (error) {
            console.error('Error updating current bill:', error);
        }
    }
}
