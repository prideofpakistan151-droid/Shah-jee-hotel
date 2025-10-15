// Theme management
function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply new theme
    document.body.className = newTheme + '-theme';
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    }
    
    // Save to settings
    const settings = getSettings();
    settings.theme = newTheme;
    saveSettings(settings);
    
    showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'success');
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const settings = getSettings();
    const preferredTheme = settings.theme || 'light';
    
    // Apply saved theme
    document.body.className = preferredTheme + '-theme';
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = preferredTheme === 'light' ? '🌙' : '☀️';
    }
    
    // Update theme selector if it exists
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = preferredTheme;
    }
});

// Auto-detect system theme
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const settings = getSettings();
        if (settings.theme === 'auto') {
            const newTheme = e.matches ? 'dark' : 'light';
            document.body.className = newTheme + '-theme';
            
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
            }
        }
    });
}
