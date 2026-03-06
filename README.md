# 🌪️ Typhöön

[![Static Badge](https://img.shields.io/badge/Tactical-Typing-red?style=for-the-badge)](https://github.com/prasanna192005/not-my-type-valorant)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Typhöön** is a fast-paced, competitive multiplayer typing racer inspired by the tactical depth of hero shooters. It's not just about how fast you type—it's about how you use your abilities to disrupt opponents and surge ahead.

---

## 🚀 Key Features

- **Real-Time Multiplayer**: Compete against friends in a lobby system powered by Firebase Realtime Database.
- **Agent Selection**: Choose from 8 unique agents, each with their own **Passive** and **Active** abilities.
- **Tactical Abilities**: Use `TAB` to activate your agent's signature ability once your charge bar is full.
- **Dynamic Targeting**: Configure rooms to target the leader, a random opponent, or everyone at once.
- **Testing Range**: A dedicated sandbox (`/test`) to practice your typing and master agent abilities.
- **Premium UI**: A sleek, high-contrast interface with smooth animations and reactive feedback.

---

## 🎭 The Agents

Choose your agent wisely. Every character has a unique playstyle:

| Agent | Active Ability (`TAB`) | Passive Trait |
| :--- | :--- | :--- |
| **🌪️ ZEPHYR** | **Tailwind**: Instantly skip 5 words. | 10+ word streak grants a speed multiplier. |
| **🔥 PYRA** | **Rewrite**: Blurs an opponent's screen for 5s. | Lower penalty for typos. |
| **🛡️ SAGE** | **Foretold**: Protects your progress bar from effects. | Auto-corrects errors after a short delay. |
| **🐍 VIPER** | **Compound**: Scrambles upcoming words for an enemy. | Toxin aura affects nearby racers. |
| **🌑 OMEN** | **Absence**: Redacts the next 10 words for an enemy. | Progress bar is hidden from opponents. |
| **💥 BIJLI** | **Fault Line**: Flashes an opponent's screen white. | Abilities charge faster after each use. |
| ** Empress KALI** | **Devour**: Jumps forward if you are currently leading. | Time bonus for every 15 correct words. |
| **🤖 YANTRA** | **Last Tuesday**: Locks an opponent's keyboard for 2s. | Places traps that freeze enemies. |

---

## 🎮 How to Play

1.  **Join the Lobby**: Enter a name and create or join a room.
2.  **Pick Your Agent**: Select an agent that fits your typing style.
3.  **Charge Your Ability**: Type accurately and quickly to build your ability charge. The more "Perfect" your typing is, the faster it charges.
4.  **Tactical Execution**: Press `TAB` to unleash your ability.
5.  **Finish the Race**: Be the first to complete the prompt to claim victory!

### 🔧 Room Configurations
Hosts can customize the experience:
- **Targeting**: Choose between `Random`, `Leader` (hits the player in 1st place), or `All` (Chaotic mode).
- **Ability Speed**: Set the charge rate to `Normal`, `Fast`, or `Slow`.

---

## 💡 The Philosophy: Tactical Typing

Typhöön was born from a simple question: *What if a typing racer played like a tactical hero shooter?* 

Standard typing racers are "Drag Races"—pure speed tests. Typhöön is a "Battlefield." Here is the design thinking behind our core mechanics:

### 1. Accuracy as "Recoil Control"
In shooters, spraying and praying leads to missed shots. In Typhöön, we treated **Accuracy** as your recoil management. 
- **The Thinking**: High accuracy doesn't just keep your speed up; it's the primary fuel for your **Ability Charge**. 
- **The Implementation**: The `calculateChargeIncrement` function in our engine exponentially rewards "Perfect Typing" (100% accuracy), forcing players to choose between raw speed and tactical utility.

### 2. Utility as "Visual Obstruction"
We wanted to translate "Flashes" and "Smokes" into a 2D text environment without making it unplayable.
- **The Thinking**: A "Flash" shouldn't just turn the screen white; it should disrupt the player's *rhythm*. 
- **The UI Logic**: We used a layered CSS engine. **BIJLI's Fault Line** applies a white-out with a long decay, while **OMEN's Absence** uses a blur-shadow overlay on upcoming words.

### 3. Movement as "Word Skipping"
In a typing game, "Movement" is your position in the text.
- **The Thinking**: How do you "Teleport" (Zephyr) or "Dash" forward? 
- **The Logic**: We implemented the `skipWords` callback. It doesn't just change a number; it cleanses the current input and "re-baselines" the typing engine instantly. This creates a sentir of "surging" forward, giving players a tangible reward for their aggressive playstyle.

### 4. High-Skill Gambits (Reyna's Design)
Reyna in Valorant is a "feast or famine" agent. We wanted her to feel the same.
- **The Thinking**: Her **Devour** shouldn't be a free win; it should be a "Skill-Check."
- **The Mechanic**: Her ability only triggers if her real-time WPM is higher than everyone else's. It's a "win-more" mechanic that rewards dominant players, staying true to her character's lore.

### 2. The Math: Ability Charge Calculation
The rate at which your ability charges is not fixed. It is a live calculation that rewards peak performance.

The formula used in `lib/gameEngine.ts` is:
```typescript
ChargeRate = (CurrentWPM / 60) * (CurrentAccuracy / 100) * AgentModifier
Increment = (ChargeRate / BaseFillTime) * DeltaTime
```

**Variables Explained:**
- **CurrentWPM**: Your speed over the last few seconds. 60 WPM is the baseline.
- **CurrentAccuracy**: Every typo reduces your charge rate multiplier. 100% accuracy provides a 1.0x bonus.
- **AgentModifier**: Each agent has a balance-specific rate. (e.g., Zephyr = 1.4x, Killjoy = 0.7x).
- **BaseFillTime**: Set to **8 seconds**. This means if you type a steady 60 WPM at 100% accuracy, your ability will be ready in exactly 8 seconds.

---

## 🏗️ Technical Architecture

Typhöön's core is built using a highly decoupled, hook-based architecture that separates game logic from the UI. This ensures low-latency reflex-based gameplay while maintaining perfect synchronization across all clients.

### 1. 🧠 Core Game Engine (`useTyping.ts`)
The `useTyping` hook is the "heartbeat" of the game. It handles:
- **Input Sanitization**: Specifically prevents leading spaces and handles backspaces efficiently.
- **Word Progress**: Only advances words upon a correct match followed by a space (standard competitive racer logic).
- **Metric Calculation**: Real-time WPM, Accuracy, and Progress calculation.
- **`skipWords` Mechanic**: A specialized callback that allows abilities like **Tailwind** and **Devour** to jump forward without manual input.

### 2. ⚡ The Ability System (`useAbility.ts`)
This hook calculates **Ability Charge** based on "Perfect Typing" performance:
- **Dynamic Charging**: The faster you type accurately, the faster your charge bar fills.
- **Configurable Modifiers**: Each agent has a custom `chargeRateModifier`. Zephyr (Initiator) charges 40% faster than Killjoy (Sentinel).
- **Targeting Logic**: Logic to resolve `leader`, `random`, or `all` targeting modes before pushing updates to the database.
  - **The Implementation**:
    - **Leader**: Sorts the `opponents` array by `progress` in descending order and selects the first element: `[[...opponents].sort((a, b) => b.progress - a.progress)[0]]`.
    - **Random**: Uses `Math.floor(Math.random() * opponents.length)` to hit a random victim.
    - **All**: Broadcasts the `effectUpdate` across the entire `opponents` list simultaneously.
  - **Atomic Multi-Path Updates**: To ensure high performance and prevent "partial hits," we build a single `updates` object containing all target paths and push it in one atomic network request via Firebase's `update(ref(db), updates)`.

### 3. ☁️ Real-Time State Management (Firebase)
Typhöön uses **Firebase Realtime Database** as a reactive global state:
- **Lobby Sync**: Players, readiness, and agent selections are synchronized in milliseconds.
- **Effect Pipeline**: When Player A flashes Player B, a state change for Player B is pushed to Firebase. Player B's local `usePlayer` hook detects this change and instantly triggers the `EffectOverlay`.
- **Progress Broadcasting**: Only the necessary deltas (progress %, WPM) are broadcasted to minimize bandwidth and latency.

### 4. 🖼️ Reactive UI Layer
- **`TypingInput.tsx`**: A performance-optimized component using standard HTML inputs for better mobile/accessibility support, with a layered CSS/SVG visual engine.
- **`EffectOverlay.tsx`**: A "Layer 2" component that renders full-screen visual distortions (Flash, Blur, Nearsight) without interrupting the typing flow.
- **`AbilityBar.tsx`**: A reactive status bar that visualizes charge and cooldown states with high-contrast neon aesthetics.

---

## 🎨 Design Patterns

- **Separation of Concerns**: UI components are "dumb" and only render based on props provided by hooks.
- **Optimistic Updates**: Basic typing feedback is handled locally for zero-latency feel, while overall progress is debounced/synced to the server.
- **Conditional Styling**: High-contrast modes for specific agents (like Pyra's error highlighting) are implemented via modular prop checks.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router, TSX)
- **Realtime**: [Firebase Realtime Database](https://firebase.google.com/docs/database)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18.x or later
- A Firebase project with Realtime Database enabled

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/prasanna192005/not-my-type-valorant.git
   cd not-my-type-valorant
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by [Prasanna](https://github.com/prasanna192005)
