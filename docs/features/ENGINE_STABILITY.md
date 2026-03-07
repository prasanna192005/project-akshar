# Tactical Deep-Dive: Game Engine Stability

## How We Made It
The AKSHAR game engine needs to be frame-perfect to handle competitive typing. We optimized the react-based engine to prevent crashes during the transition from "Loading" to "In-Game."

### 1. The Hook Stabilization
React's **Rules of Hooks** require hooks to be called in the exact same order every render.
- **The Challenge**: Our engine was conditionally returning the `LoadingScreen` component before data arrived, which "stole" hooks from the subsequent game render.
- **The Refactor**: We moved all custom hooks (`useTyping`, `useAbility`) and `useEffect` blocks to the top level of the `Game` component. They now initialize with "Safe Fallbacks" (empty arrays/strings) until the room data is decrypted from the server.

### 2. Hydration Guards
In Next.js, the server-rendered HTML must match the client-side hydration exactly.
- **Implementation**: We used a `mounted` state check in the Home page. This ensures that dynamic elements (like reading `localStorage` for operative names) only happen on the client, preventing the dreaded "Hydration Mismatch" error.

### 3. Silent Redirection
We implemented a **Double-Buffer Redirect** in the Lobby:
- **Buffer 1**: The page returns `null` while it checks for a name.
- **Buffer 2**: If no name exists, it immediately triggers `router.push("/")`.
- **Result**: Users joining via shared links don't see a "flashing" lobby; they see an instant, smooth transition to the Home page to register their handle.

---

## Errors Faced

### 1. The "Hook Order Change" Error
- **Error**: `React has detected a change in the order of Hooks called by Game.`
- **Cause**: An early return statement in `app/game/[roomId]/page.tsx` was bypassing 18+ hooks whenever the room was in a "Loading" state.
- **Solution**: We removed the early return and instead conditionally rendered the *content* inside the JSX, keeping the hook calls constant.

### 2. The Perpetual Loading Hang
- **Error**: Players with a saved name but no session ID were getting stuck on the `LoadingScreen` indefinitely.
- **Solution**: We added a **Session Recovery** logic in the `useRoom` hook that automatically generates a new UUID session if it detects a valid name but a missing session token.

### 3. Ability Charge Stutter
- **Error**: The charge bar for abilities would "jump" or reset randomly.
- **Solution**: We refactored `useAbility.ts` to use `refs` for WPM and Accuracy metrics. This allows the internal charge timer to run smoothly without being interrupted by the high-frequency state updates of the typing engine.
