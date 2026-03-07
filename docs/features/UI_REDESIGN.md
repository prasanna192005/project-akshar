# Tactical Deep-Dive: Sand & Amber UI Redesign

## How We Made It
The transition from "Typhoon" to **AKSHAR** required a complete visual overhaul to move away from generic "hero shooter" aesthetics and towards a unique **Gritty Industrial-Tactical** look.

### 1. The Color Palette
We defined a central "Sand & Amber" palette in `globals.css` using HSL variables for maximum flexibility:
- **Amber**: `21 90% 48%` (The signature glow)
- **Deep Slate**: `210 22% 8%` (Background contrast)
- **Warning Yellow**: `48 95% 48%` (Strategic accents)

### 2. Texture & Atmosphere
To avoid a "flat" website feel, we implemented:
- **Noise Grain**: A fixed overlay using a base64-encoded SVG noise pattern to create a film-grain/tactical-display texture.
- **Falling Devanagari**: A subtle background animation using CSS keyframes that drops `अ`, `क`, `ष`, and `र` characters, reinforcing the Indian-tactical lore.
- **Decryption Effects**: Hover-based transitions that decrypt English text into Devanagari using CSS `::after` content.

### 3. Skeletal Components
We refactored standard buttons into **Skeletal/Wireframe** components. These use thin borders and clipped corners (`clip-path`) rather than rounded rectangles, mimicking industrial control panels.

---

## Errors Faced

### 1. The Layout "Warp"
- **Error**: When switching to skeletal buttons, the thin borders caused a 1px layout shift on hover, making the whole page "jitter."
- **Solution**: We implemented the "Invisible Border" technique, where buttons have a transparent border by default that simply changes color on hover, maintaining consistent dimensions.

### 2. Hydration Mismatches in Backgrounds
- **Error**: The Devanagari background was generating different random positions on the server vs. the client, causing a visual flash ("Hydration Mismatch") on load.
- **Solution**: We introduced a `mounted` state using `useEffect`. The random elements now only spawn once the component is mounted on the client, ensuring perfect visual stability.

### 3. Container Wrapping in Header
- **Error**: The tactical coordinates and system stats were wrapping awkwardly on smaller screens, breaking the "dashboard" feel.
- **Solution**: Switched to CSS Grid with `minmax` constraints and used `flex-nowrap` on critical telemetry data to force a professional, overflow-scrolling behavior instead of wrapping.
