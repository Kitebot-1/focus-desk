# Focus Desk (Client‑side Web App)

A tiny desktop web app for staying focused.  
Three core features:
1. **Tasks** – Add/complete/delete tasks.
2. **Pomodoro timer** – Focus + break timer with adjustable durations.
3. **Daily reflection** – Notes area that auto-saves locally.

## How to Run
No build tools required.
1. Download the project.
2. Open `index.html` in any modern browser.

## Data Storage
All data is stored in **localStorage** on your device. Nothing leaves the browser.

## Design Decisions
- **Single-page, client-only** for simplicity and portability.
- **Three clear panels** (tasks, timer, reflection) for quick scanning.
- **LocalStorage** keeps data persistent without servers.
- **Minimal UI** with dark theme and accent color to reduce visual noise.

## Assumptions
- Desktop or laptop use only (not optimized for mobile).
- Modern browser with `localStorage` and `crypto.randomUUID()` support.
