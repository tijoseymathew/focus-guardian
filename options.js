// Options page script
let trackedSites = [];
let thresholds = {
  level1: 0,
  level2: 15,
  level3: 30,
  level4: 60
};

// Load tracked sites
function loadSites() {
  chrome.storage.local.get(['trackedSites'], (result) => {
    trackedSites = result.trackedSites || [];
    renderSiteList();
  });
}

// Load thresholds
function loadThresholds() {
  chrome.storage.local.get(['thresholds'], (result) => {
    if (result.thresholds) {
      thresholds = result.thresholds;
    }
    // Update input fields
    document.getElementById('level2Input').value = thresholds.level2;
    document.getElementById('level3Input').value = thresholds.level3;
    document.getElementById('level4Input').value = thresholds.level4;
  });
}

// Render site list
function renderSiteList() {
  const listContainer = document.getElementById('siteList');
  listContainer.innerHTML = '';

  if (trackedSites.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 48px; margin-bottom: 12px;">🌐</div>
        <div>No websites tracked yet</div>
        <div style="font-size: 13px; margin-top: 8px;">Add some distracting websites to start tracking your time</div>
      </div>
    `;
    return;
  }

  trackedSites.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <span class="site-name">${site}</span>
      <button class="site-remove" data-index="${index}">Remove</button>
    `;
    listContainer.appendChild(item);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll('.site-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      removeSite(index);
    });
  });
}

// Add new site
function addSite() {
  const input = document.getElementById('siteInput');
  let site = input.value.trim().toLowerCase();

  if (!site) {
    alert('Please enter a website');
    return;
  }

  // Remove protocol and www if present
  site = site.replace(/^https?:\/\//, '');
  site = site.replace(/^www\./, '');
  site = site.replace(/\/$/, ''); // Remove trailing slash

  // Check if already exists
  if (trackedSites.includes(site)) {
    alert('This website is already being tracked');
    return;
  }

  // Add to list
  trackedSites.push(site);
  saveSites();
  input.value = '';
  showSuccessAlert();
}

// Remove site with reflection prompt
function removeSite(index) {
  const site = trackedSites[index];
  
  // Reflection prompts to create friction
  const reflections = [
    `Removing ${site} from tracking means you won't see how much time you spend there.\n\nAre you removing it because:\n- You genuinely don't waste time there anymore? ✅\n- You want to avoid accountability? ⚠️\n\nBe honest with yourself.`,
    `Before removing ${site}...\n\nAsk yourself: Am I trying to hide my behavior from myself?\n\nTrue progress comes from awareness, not avoidance.`,
    `Removing ${site} won't make the time-wasting disappear.\n\nIt just makes it invisible.\n\nAre you sure that's what you want?`,
    `Think about why you're removing ${site}:\n\n✅ "I don't use this site anymore"\n⚠️ "I don't want to see how much time I waste there"\n\nWhich one is it?`
  ];
  
  const randomReflection = reflections[Math.floor(Math.random() * reflections.length)];
  
  // Show reflection, then ask for confirmation
  if (confirm(randomReflection)) {
    // Second confirmation with commitment
    const commitment = prompt(
      `Last chance to reconsider.\n\nIf you're removing ${site} because you've genuinely stopped wasting time there, type "COMMITTED" below:`,
      ''
    );
    
    if (commitment && commitment.toUpperCase().trim() === 'COMMITTED') {
      trackedSites.splice(index, 1);
      saveSites();
      showSuccessAlert();
    } else {
      alert('Site not removed. Good choice - accountability helps growth! 💪');
    }
  }
}

// Save sites to storage
function saveSites() {
  chrome.storage.local.set({ trackedSites }, () => {
    renderSiteList();
  });
}

// Save thresholds to storage
function saveThresholds() {
  const level2 = parseInt(document.getElementById('level2Input').value) || 15;
  const level3 = parseInt(document.getElementById('level3Input').value) || 30;
  const level4 = parseInt(document.getElementById('level4Input').value) || 60;
  
  // Validate thresholds are in ascending order
  if (level2 >= level3 || level3 >= level4) {
    alert('Thresholds must be in ascending order:\nLevel 2 < Level 3 < Level 4\n\nExample: 15 < 30 < 60');
    return;
  }
  
  if (level2 < 1 || level3 < 1 || level4 < 1) {
    alert('All thresholds must be at least 1 minute');
    return;
  }
  
  thresholds = {
    level1: 0,
    level2: level2,
    level3: level3,
    level4: level4
  };
  
  chrome.storage.local.set({ thresholds }, () => {
    showSuccessAlert();
  });
}

// Show success alert
function showSuccessAlert() {
  const alert = document.getElementById('successAlert');
  alert.style.display = 'block';
  setTimeout(() => {
    alert.style.display = 'none';
  }, 3000);
}

// Event listeners
document.getElementById('addBtn').addEventListener('click', addSite);
document.getElementById('siteInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addSite();
  }
});
document.getElementById('saveThresholdsBtn').addEventListener('click', saveThresholds);

// Initial load
loadSites();
loadThresholds();
