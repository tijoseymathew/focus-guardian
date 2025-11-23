// Background service worker for tracking time
let currentTabId = null;
let currentStartTime = null;
let trackedSites = [];
let todayStartSeconds = 0; // Track seconds at the start of current session

// Default tracked sites
const DEFAULT_SITES = [
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'reddit.com',
  'youtube.com',
  'tiktok.com',
  'linkedin.com'
];

// Default thresholds (in minutes)
const DEFAULT_THRESHOLDS = {
  level1: 0,
  level2: 15,
  level3: 30,
  level4: 60
};

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['trackedSites', 'dailyData', 'thresholds'], (result) => {
    if (!result.trackedSites) {
      chrome.storage.local.set({ trackedSites: DEFAULT_SITES });
    }
    if (!result.dailyData) {
      chrome.storage.local.set({ dailyData: {} });
    }
    if (!result.thresholds) {
      chrome.storage.local.set({ thresholds: DEFAULT_THRESHOLDS });
    }
  });
});

// Load tracked sites on startup
chrome.storage.local.get(['trackedSites'], (result) => {
  trackedSites = result.trackedSites || DEFAULT_SITES;
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.trackedSites) {
    trackedSites = changes.trackedSites.newValue;
  }
});

// Check if URL matches any tracked site
function isTrackedSite(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return trackedSites.some(site => hostname.includes(site));
  } catch (e) {
    return false;
  }
}

// Get today's date key
function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Save time spent
function saveTimeSpent(seconds) {
  const today = getTodayKey();
  chrome.storage.local.get(['dailyData'], (result) => {
    const dailyData = result.dailyData || {};
    if (!dailyData[today]) {
      dailyData[today] = { totalSeconds: 0, sessions: [] };
    }
    dailyData[today].totalSeconds += seconds;
    
    // Keep only last 30 days
    const dates = Object.keys(dailyData).sort();
    if (dates.length > 30) {
      dates.slice(0, dates.length - 30).forEach(date => delete dailyData[date]);
    }
    
    chrome.storage.local.set({ dailyData });
  });
}

// Start tracking
function startTracking(tabId, url) {
  if (isTrackedSite(url)) {
    currentTabId = tabId;
    currentStartTime = Date.now();
    
    // Load today's total seconds when starting tracking
    const today = getTodayKey();
    chrome.storage.local.get(['dailyData'], (result) => {
      const dailyData = result.dailyData || {};
      todayStartSeconds = dailyData[today]?.totalSeconds || 0;
    });
  }
}

// Stop tracking and save time
function stopTracking() {
  if (currentStartTime && currentTabId) {
    const seconds = Math.floor((Date.now() - currentStartTime) / 1000);
    if (seconds > 0) {
      saveTimeSpent(seconds);
    }
    currentStartTime = null;
    currentTabId = null;
  }
}

// Tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  stopTracking();
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      startTracking(activeInfo.tabId, tab.url);
    }
  });
});

// Tab update (URL change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tabId === currentTabId) {
    stopTracking();
    startTracking(tabId, changeInfo.url);
  } else if (changeInfo.url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        stopTracking();
        startTracking(tabId, changeInfo.url);
      }
    });
  }
});

// Window focus change
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs[0]) {
        stopTracking();
        startTracking(tabs[0].id, tabs[0].url);
      }
    });
  }
});

// Tab removed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentTabId) {
    stopTracking();
  }
});

// Periodic save (every 10 seconds) for active tracking
setInterval(() => {
  if (currentStartTime && currentTabId) {
    const seconds = Math.floor((Date.now() - currentStartTime) / 1000);
    if (seconds >= 10) {
      saveTimeSpent(seconds);
      currentStartTime = Date.now(); // Reset counter
    }
  }
}, 10000);

// Message handler for content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTodayTime') {
    const today = getTodayKey();
    chrome.storage.local.get(['dailyData'], (result) => {
      const dailyData = result.dailyData || {};
      const todayData = dailyData[today] || { totalSeconds: 0 };
      
      // Add current session time if actively tracking
      let totalSeconds = todayData.totalSeconds;
      if (currentStartTime && currentTabId) {
        const currentSessionSeconds = Math.floor((Date.now() - currentStartTime) / 1000);
        totalSeconds += currentSessionSeconds;
      }
      
      sendResponse({ seconds: totalSeconds });
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'getThresholds') {
    chrome.storage.local.get(['thresholds'], (result) => {
      sendResponse({ thresholds: result.thresholds || DEFAULT_THRESHOLDS });
    });
    return true;
  }
});
