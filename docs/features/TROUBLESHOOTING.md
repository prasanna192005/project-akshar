# Tactical Deep-Dive: Field Troubleshooting (Bug Log)

## The War Stories
Building AKSHAR was a series of tactical skirmishes against technical debt and race conditions. This log records the most critical failures and how we neutralized them.

### 1. The "Stuck at GO" (Countdown Hang)
- **Error**: The game countdown would hit "GO" or "0" but the race wouldn't start.
- **Problem**: We were relying solely on a client-side timer. If the host's tab was inactive (backgrounded), the timer would pause, preventing the server update.
- **Solution**: Implemented **Host-Side Fail-safes**. The host now pushes a `raceStartAt` timestamp to Firebase. All clients calculate the countdown relative to that server time. Even if the host's tab sleeps, the first client to reach the timestamp triggers the "racing" status.

### 2. The "Invisible Redirect" (Shared Link Loop)
- **Error**: Clicking a shared link took users to a room, and then immediately bounced them to the Home page with a "Loading" screen flash.
- **Problem**: The Lobby page checked for a name, found it missing, and redirected. But our `Suspense` fallback was a full-screen loading spinner, making the flow feel "broken."
- **Solution**: Created **Silent Buffering**. We modified the Lobby page to return `null` while checking for a redirect. This makes the transition from link to Home page feel like a single, seamless action.

### 3. The "Rules of Hooks" Crash
- **Error**: `Rendered more hooks than during previous render.`
- **Problem**: We were using an early `return <LoadingScreen />` in the `Game` component. When loading finished, the next render would call 18 new hooks from the typing engine, which React forbids.
- **Solution**: **Hook Normalization**. We moved all custom hooks to the very top of the file, above all returns. We used "Safe Fallback" data to allow the hooks to initialize even while the room data was still null.

### 4. Hydration Mismatch (Background Jitter)
- **Error**: The background Devanagari characters would "jump" or change positions 1 second after the page loaded.
- **Problem**: Next.js was rendering one set of random positions on the server and a different set on the client.
- **Solution**: Implemented a **Mounted Guard**. We used a `mounted` state toggle inside `useEffect`. The random elements are now strictly client-side, ensuring the server and client start from the same (empty) state before spawning.

### 5. Multi-Tab Collision
- **Error**: Opening two rooms in different tabs would cause both tabs to sync to the same room.
- **Problem**: We were storing the `roomId` in `localStorage`, which is shared across all tabs of the same origin.
- **Solution**: Migrated critical session data to `sessionStorage`. This ensures that every tab maintains its own unique operative context and room connection.

### 6. The "Results Page" Null Reference
- **Error**: The Results page would crash if the host left the room first.
- **Problem**: The UI was trying to read `room.hostId` to display the "Winner" crown, but if the room was deleted or changed, `room` became null.
- **Solution**: Implemented **Data Persistence on Finish**. When a race ends, we take a "Snapshot" of the results and store them in a separate Firebase path that persists even if the original room is volatile.
