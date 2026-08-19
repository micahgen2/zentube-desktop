# ZenTube Desktop 🎬🧘

A custom, distraction-free, and privacy-friendly YouTube desktop client built with **Electron**, **React**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- **Ad-Free & Privacy First**: Powered by a resilient, multi-instance pool of public Invidious & Piped proxy APIs. No Google account, tracking, or API keys required.
- **Distraction-Free "Zen Mode"**: 1-click toggle (or shortcut `Z`) to hide all recommendations, sidebars, view counts, and comments for pure mindful viewing and deep work.
- **Custom Native-Feel HTML5 Player**:
  - Direct video and HLS stream playback with adaptive resolution selection (`1080p`, `720p`, `480p`, `360p`, `Audio Only`).
  - **200% Audio Volume Booster** using Web Audio API Gain amplification.
  - Playback speed control ($0.25\times$ to $3.0\times$).
  - Full keyboard shortcuts (`Space`/`K` to toggle play, `J`/`L` for 10s seek, `Arrows` for 5s seek & volume, `F` for fullscreen, `T` for theater mode, `Z` for Zen Mode, `M` for mute).
  - Hover timeline scrubber with preview tooltips.
- **Private Local Library**:
  - **Local Subscriptions**: Follow channels without an account; access latest uploads in one click.
  - **Watch History**: Automatically tracks progress and last-played timestamps.
  - **Watch Later & Bookmarks**: Save videos instantly.
  - **Custom Playlists**: Create, edit, and organize local playlists with JSON export/import backup.
- **Frameless Modern Desktop UI**:
  - Glassmorphic dark theme, custom draggable title bar with live search autocomplete, and collapsible sidebar navigation.
  - Cross-Origin proxy bridge in Electron main process to bypass web browser CORS restrictions.

---

## 🚀 How to Run

### 1. Development Mode (with Live Reloading)
```powershell
cd C:\Users\Micah\.gemini\antigravity\scratch\custom-youtube-client
npm.cmd run dev
```

### 2. Production Build & Electron Packaging
```powershell
npm.cmd run build
npm.cmd run pack
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` / `K` | Play / Pause video |
| `J` / `L` | Seek backward / forward 10 seconds |
| `←` / `→` | Seek backward / forward 5 seconds |
| `↑` / `↓` | Volume Up / Down (5% increments) |
| `M` | Mute / Unmute audio |
| `F` | Toggle Fullscreen |
| `T` | Toggle Theater Mode |
| `Z` | Toggle Distraction-Free **Zen Mode** |

---

## 🛠️ Architecture

```
custom-youtube-client/
├── electron/
│   ├── main.ts         # Electron window management & CORS proxy IPC
│   └── preload.ts      # Secure type-safe electronAPI bridge
├── src/
│   ├── components/
│   │   ├── VideoPlayer/  # Custom player with HLS, speed, quality, volume boost
│   │   ├── TitleBar.tsx  # Frameless titlebar with search autocomplete
│   │   ├── Sidebar.tsx   # Collapsible navigation & local subscriptions
│   │   ├── VideoCard.tsx # Video thumbnail cards with quick actions
│   │   └── CommentSection.tsx
│   ├── views/
│   │   ├── HomeView.tsx     # Trending & category feeds
│   │   ├── WatchView.tsx    # Active video player & info
│   │   ├── SearchView.tsx   # Search results with sorting
│   │   ├── ChannelView.tsx  # Channel profile & uploads
│   │   ├── LibraryView.tsx  # History, saved, playlists, subs
│   │   └── SettingsView.tsx # Custom instances, Zen mode, data backup
│   ├── services/
│   │   ├── api.ts      # Multi-instance Invidious & Piped client with failover
│   │   └── storage.ts  # LocalStorage persistence service
│   ├── types/index.ts  # Type definitions
│   └── App.tsx         # Main layout & router
```
