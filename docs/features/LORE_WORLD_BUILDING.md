# Tactical Deep-Dive: Lore & World Building

## How We Made It
The transition to **AKSHAR** involved creating a deep narrative layer to ground the tactical gameplay. We moved away from a "hero shooter" clone and towards an original Indian-tactical lore.

### 1. Narrative Architecture
We centralized the story in `lib/lore.ts`. Instead of just flavor text, the lore is used to drive the UI:
- **Agent Dossiers**: Each operative has a full backstory, origin coordinates (e.g., Jaisalmer), and a specific age.
- **Classification**: We used industrial headers ("CLASSIFIED", "EYES ONLY") to create an immersive "Tactical Archive" feel.

### 2. Cultural Integration
To give the project a unique identity, we infused it with Indian cultural elements:
- **Devanagari Script**: Integrated throughout the UI for "Decryption" effects and background atmosphere.
- **Naming Conventions**: Agents were rebranded with Sanskrit-inspired names (VAYU, AGNI, KALI) that reflect their abilities.

### 3. Interactive Storytelling
The `/lore` page was built as a multi-part interactive reader:
- **Sequential Navigation**: Users can move through "Files 01-08" chronologically.
- **Dynamic Theming**: The interface colors shift based on the current agent being viewed.

---

## Errors Faced

### 1. The "Lore Leak"
- **Error**: Even after writing the new lore, some pages were still displaying Valorant agent names in "Tips" or "Debug" menus.
- **Solution**: We performed a **Lore Audit** and replaced all hardcoded strings with a mapping system that pulls from `lib/agents.ts` and `lib/lore.ts` exclusively.

### 2. Text Overload
- **Error**: The full agent stories were too long for the mobile UI, causing massive scrolling and breaking the layout.
- **Solution**: Implemented a **Glassmorphic Scroll Area** with a floating navigation bar, ensuring that the "System Protocols" are always accessible even when reading deep files.

### 3. Devanagari Rendering
- **Error**: Some browsers were rendering the Devanagari script with incorrect spacing or "jumping" characters.
- **Solution**: Switched to a **Web Font Strategy**, explicitly loading the `Rajdhani` and `Orbitron` fonts from Google Fonts to ensure perfect alignment across all tactical displays.
