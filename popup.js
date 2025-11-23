// Popup script

// Motivational quotes that rotate
const QUOTES = [
  "Every minute counts",
  "Time you enjoy wasting is not wasted time... but is this enjoyable?",
  "The cost of a thing is the amount of life you exchange for it",
  "You can't make more time, only better choices",
  "What would your future self thank you for doing right now?",
  "Discipline is choosing between what you want now and what you want most",
  "Your attention is your most valuable asset",
  "Small actions, repeated daily, create extraordinary results",
  "The best time to start was yesterday. The next best time is now",
  "Are you living your life or just killing time?",
  "This moment will never come again. Choose wisely",
  "Productivity isn't about time management. It's about attention management",
  "What you do today can improve all your tomorrows",
  "Time flies. Are you the pilot?",
  "Success is the sum of small efforts repeated day in and day out"
];

// Opportunity cost calculations (minutes -> what you could have done)
const OPPORTUNITY_COSTS = [
  { min: 5, text: "☕ Made and enjoyed a coffee mindfully" },
  { min: 10, text: "📖 Read 5 pages of a book" },
  { min: 15, text: "🧘 Had a meditation session" },
  { min: 20, text: "🚶 Taken a refreshing walk" },
  { min: 30, text: "📚 Read a full chapter, 🎵 Practiced an instrument" },
  { min: 45, text: "💪 Completed a workout, 🍳 Cooked a healthy meal" },
  { min: 60, text: "🎯 Made real progress on a important project" },
  { min: 90, text: "📝 Written a blog post, 🎨 Created something meaningful" },
  { min: 120, text: "🚀 Built a side project feature, 📖 Finished several chapters" },
  { min: 180, text: "🎓 Completed an entire online course module" }
];

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function getOpportunityCost(minutes) {
  // Find the highest threshold that's less than or equal to current minutes
  let bestCost = null;
  for (const cost of OPPORTUNITY_COSTS) {
    if (minutes >= cost.min) {
      bestCost = cost;
    }
  }
  
  if (bestCost) {
    return `Instead, you could have: ${bestCost.text}`;
  }
  return "";
}

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
  const labelElement = document.getElementById('statLabel');
  const costElement = document.getElementById('opportunityCost');
  
  timeElement.textContent = formatTime(seconds);
  
  const minutes = Math.floor(seconds / 60);
  
  // Dynamic label based on time
  if (minutes === 0) {
    labelElement.textContent = "Time Spent Today";
  } else if (minutes < 15) {
    labelElement.textContent = "Time Spent Today";
  } else if (minutes < 30) {
    labelElement.textContent = "Time Lost Today";
  } else if (minutes < 60) {
    labelElement.textContent = "Time Wasted Today";
  } else {
    labelElement.textContent = "Time You'll Never Get Back";
  }
  
  // Update color based on time
  timeElement.className = 'stat-value';
  if (minutes >= 60) {
    timeElement.classList.add('danger');
  } else if (minutes >= 30) {
    timeElement.classList.add('warning');
  }
  
  // Show opportunity cost
  const costText = getOpportunityCost(minutes);
  if (costText) {
    costElement.textContent = costText;
    costElement.style.display = 'block';
  } else {
    costElement.style.display = 'none';
  }
  
  // Update streak
  updateStreak(minutes);
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

// Calculate and update streak
function updateStreak(todayMinutes) {
  const streakCard = document.getElementById('streakCard');
  const streakDays = document.getElementById('streakDays');
  
  // Get last 7 days of data
  chrome.storage.local.get(['dailyData'], (result) => {
    const dailyData = result.dailyData || {};
    let streak = 0;
    
    // Count consecutive days under 30 minutes (excluding today)
    for (let i = 1; i <= 7; i++) {
      const dateKey = getDateKey(i);
      const daySeconds = dailyData[dateKey]?.totalSeconds || 0;
      const dayMinutes = Math.floor(daySeconds / 60);
      
      if (dayMinutes < 30) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
    // Show streak if >= 2 days and today is also under 30
    if (streak >= 2 && todayMinutes < 30) {
      streakDays.textContent = streak;
      streakCard.style.display = 'flex';
    } else {
      streakCard.style.display = 'none';
    }
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

// Event listeners
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
document.getElementById('viewHistoryBtn').addEventListener('click', () => {
  // Could expand chart or show more details
  alert('Full history view coming soon! For now, see the 7-day chart above.');
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.dailyData) {
    loadData();
  }
});

// Set random quote on load
document.getElementById('motivationalQuote').textContent = getRandomQuote();

// Initial load
loadData();

// Refresh every second
setInterval(loadData, 1000);
