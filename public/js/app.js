/* ===================================
   UTILITY FUNCTIONS
   =================================== */

// Get current time for logs
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format date
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
   TOAST NOTIFICATION SYSTEM
   =================================== */

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    // Remove specific styles
    toast.style.background = '';
    toast.style.color = '';
    
    // Set type-specific styles
    switch(type) {
        case 'success':
            toast.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.95), rgba(0, 217, 255, 0.95))';
            toast.style.color = '#050810';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(135deg, rgba(255, 51, 102, 0.95), rgba(255, 0, 110, 0.95))';
            toast.style.color = '#ffffff';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.95), rgba(255, 100, 0, 0.95))';
            toast.style.color = '#050810';
            break;
        case 'info':
            toast.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.95), rgba(0, 153, 255, 0.95))';
            toast.style.color = '#050810';
            break;
    }
    
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
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
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
    dropZone.style.borderColor = '#0099ff';
    dropZone.style.boxShadow = 'inset 0 0 30px rgba(0, 217, 255, 0.15)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#00d9ff';
    dropZone.style.boxShadow = '';
});

// Drop
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#00d9ff';
    dropZone.style.boxShadow = '';
    
    const files = e.dataTransfer.files;
    if (files[0]) {
        handleFileSelect(files[0]);
    }
});

function handleFileSelect(file) {
    // Validate file type
    if (!file.name.endsWith('.js')) {
        showToast('Please upload a .js file', 'error');
        addLog('Invalid file type: ' + file.name, 'error');
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
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    dropZone.style.display = 'block';
    
    addLog('File selection cleared', 'info');
    showToast('File selection cleared', 'info');
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
        return;
    }

    showLoading();
    addLog('Starting hash generation...', 'info');
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        addLog('Uploading file to server...', 'info');
        
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            hideLoading();
            showToast(data.message || 'Failed to generate hash', 'error');
            addLog(`Error: ${data.message}`, 'error');
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

        // Update counters
        hashCounter++;
        filesProcessed++;
        document.getElementById('hashCount').textContent = hashCounter;
        document.getElementById('filesProcessed').textContent = filesProcessed;

        addLog(`Result ready for copy (${data.secjs.length} characters)`, 'success');
        
        hideLoading();
        showToast('Hash generated successfully! Ready to copy.', 'success');
        
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        showToast('Error: ' + error.message, 'error');
        addLog(`Error: ${error.message}`, 'error');
    }
}

/* ===================================
   COPY TO CLIPBOARD
   =================================== */

async function copyResult() {
    const text = document.getElementById('result').textContent;
    
    if (!text) {
        showToast('No content to copy', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        
        // Animate button
        copyBtn.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>';
        copyBtn.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.4), rgba(0, 217, 255, 0.2))';
        copyBtn.style.borderColor = '#00ff88';
        
        addLog('Content copied to clipboard', 'success');
        showToast('Copied to clipboard!', 'success');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
            copyBtn.style.borderColor = '';
        }, 2000);
        
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Failed to copy: ' + error.message, 'error');
        addLog('Copy failed: ' + error.message, 'error');
    }
}

/* ===================================
   INITIALIZATION
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    addLog('System initialized successfully', 'success');
    addLog('Ready to process JavaScript files', 'info');
});
