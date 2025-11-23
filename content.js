// Content script for displaying timer and border glow
let timerElement = null;
let borderElement = null;
let currentSeconds = 0;
let updateInterval = null;
let isTrackedSite = false;

// Check if current site is tracked
async function checkIfTracked() {
  const result = await chrome.storage.local.get(['trackedSites']);
  const trackedSites = result.trackedSites || [];
  const hostname = window.location.hostname;
  return trackedSites.some(site => hostname.includes(site));
}

// Get escalation level based on time
function getEscalationLevel(seconds) {
  const minutes = seconds / 60;
  if (minutes < 15) return 1;
  if (minutes < 30) return 2;
  if (minutes < 60) return 3;
  return 4;
}

// Format time display
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Create timer display element
function createTimer() {
  if (timerElement) return;
  
  timerElement = document.createElement('div');
  timerElement.id = 'focus-guardian-timer';
  timerElement.innerHTML = `
    <div class="timer-content">
      <div class="timer-label">Time Wasted Today</div>
      <div class="timer-display">0s</div>
    </div>
  `;
  document.body.appendChild(timerElement);
}

// Create border glow element
function createBorder() {
  if (borderElement) return;
  
  borderElement = document.createElement('div');
  borderElement.id = 'focus-guardian-border';
  document.body.appendChild(borderElement);
}

// Update timer display and styling based on time
function updateDisplay(seconds) {
  if (!timerElement || !borderElement) return;
  
  currentSeconds = seconds;
  const level = getEscalationLevel(seconds);
  
  // Update timer text
  const display = timerElement.querySelector('.timer-display');
  if (display) {
    display.textContent = formatTime(seconds);
  }
  
  // Update classes for escalation
  timerElement.className = `level-${level}`;
  borderElement.className = `level-${level}`;
}

// Fetch current time from background
async function fetchTime() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTodayTime' });
    if (response && response.seconds !== undefined) {
      updateDisplay(response.seconds);
    }
  } catch (e) {
    console.error('Focus Guardian: Error fetching time', e);
  }
}

// Initialize the extension
async function initialize() {
  isTrackedSite = await checkIfTracked();
  
  if (!isTrackedSite) return;
  
  // Create UI elements
  createTimer();
  createBorder();
  
  // Initial fetch
  await fetchTime();
  
  // Update every second
  updateInterval = setInterval(() => {
    fetchTime();
  }, 1000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for storage changes (if sites list is updated)
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (changes.trackedSites) {
    const wasTracked = isTrackedSite;
    isTrackedSite = await checkIfTracked();
    
    if (isTrackedSite && !wasTracked) {
      // Site was just added to tracking
      initialize();
    } else if (!isTrackedSite && wasTracked) {
      // Site was removed from tracking
      if (timerElement) timerElement.remove();
      if (borderElement) borderElement.remove();
      if (updateInterval) clearInterval(updateInterval);
      timerElement = null;
      borderElement = null;
    }
  }
});
