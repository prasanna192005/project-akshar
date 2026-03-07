# Tactical Deep-Dive: Typing Engine Mechanics

## How We Made It
The AKSHAR typing engine is designed for competitive precision. It uses a custom hook-based system (`useTyping.ts`) to handle high-frequency input without UI lag.

### 1. Word-by-Word Enforcement
Unlike simple text areas, our engine enforces strict word-by-word progress:
- **Synchronization**: The engine splits the prompt into a `words` array.
- **Advance Trigger**: A word only advances when the `currentInput` matches the `targetWord` AND the user presses the `Space` key.
- **Completion**: The final word triggers completion upon a perfect character match (no space required).

### 2. Metrics & Math
We calculate performance in real-time to fuel the Ability System:
- **WPM (Words Per Minute)**: Calculated as `(CorrectChars / 5) / (ElapsedMinutes)`. We use "Standard Words" (5 chars per word) to ensure fair scaling across different prompt lengths.
- **Accuracy**: Calculated as `(CorrectKeyStrokes / TotalTypedChars) * 100`. Every backspace counts as an error in the "Total" to penalize messy typing.

### 3. Visual Decryption Layer
To maintain the "Amber Tactical" aesthetic, we implemented a layered feedback system:
- **Correct Base**: Characters turn amber as they are typed correctly.
- **Error Highlight**: Errors trigger a high-contrast background pulse.
- **Decryption Effect**: We use a custom CSS animation that "flickers" characters between scrambled Devanagari and English letters as the user approaches them, giving the sense of "decoding" the data.

---

## Errors Faced

### 1. The "Trailing Space" Trap
- **Error**: Users would occasionally type a space at the end of the final word, which the engine didn't expect, preventing them from finishing the race.
- **Solution**: Implemented a "Completion Guard" in `handleInput` that explicitly checks if the current word is the last one and allows completion even if a trailing space is accidentally entered.

### 2. Cursor Jumping
- **Error**: In early versions, using the `Backspace` key would occasionally cause the browser cursor to "jump" to the start of the word.
- **Solution**: Switched from a controlled `<textarea>` to a hidden controlled `<input>` that mirrors its value to the highly-styled visual display. This keeps the browser's native caret logic stable.

### 3. The "Stuck" Bug
- **Error**: If a user typed a correct word but the server hadn't confirmed the previous word's progress, the local engine would "hang."
- **Solution**: Implemented **Optimistic Progression**. The local engine advances instantly, while a background "Sync Buffer" handles the Firebase handshake, ensuring zero latency for the typist.
