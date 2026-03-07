# Tactical Deep-Dive: Debug Infrastructure

## How We Made It
Since AKSHAR is a live production environment, we needed a way to test effects and room configurations without exposing sensitive tools to regular operatives.

### 1. The Tactical Lock Screen
We implemented a **Challenge-Response Lock** for the `/debug` route:
- **Authorization**: The page checks for a `NEXT_PUBLIC_DEBUG_ACCESS_KEY` in the environment.
- **Verification**: Users must enter this key into a specialized "Decryption Interface."
- **Persistence**: Upon success, a `debug_auth_token` is stored in `localStorage`, allowing the developer to bypass the lock on subsequent visits.

### 2. Live Effect Simulation
The Debug Center is equipped with a **Neural Link Simulator** that can inject effects directly into the developer's session:
- **Injection Logic**: It bypasses the standard `useAbility` cooldowns and targeting logic, writing directly to the `rooms/[roomId]/players/[playerId]/effects` path.
- **Visual Validation**: This allows us to test "Flashes," "Blurs," and "Scrambles" instantly and adjust CSS decay rates in real-time.

### 3. State Telemetry
We added a "System Log" overlay in the lower-left corner of the game window. This provides real-time telemetry:
- **Room GUID**
- **Uplink Status**
- **Host Override Bits**

---

## Errors Faced

### 1. Key Leakage
- **Error**: The debug access key was accidentally visible in the client-side JavaScript bundle during the first deployment.
- **Solution**: Migrated the key to a `NEXT_PUBLIC_` environment variable but added a secondary **Environment Guard** that prevents the debug component from even mounting if the key is not defined at build-time.

### 2. Effect Ghosting
- **Error**: Effects triggered via the debug menu would sometimes persist even after a page refresh.
- **Solution**: Implemented a "Total Reset" protocol in the `DebugCenter` that clears the Firebase effects node for the current user upon mounting the debug page.

### 3. Unauthorized Access Attempts
- **Error**: Users were manually navigating to `/debug` and seeing the UI even if they couldn't use it.
- **Solution**: Added a **Route Guard** that returns a 404-style "Unauthorized Access" screen if the security token is missing, maintaining the "Classified" atmosphere of the project.
