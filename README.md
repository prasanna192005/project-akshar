# 🪖 AKSHAR: Multiplayer Battle

[![Static Badge](https://img.shields.io/badge/Tactical-Typing-amber?style=for-the-badge)](https://github.com/prasanna192005/not-my-type-valorant)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Aesthetic](https://img.shields.io/badge/Aesthetic-Tactical_Industrial-amber?style=for-the-badge)](#)

**AKSHAR** is a high-stakes, competitive multiplayer typing racer set in a gritty industrial-tactical universe. Built for speed and precision, it blends the mechanical intensity of typing with the strategic depth of a hero shooter.

---

## 🚀 Mission Critical Features

- **Real-Time Combat**: Synchronized lobby system powered by Firebase Realtime Database with sub-100ms latency.
- **Operative Dashboard**: A dedicated **Command Center** to track your tactical stats (WPM, Accuracy, Level) and manage your operative profile.
- **Tactical System Protocols**: A consolidated hover-menu for seamless navigation through mission briefings, archives, and operative files.
- **Identity Enforcement**: Secure shared links that automatically pre-fill room codes while ensuring every operative is identified before entry.
- **Elite UI/UX**: A signature **Sand-Amber** industrial aesthetic featuring glassmorphism, micro-animations, and custom typography (Orbitron/Rajdhani).
- **Testing Range**: A standalone sandbox sector (`/test`) for mastering agent abilities and signature movements.

---

## 🎭 The Operatives

Select your handle. Master your protocols. Every agent brings a unique distortion to the battlefield.

| Operative | Tactical Ability (`TAB`) | Passive Protocol |
| :--- | :--- | :--- |
| **🌪️ VAYU** | **Slipstream**: Instantly warp forward 5 words. | 10+ word streak grants a terminal speed multiplier. |
| **🔥 AGNI** | **Rewrite**: Applies a burning blur to an opponent's vision. | Typos cost significantly less momentum (WPM). |
| **🛡️ SUTRA** | **Foretold**: Shields your progress from enemy targeting. | Ancient logic triggers slow auto-corrections on errors. |
| **🐍 VISHA** | **Compound**: Scrambles 3 upcoming words for an enemy. | Toxin aura warns when opponents are within 5 WPM. |
| **🌑 CHHAYA** | **Absence**: Redacts upcoming words, forcing blind typing. | Stealth protocol hides your progress from all rivals. |
| **💥 BIJLI** | **Fault Line**: Blashes an opponent's interface white. | Every ability use overclocks the next charge rate. |
| **🩸 KALI** | **Devour**: Every opponent typo moves them *backwards*. | Total dominance: 15 correct words grant a duration bonus. |
| **🤖 YANTRA** | **Last Tuesday**: Locks an opponent's keyboard for 2s. | Places hidden traps that freeze enemy progress bars. |

---

## 🛠️ How We Made This

AKSHAR was built by combining traditional typing mechanics with high-latency reactive networking.

- **The Vision**: We wanted to turn typing into a "Tactical Hero Shooter" experience.
- **The Execution**: Developed using **Next.js 15** for optimized performance and **Firebase Realtime Database** for sub-100ms cross-client communication.
- **The Aesthetic**: A custom **Sand & Amber** industrial theme carefully crafted using CSS variables, noise grain textures, and SVG-based forensic charting.

### 📜 Development Deep-Dive
For a detailed look at how each system was built, the errors we crushed, and our technical solutions, check out our **[Feature Documentation Archives](./docs/features/README.md)**.

---

## ⚙️ Tactical Architecture

AKSHAR is built on a stabilized hook-based engine designed for competitive integrity.

### 1. 🧠 The Engine (`useTyping.ts`)
The core processing unit handles real-time WPM calculation, accuracy tracking, and the atomic `skipWords` callback for movement abilities.

### 2. ⚡ Ability Synchronization (`useAbility.ts`)
Calculates **Ability Charge** exponentially based on "Perfect Typing" performance.
- **Targeting Matrix**: Advanced logic to resolve `leader`, `random`, or `all` targeting modes mid-race.
- **Payload Execution**: Atomic Firebase updates ensure that effects (Blurs, Flashes, Locks) are applied to opponents with zero race conditions.

### 3. 🛡️ Secure Uplink (Authentication)
Integrated Firebase Auth allows operatives to:
- **Link Google Accounts** for persistent profile tracking.
- **Level Up**: Earn experience through thermal precision and speed.
- **Custom Identity**: Manage operative handles and tactical avatars.

---

## 🛠️ Tech Stack

- **Core**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Neural Link**: [Firebase Realtime Database](https://firebase.google.com/docs/database)
- **Identity**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Visuals**: [Tailwind CSS](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Dynamics**: [Framer Motion](https://www.framer.com/motion/)

---

## 🏁 Deployment Protocol

### Prerequisites
- Node.js 18.x / 20.x
- Firebase Project (Auth + Realtime DB)

### Installation
1. Clone the sector:
   ```bash
   git clone https://github.com/prasanna192005/not-my-type-valorant.git
   cd not-my-type-valorant
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   # ... [Standard Firebase Config]
   ```
4. Initialize local uplink:
   ```bash
   npm run dev
   ```

---

## 📜 Sector Rules (MIT License)
Distributed under the MIT License. Tactical assets and lore are property of their respective creators.

**System established by [Prasanna](https://github.com/prasanna192005) // AKSHAR SYSTEMS**
