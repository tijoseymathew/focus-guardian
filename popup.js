// Popup script
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDateKey(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDayLabel(daysAgo) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yest';
  
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

function updateTodayDisplay(seconds) {
  const timeElement = document.getElementById('todayTime');
  timeElement.textContent = formatTime(seconds);
  
  // Update color based on time
  const minutes = seconds / 60;
  timeElement.className = 'stat-value';
  if (minutes >= 60) {
    timeElement.classList.add('danger');
  } else if (minutes >= 30) {
    timeElement.classList.add('warning');
  }
}

function updateWeekChart(dailyData) {
  const chartContainer = document.getElementById('weekChart');
  const labelsContainer = document.getElementById('weekLabels');
  
  chartContainer.innerHTML = '';
  labelsContainer.innerHTML = '';
  
  // Get data for last 7 days
  const weekData = [];
  let maxSeconds = 0;
  
  for (let i = 6; i >= 0; i--) {
    const dateKey = getDateKey(i);
    const seconds = dailyData[dateKey]?.totalSeconds || 0;
    weekData.push({ label: getDayLabel(i), seconds });
    maxSeconds = Math.max(maxSeconds, seconds);
  }
  
  // Create bars
  weekData.forEach(day => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const height = maxSeconds > 0 ? (day.seconds / maxSeconds) * 100 : 2;
    bar.style.height = `${height}%`;
    bar.title = `${day.label}: ${formatTime(day.seconds)}`;
    chartContainer.appendChild(bar);
    
    const label = document.createElement('span');
    label.textContent = day.label;
    labelsContainer.appendChild(label);
  });
}

// Load data
function loadData() {
  chrome.storage.local.get(['dailyData'], (result) => {
    const dailyData = result.dailyData || {};
    const today = getTodayKey();
    const todaySeconds = dailyData[today]?.totalSeconds || 0;
    
    updateTodayDisplay(todaySeconds);
    updateWeekChart(dailyData);
  });
}

// Reset today's data
function resetToday() {
  if (confirm('Are you sure you want to reset today\'s time tracking?')) {
    const today = getTodayKey();
    chrome.storage.local.get(['dailyData'], (result) => {
      const dailyData = result.dailyData || {};
      if (dailyData[today]) {
        dailyData[today].totalSeconds = 0;
        chrome.storage.local.set({ dailyData }, () => {
          loadData();
        });
      }
    });
  }
}

// Event listeners
document.getElementById('resetBtn').addEventListener('click', resetToday);
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.dailyData) {
    loadData();
  }
});

// Initial load
loadData();

// Refresh every second
setInterval(loadData, 1000);
