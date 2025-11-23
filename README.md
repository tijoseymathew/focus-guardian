# 🎯 Focus Guardian

A Chrome extension that helps you stay aware of time spent on distracting websites through increasingly prominent visual cues.

## Features

- **⏱️ Real-time Timer**: Displays cumulative time spent on tracked sites today
- **🌈 Escalating Border Glow**: Full-page border that becomes more intense as time increases
- **📊 Daily Statistics**: View your time-wasting patterns over the last 7 days
- **⚙️ Customizable**: Add or remove any websites you want to track
- **🎨 Visual Escalation Levels**:
  - **0-15 minutes**: Subtle blue border and small timer
  - **15-30 minutes**: Yellow/orange warning with growing timer
  - **30-60 minutes**: Red urgent state with pulsing effects
  - **60+ minutes**: Critical red state with intense pulsing and animations

## Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download the Extension**
   - Download all files from the `focus-guardian` folder

2. **Open Chrome Extensions Page**
   - Open Chrome/Brave/Edge
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `focus-guardian` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Focus Guardian" and click the pin icon

## Usage

### First Time Setup

1. Click the Focus Guardian icon in your toolbar
2. Click "Settings" to open the configuration page
3. The extension comes with default tracked sites:
   - facebook.com
   - twitter.com / x.com
   - instagram.com
   - reddit.com
   - youtube.com
   - tiktok.com
   - linkedin.com

### Adding Custom Sites

1. Open Settings (click extension icon → Settings)
2. Type a website domain (e.g., `news.ycombinator.com`)
3. Click "Add Site"
4. The extension will automatically track time on that domain

### Viewing Statistics

1. Click the Focus Guardian icon in your toolbar
2. You'll see:
   - Total time wasted today
   - A 7-day bar chart of your tracked time
   - Option to reset today's counter

### What You'll See on Tracked Sites

When you visit a tracked site, you'll see:

1. **Timer Display** (top-right corner)
   - Shows cumulative time for today
   - Grows larger and changes color as time increases

2. **Border Glow** (entire page)
   - Subtle blue glow initially
   - Becomes yellow/orange after 15 minutes
   - Turns red and pulses after 30 minutes
   - Intensely pulses and glows after 60 minutes

### Resetting Daily Counter

- The counter automatically resets at midnight
- You can manually reset by clicking "Reset Today" in the popup
- Note: This only resets the current day's counter, not historical data

## How It Works

- **Background Tracking**: Monitors your active tab and tracks time on matched sites
- **Real-time Updates**: Updates every second when on a tracked site
- **Persistent Storage**: Saves your data locally (never leaves your computer)
- **Privacy First**: No data is sent anywhere; everything stays on your device

## Customization Tips

### Site Matching Rules

The extension uses substring matching on hostnames:
- `facebook.com` matches: facebook.com, www.facebook.com, m.facebook.com
- `youtube.com` matches: youtube.com, www.youtube.com, m.youtube.com
- `reddit.com` matches: reddit.com, old.reddit.com, new.reddit.com

### Suggested Sites to Track

**Social Media:**
- facebook.com, twitter.com, instagram.com, linkedin.com, tiktok.com

**Entertainment:**
- youtube.com, netflix.com, twitch.tv, reddit.com

**News/Forums:**
- news.ycombinator.com, medium.com, quora.com

**Shopping:**
- amazon.com, ebay.com, etsy.com

## Technical Details

- Built with Manifest V3
- Uses Chrome Storage API for data persistence
- No external dependencies
- Lightweight and performant

## Troubleshooting

**Timer not showing up?**
- Make sure the site is in your tracked list
- Try refreshing the page
- Check if the extension is enabled in `chrome://extensions/`

**Border glow not visible?**
- Some websites use `z-index` tricks that might cover the border
- The timer should still be visible
- Try zooming out to see the full border effect

**Time not tracking?**
- Ensure the extension has permission for the site
- Check that you're on the active tab (tracking stops when tab is inactive)

**Want to track a specific subdomain only?**
- Use the full subdomain, e.g., `old.reddit.com` instead of `reddit.com`

## Privacy

Focus Guardian:
- ✅ Stores all data locally on your device
- ✅ Never sends data to any server
- ✅ Open source - you can review all the code
- ✅ No analytics or tracking
- ✅ No ads or monetization

## Files Structure

```
focus-guardian/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker (time tracking)
├── content.js          # Content script (timer & border injection)
├── content.css         # Styles for timer and border
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── options.html        # Settings page
├── options.js          # Settings functionality
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

## Future Enhancements

Some ideas for future versions:
- Weekly/monthly reports
- Export data to CSV
- Set daily time limits with notifications
- Productivity goals and streaks
- Block sites after time limit
- Custom color schemes

## License

Free to use, modify, and distribute. Built to help people stay focused!

---

**Made with 🎯 to help you reclaim your focus and time.**
