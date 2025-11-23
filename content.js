// Content script for displaying timer and border glow
let timerElement = null;
let borderElement = null;
let currentSeconds = 0;
let updateInterval = null;
let isTrackedSite = false;
let thresholds = {
  level1: 0,
  level2: 15,
  level3: 30,
  level4: 60
};

// Load thresholds from storage
async function loadThresholds() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getThresholds' });
    if (response && response.thresholds) {
      thresholds = response.thresholds;
    }
  } catch (e) {
    console.error('Focus Guardian: Error loading thresholds', e);
  }
}

// Check if current site is tracked
async function checkIfTracked() {
  const result = await chrome.storage.local.get(['trackedSites']);
  const trackedSites = result.trackedSites || [];
  const hostname = window.location.hostname;
  return trackedSites.some(site => hostname.includes(site));
}

// Get escalation level based on time and thresholds
function getEscalationLevel(seconds) {
  const minutes = seconds / 60;
  if (minutes >= thresholds.level4) return 4;
  if (minutes >= thresholds.level3) return 3;
  if (minutes >= thresholds.level2) return 2;
  return 1;
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

// Show brief reflection moment on entry (only once per session)
let hasShownReflection = false;
function showReflectionMoment() {
  if (hasShownReflection) return;
  hasShownReflection = true;
  
  const reflections = [
    "⏰ Time tracking is active. Make it count.",
    "🎯 Is this where you want to be right now?",
    "💭 Ask yourself: Is this the best use of my time?",
    "🚀 Your future self is watching. Make them proud.",
    "⏳ Every minute here is a minute not spent on your goals.",
  ];
  
  const reflection = reflections[Math.floor(Math.random() * reflections.length)];
  
  // Create subtle notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    background: rgba(102, 126, 234, 0.95);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 4.7s;
    pointer-events: none;
  `;
  notification.textContent = reflection;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Remove after animation
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 5000);
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
  
  // Load thresholds
  await loadThresholds();
  
  // Show reflection moment (once per page load)
  showReflectionMoment();
  
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
  
  if (changes.thresholds) {
    // Reload thresholds when they change
    await loadThresholds();
    // Update display with current seconds to reflect new levels
    if (timerElement && borderElement) {
      updateDisplay(currentSeconds);
    }
  }
});
