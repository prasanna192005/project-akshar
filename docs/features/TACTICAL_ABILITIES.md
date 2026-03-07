# Tactical Deep-Dive: Tactical Ability System

## How We Made It
The ability system is what separates AKSHAR from standard typing racers. It requires a perfect balance of performance tracking and network broadcasting.

### 1. The Charge Equation
We developed a specialized algorithm in `lib/gameEngine.ts` to calculate ability charge:
- **Baseline**: 60 WPM at 100% accuracy fills the bar in 8 seconds.
- **Modifiers**: Every agent has a `chargeRateModifier`. VAYU (Agile) charges faster, while YANTRA (Heavy) charges slower.
- **Error Gating**: Charging stops immediately if the player has an uncorrected typo, forcing a focus on precision over raw speed.

### 2. The Targeting Matrix
Activating an ability (`TAB`) triggers a targeting resolution:
- **Leader Logic**: The system identifies the opponent with the highest `progress` percentage.
- **Broadcast**: Using Firebase's atomic `update()`, we push the effect (e.g., `effects/blurred: true`) to the target's node.
- **Client-Side Trigger**: The target's `EffectOverlay` component listens for these state changes and renders the corresponding visual distortion.

### 3. Ability Diversity
We implemented 8 unique tactical payloads, ranging from **Movement** (Word Skipping) to **Visual Distortions** (Flashes/Blurs) and **Input Disruption** (Keyboard Locking).

---

## Errors Faced

### 1. The "Infinite Dash"
- **Error**: VAYU's "Slipstream" (Word Skip) was occasionally skipping to the end of the race instantly.
- **Cause**: A race condition where the `skipWords` callback was being triggered multiple times because the `TAB` key-down event wasn't being debounced.
- **Solution**: Added an `onCooldown` guard directly into the `activateAbility` hook to prevent multiple activations within the same millisecond.

### 2. Desync in Multi-Targeting
- **Error**: When using "Target All" mode, some opponents would receive the effect while others wouldn't.
- **Cause**: We were originally using individual `update()` calls for each opponent, leading to network congestion and partial failures.
- **Solution**: Refactored to build a single **Atomic Update Object**. We now compile all target paths into one object and send it in a single Firebase request: `update(ref(db), { 'path1': val, 'path2': val })`.

### 3. Effect Persistence
- **Error**: Abilities like "Empress" (KALI) were staying active forever if the user disconnected mid-activation.
- **Solution**: Implemented a "Self-Clearing" logic in the `usePlayer` hook. When a player enters a room, it automatically scrubs any stale effects from their last session, ensuring a clean slate for every race.
