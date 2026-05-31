/* ===================================
   CONFIGURATION
   =================================== */

const CONFIG = {
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    currentTheme: localStorage.getItem('theme') || 'dark',
    currentThemePreset: localStorage.getItem('themePreset') || 'default',
};

/* ===================================
   THEME SYSTEM
   =================================== */

const THEMES = {
    default: {
        colors: {
            primary: '#00d9ff',
            secondary: '#0099ff',
            accent: '#ff006e',
            success: '#00ff88',
            warning: '#ffaa00',
            danger: '#ff3366',
        }
    },
    cyberpunk: {
        colors: {
            primary: '#ff006e',
            secondary: '#00ff88',
            accent: '#00d9ff',
            success: '#00ff88',
            warning: '#ff006e',
            danger: '#ffaa00',
        }
    },
    ocean: {
        colors: {
            primary: '#0099ff',
            secondary: '#00d9ff',
            accent: '#00ff88',
            success: '#00ff88',
            warning: '#ffaa00',
            danger: '#ff3366',
        }
    },
    sunset: {
        colors: {
            primary: '#ff6b6b',
            secondary: '#ffaa00',
            accent: '#ff006e',
            success: '#ffaa00',
            warning: '#ff6b6b',
            danger: '#ff006e',
        }
    },
    forest: {
        colors: {
            primary: '#00ff88',
            secondary: '#0099ff',
            accent: '#00d9ff',
            success: '#00ff88',
            warning: '#ffaa00',
            danger: '#ff6b6b',
        }
    },
    midnight: {
        colors: {
            primary: '#b78bff',
            secondary: '#7b5cff',
            accent: '#ff00ff',
            success: '#00ff88',
            warning: '#ffaa00',
            danger: '#ff3366',
        }
    }
};

function initializeTheme() {
    const html = document.documentElement;
    
    // Set mode (dark/light)
    html.setAttribute('data-mode', CONFIG.currentTheme);
    updateThemeIcon();
    
    // Set preset
    document.getElementById('themePreset').value = CONFIG.currentThemePreset;
    applyTheme(CONFIG.currentThemePreset);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentMode = html.getAttribute('data-mode') || 'dark';
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-mode', newMode);
    CONFIG.currentTheme = newMode;
    localStorage.setItem('theme', newMode);
    updateThemeIcon();
    
    addLog(`Switched to ${newMode} mode`, 'info');
    playSound(1200, 100);
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    const mode = document.documentElement.getAttribute('data-mode') || 'dark';
    icon.textContent = mode === 'dark' ? '🌙' : '☀️';
}

function applyTheme(themeName) {
    const theme = THEMES[themeName] || THEMES.default;
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}-color`, value);
    });
    
    CONFIG.currentThemePreset = themeName;
    localStorage.setItem('themePreset', themeName);
    addLog(`Theme changed to ${themeName}`, 'info');
    playSound(800, 150);
}

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* ===================================
   SOUND SYSTEM
   =================================== */

function toggleSound() {
    CONFIG.soundEnabled = !CONFIG.soundEnabled;
    localStorage.setItem('soundEnabled', CONFIG.soundEnabled);
    
    const icon = document.getElementById('soundIcon');
    icon.textContent = CONFIG.soundEnabled ? '🔊' : '🔇';
    
    addLog(`Sound ${CONFIG.soundEnabled ? 'enabled' : 'disabled'}`, 'info');
}

function playSound(frequency = 800, duration = 150) {
    if (!CONFIG.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.warn('Audio context not available:', error);
    }
}

/* ===================================
   PARTICLE SYSTEM
   =================================== */

function createParticles(x, y, count = 8) {
    const container = document.getElementById('particlesContainer');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (i / count) * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--tx', tx / 50);
        particle.style.setProperty('--ty', ty / 50);
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    }
}

/* ===================================
   TOAST NOTIFICATION SYSTEM
   =================================== */

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    // Reset styles
    toast.style.background = '';
    toast.style.color = '';
    
    const colors = {
        success: 'linear-gradient(135deg, rgba(0, 255, 136, 0.95), rgba(0, 217, 255, 0.95))',
        error: 'linear-gradient(135deg, rgba(255, 51, 102, 0.95), rgba(255, 0, 110, 0.95))',
        warning: 'linear-gradient(135deg, rgba(255, 170, 0, 0.95), rgba(255, 100, 0, 0.95))',
        info: 'linear-gradient(135deg, rgba(0, 217, 255, 0.95), rgba(0, 153, 255, 0.95))',
    };
    
    toast.style.background = colors[type] || colors.success;
    toast.style.color = type === 'warning' ? '#050810' : '#ffffff';
    
    // Create particles on toast
    const rect = toast.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
    
    playSound(type === 'error' ? 600 : 1200, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ===================================
   LOGGING SYSTEM
   =================================== */

function addLog(message, type = 'info') {
    const logsContainer = document.getElementById('logsContainer');
    const timestamp = getCurrentTime();
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="log-text">${message}</span>
    `;
    
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
    
    // Particle effect on new log
    if (type === 'success') {
        createParticles(window.innerWidth * 0.75, window.innerHeight * 0.5, 4);
    }
}

function clearLogs() {
    const logsContainer = document.getElementById('logsContainer');
    logsContainer.innerHTML = `
        <div class="log-entry log-info">
            <span class="timestamp">[${getCurrentTime()}]</span>
            <span class="log-text">System initialized. Ready for file upload.</span>
        </div>
    `;
}

/* ===================================
   LOADING STATE
   =================================== */

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
    playSound(1000, 80);
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    playSound(1400, 100);
}

/* ===================================
   FILE HANDLING
   =================================== */

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');

