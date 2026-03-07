# Tactical Deep-Dive: Auth & Dashboard Systems

## How We Made It
The goal was to provide operatives with persistent progression tracking without abandoning the "quick-start" nature of a typing game.

### 1. Hybrid Auth Strategy
We implemented a multi-tier authentication system using **Firebase Auth**:
- **Anonymous Session**: Every player starts with a guest profile to prevent friction.
- **Google Uplink**: Players can link their guest progress to a verified Google account via `linkWithPopup`.
- **Session Persistence**: We used a combination of Firebase `onAuthStateChanged` and `sessionStorage` (for player IDs) to ensure that accidental tab closures didn't result in lost data.

### 2. Forensic Trend Charts
Instead of using heavy charting libraries (like Chart.js), we built a custom, lightweight **SVG Forensic Graph**:
- **Data Pipeline**: Historical WPM and Accuracy stats are pulled from the user's `performanceHistory` object in the database.
- **Dynamic Path Generation**: We wrote a utility that maps performance nodes to SVG coordinate space, drawing a tactical "Sand-Amber" polyline with glowing filters.
- **Hydration Sync**: To prevent the graph from "jumping" during load, we used CSS transitions on the SVG `stroke-dasharray`.

### 3. Operative Insights
The Dashboard serves as the "Command Center," aggregating real-time stats from the `userService.ts` module, which handles the complex calculations for **Level Progression** (XP based on WPM and Wins).

---

## Errors Faced

### 1. The "Ghost Sign-Out"
- **Error**: Players were occasionally losing their session after finishing a game, forced to re-sign in.
- **Cause**: The `Results` page was triggering a clean-up logic that accidentally wiped the `sessionStorage` token before the Firebase auth state had fully resolved.
- **Solution**: We implemented an **Auth Guard** in the `results` page that waits for `auth.currentUser` to be defined before allowing any secondary state transitions.

### 2. Dashboard Staleness
- **Error**: Updating the operative handle in the Command Center wouldn't reflect on the Home page immediately.
- **Solution**: Switched from local state to a **Unified Auth Hook** (`useAuth.ts`) that listens to the Firebase User object globally. This ensures every component in the system reacts to profile changes in real-time.

### 3. Avatar Hydration Flash
- **Error**: User avatars would flicker between a placeholder and the real image on every page refresh.
- **Solution**: We pre-fetched the tactical avatar map and stored the selection in a global `localStorage` cache as a "speed-reader" while the Firebase profile was still being fetched.
