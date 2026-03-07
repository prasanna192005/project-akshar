# Tactical Deep-Dive: Operative Identity & Sync

## How We Made It
Identity is the core of the AKSHAR experience. We needed a way for players to manage their handles and for the game to enforce those identities across the network.

### 1. Inline Identity Command
We replaced traditional "Profile Settings" forms with a **Seamless Inline Editor** in the Dashboard:
- **Interaction**: A simple pencil icon next to the operative handle toggles a tactical input field.
- **State Handling**: We used a local `isEditing` state that, upon submission, triggers a `userService.ts` update to the Firebase `users/` node.
- **Decryption Feedback**: We applied our signature "Decryption" hover effect to the handle even in edit mode to maintain the "hacker" aesthetic.

### 2. Global Character Synchronization
When the project pivoted from its original roster to the **AKSHAR Archive** (VAYU, AGNI, etc.), we had to sync this across multiple layers:
- **`lib/agents.ts`**: The source of truth for stats and ability names.
- **`lib/lore.ts`**: The narrative backing.
- **`lib/tips.ts`**: The loading screen intelligence.
- **UI Components**: Every page from `/test` to `/results` pulls from these centralized libraries, ensuring a single name change in the config propagates everywhere.

### 3. Handle Enforcement
In the Lobby, we implemented a check that looks for a `typeagents_player_name` in localStorage. If missing, it uses our **Shared Link Logic** to bounce the user to the Home page for identification.

---

## Errors Faced

### 1. The "Callsign" Leak
- **Error**: Even after rebranding, some components were still displaying "ZEPHYR" or "PYRA" (internal codenames) instead of "VAYU" or "AGNI."
- **Solution**: We performed a **Cross-Codebase Audit** and migrated all UI strings to point directly to `AGENTS[id].name` instead of hardcoded strings. We also removed the confusing "Callsign" column from the public documentation.

### 2. Name Collision in Firebase
- **Error**: Updating a handle in the Dashboard didn't immediately update the name stored in active game rooms.
- **Solution**: We implemented a "Snapshot Listener" in the `usePlayer` hook. Now, when a player changes their handle in their profile, the active game room's `players/[id]/name` field is updated via a background Firebase cloud update, ensuring their squad-mates see the change instantly.

### 3. Case-Sensitivity in Search
- **Error**: Players joining via `?join=abcd` (lowercase) were failing to find rooms created with `ABCD` (uppercase).
- **Solution**: We normalized all room codes to `.toUpperCase()` at the network entry point, ensuring the "Identity Check" is case-insensitive for better usability.
