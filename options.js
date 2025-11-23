// Options page script
let trackedSites = [];

// Load tracked sites
function loadSites() {
  chrome.storage.local.get(['trackedSites'], (result) => {
    trackedSites = result.trackedSites || [];
    renderSiteList();
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

// Remove site
function removeSite(index) {
  if (confirm(`Remove ${trackedSites[index]} from tracking?`)) {
    trackedSites.splice(index, 1);
    saveSites();
    showSuccessAlert();
  }
}

// Save sites to storage
function saveSites() {
  chrome.storage.local.set({ trackedSites }, () => {
    renderSiteList();
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

// Initial load
loadSites();
