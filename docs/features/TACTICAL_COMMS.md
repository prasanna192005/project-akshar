# Tactical Deep-Dive: Tactical Communications (Chat)

## How We Made It
Communication is key for squad formation. We built a low-latency, real-time `ChatBox` component integrated directly into the Lobby and Game environments.

### 1. Real-Time Messaging Pipeline
We used Firebase's `push()` and `onValue()` methods to create a streaming chat experience:
- **`useChat` Hook**: A specialized hook that manages the message state. It listens to the `rooms/[roomId]/chat` path and automatically updates the UI whenever a new message packet is detected.
- **Atomic Pushing**: Messages are sent with a `timestamp`, `senderName`, and `senderId` to ensure correct chronological ordering and identity display.

### 2. UI Integration
To match the **AKSHAR** theme, the chat box features:
- **Skeletal Industrial Design**: Uses the same wireframe borders and amber glow as the rest of the interface.
- **Smart Auto-scroll**: The message container automatically snaps to the latest Intel (bottom) unless the user has manually scrolled up to review previous comms.
- **Tactical Indicators**: System messages (like player entries/readiness updates) are styled with a distinct "Warning Yellow" to differentiate them from operative chatter.

### 3. Safety & Performance
- **Message Truncation**: To prevent memory leaks during long sessions, the `useChat` hook is configured to only keep the last 50 messages in the local state.
- **Input Guard**: The input field is automatically disabled while a message is "sending" to prevent accidental multi-posting during high latency.

---

## Errors Faced

### 1. The "Message Bounce"
- **Error**: In early versions, typing a message and hitting Enter would occasionally cause the same message to appear twice in the local UI.
- **Cause**: The local state update was fighting with the server-side broadcast, causing a duplicate render.
- **Solution**: Implemented **Server-Priority Rendering**. We removed the local optimistic update and let the Firebase listener handle all message rendering. Since Firebase Realtime DB is so fast, the latency is unnoticeable.

### 2. Keyboard Overlap (Mobile)
- **Error**: On mobile devices, the virtual keyboard would cover the chat input, making it impossible to see what you were typing.
- **Solution**: Used CSS `visualViewport` listeners to dynamically shift the `ChatBox` position whenever the keyboard is active, ensuring the input remains in the "Safe Zone."

### 3. Identity Disconnect
- **Error**: If a player changed their handle in the Dashboard while in a lobby, their previous chat messages would still show their old name.
- **Solution**: We modified the message schema to store only the `senderId`. The `ChatBox` component now cross-references these IDs with the live `players` list in the room to dynamically render the *current* handle for every message.
