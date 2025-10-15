// Settings functionality
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadParticipants();
    updateStats();
});

function loadSettings() {
    const settings = getSettings();
    
    // Set theme
    document.getElementById('themeSelect').value = settings.theme;
    
    // Set currency
    document.getElementById('currencySelect').value = settings.currency;
}

function loadParticipants() {
    const container = document.getElementById('participantsList');
    container.innerHTML = '';
    
    Object.entries(nameMap).forEach(([code, data]) => {
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant-item';
        participantDiv.innerHTML = `
            <div class="participant-info">
                <div class="participant-avatar" style="background: ${data.color};">${data.avatar}</div>
                <div>
                    <div style="font-weight: 600;">${data.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Code: ${code}</div>
                </div>
            </div>
            <div class="participant-actions">
                <button class="btn-sm" onclick="editParticipant('${code}')">Edit</button>
            </div>
        `;
        container.appendChild(participantDiv);
    });
}

function updateStats() {
    const bills = getBills();
    document.getElementById('totalBillsCount').textContent = bills.length;
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
}

function changeTheme(theme) {
    const settings = getSettings();
    settings.theme = theme;
    saveSettings(settings);
    
    // Apply theme immediately
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    showNotification(`Theme changed to ${theme}`, 'success');
}

function changeCurrency(currency) {
    const settings = getSettings();
    settings.currency = currency;
    saveSettings(settings);
    showNotification(`Currency changed to ${currency}`, 'success');
}

function addParticipant() {
    const code = prompt('Enter participant code (single letter):');
    if (!code || code.length !== 1) {
        showNotification('Please enter a single letter code', 'error');
        return;
    }
    
    if (nameMap[code]) {
        showNotification('Participant code already exists', 'error');
        return;
    }
    
    const name = prompt('Enter participant name:');
    if (!name) {
        showNotification('Please enter a name', 'error');
        return;
    }
    
    const avatar = prompt('Enter emoji avatar:') || '👤';
    
    nameMap[code] = {
        name: name,
        avatar: avatar,
        color: getRandomColor()
    };
    
    loadParticipants();
    showNotification(`Participant ${name} added!`, 'success');
}

function editParticipant(code) {
    const participant = nameMap[code];
    const newName = prompt('Enter new name:', participant.name);
    
    if (newName && newName !== participant.name) {
        participant.name = newName;
        loadParticipants();
        showNotification('Participant updated!', 'success');
    }
}

function getRandomColor() {
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Import/Export functions are in app.js
// Clear data function is in app.js