let selectedFile = null;

// Click to select file
dropZone.addEventListener('click', () => {
    fileInput.click();
    createParticles(event.clientX, event.clientY, 6);
});

// File input change
fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
        handleFileSelect(fileInput.files[0]);
    }
});

// Drag over
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
    dropZone.style.borderColor = '#0099ff';
    dropZone.style.boxShadow = 'inset 0 0 30px rgba(0, 217, 255, 0.15)';
    playSound(1100, 50);
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
    dropZone.style.borderColor = '';
    dropZone.style.boxShadow = '';
});

// Drop
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    dropZone.style.borderColor = '';
    dropZone.style.boxShadow = '';
    
    const files = e.dataTransfer.files;
    if (files[0]) {
        handleFileSelect(files[0]);
        createParticles(e.clientX, e.clientY, 12);
    }
});

function handleFileSelect(file) {
    // Validate file type
    if (!file.name.endsWith('.js')) {
        showToast('Please upload a .js file', 'error');
        addLog('Invalid file type: ' + file.name, 'error');
        playSound(400, 200);
        return;
    }

    selectedFile = file;
    
    // Update metadata display
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatBytes(file.size);
    document.getElementById('fileDate').textContent = formatDate(new Date(file.lastModified));
    
    fileInfo.style.display = 'block';
    dropZone.style.display = 'none';
    
    addLog(`File selected: ${file.name} (${formatBytes(file.size)})`, 'info');
    showToast(`File selected: ${file.name}`, 'success');
    
    // Particle effect
    createParticles(window.innerWidth / 2, window.innerHeight / 3, 10);
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    dropZone.style.display = 'block';
    
    addLog('File selection cleared', 'info');
    showToast('File selection cleared', 'info');
    
    // Particle effect
    createParticles(window.innerWidth / 2, window.innerHeight / 3, 8);
}

/* ===================================
   HASH GENERATION
   =================================== */

let hashCounter = 0;
let filesProcessed = 0;

async function generateHash() {
    if (!selectedFile) {
        showToast('Please select a file first', 'error');
        addLog('Generation failed: No file selected', 'error');
        playSound(400, 200);
        return;
    }

    showLoading();
    addLog('Starting hash generation...', 'info');
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        addLog('Uploading file to server...', 'info');
        playSound(900, 100);
        
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            hideLoading();
            showToast(data.message || 'Failed to generate hash', 'error');
            addLog(`Error: ${data.message}`, 'error');
            playSound(400, 200);
            return;
        }

        addLog('Hash generated successfully', 'success');
        
        // Display result
        const resultBox = document.getElementById('resultBox');
        const terminalEmpty = document.getElementById('terminalEmpty');
        const result = document.getElementById('result');
        
        result.textContent = data.secjs;
        resultBox.style.display = 'block';
        terminalEmpty.style.display = 'none';

        // Update counters with animation
        hashCounter++;
        filesProcessed++;
        animateCounter('hashCount', hashCounter);
        animateCounter('filesProcessed', filesProcessed);

        addLog(`Result ready for copy (${data.secjs.length} characters)`, 'success');
        
        hideLoading();
        showToast('Hash generated successfully! Ready to copy.', 'success');
        
        // Particle celebration
        createParticles(window.innerWidth / 2, window.innerHeight / 2, 20);
        playSound(1500, 150);
        
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        showToast('Error: ' + error.message, 'error');
        addLog(`Error: ${error.message}`, 'error');
        playSound(300, 300);
    }
}

function animateCounter(id, value) {
    const element = document.getElementById(id);
    const currentValue = parseInt(element.textContent);
    const step = (value - currentValue) / 10;
    let current = currentValue;
    
    const interval = setInterval(() => {
        current += step;
        if ((step > 0 && current >= value) || (step < 0 && current <= value)) {
            element.textContent = value;
            clearInterval(interval);
        } else {
            element.textContent = Math.round(current);
        }
    }, 30);
}

/* ===================================
   COPY TO CLIPBOARD
   =================================== */

async function copyResult() {
    const text = document.getElementById('result').textContent;
    
    if (!text) {
        showToast('No content to copy', 'error');
        playSound(400, 200);
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        
        const copyBtn = document.getElementById('copyBtn');
        const originalHTML = copyBtn.innerHTML;
        
        // Animate button
        copyBtn.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>';
        copyBtn.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.4), rgba(0, 217, 255, 0.2))';
        copyBtn.style.borderColor = '#00ff88';
        
        addLog('Content copied to clipboard', 'success');
        showToast('Copied to clipboard!', 'success');
        
        // Particle effect on button
        const rect = copyBtn.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
        playSound(1200, 100);
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
            copyBtn.style.borderColor = '';
        }, 2000);
        
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Failed to copy: ' + error.message, 'error');
        addLog('Copy failed: ' + error.message, 'error');
        playSound(300, 300);
    }
}

/* ===================================
   SCROLL ANIMATION
   =================================== */

function observeScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/* ===================================
   INITIALIZATION
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Setup theme switcher
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('themePreset').addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
    
    // Setup sound toggle
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('soundIcon').textContent = CONFIG.soundEnabled ? '🔊' : '🔇';
    
    // Setup scroll animations
    observeScrollAnimation();
    
    // Global particle effect on any click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('select')) {
            createParticles(e.clientX, e.clientY, 3);
        }
    });
    
    addLog('System initialized successfully', 'success');
    addLog('Ready to process JavaScript files', 'info');
    playSound(1000, 150);
});

/* ===================================
   ERROR HANDLING
   =================================== */

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    addLog(`Error: ${event.error.message}`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    addLog(`Error: ${event.reason}`, 'error');
});
