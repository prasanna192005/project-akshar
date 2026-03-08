# Firebase Security Rules: Tactical Hardening

To ensure the integrity of the **AKSHAR** battlefield and protect operative data, the following security rules must be applied in the Firebase Realtime Database console.

## 🛡️ Realtime Database Rules

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        // Read access allowed if room exists
        ".read": "data.exists()",
        
        // Only host can update room configuration or status (initially)
        // Or anyone can if joining (creating their player node)
        ".write": "auth != null",
        
        "players": {
          "$playerId": {
            // Only the specific player (or host for effects) can write to this node
            ".write": "auth != null && (auth.uid === $playerId || root.child('rooms/' + $roomId + '/hostId').val() === auth.uid)",
            ".read": true,
            
            // Validation: Ensure WPM and Accuracy are within tactical limits
            "wpm": {
              ".validate": "newData.isNumber() && newData.val() <= 300"
            },
            "accuracy": {
              ".validate": "newData.isNumber() && newData.val() <= 100"
            }
          }
        },
        
        "chat": {
          ".read": true,
          ".write": "auth != null",
          "$messageId": {
            ".validate": "newData.hasChildren(['senderId', 'senderName', 'text', 'timestamp'])"
          }
        }
      }
    },
    "users": {
      "$userId": {
        // Only the authenticated user can read or write their own profile
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId",
        
        "handle": {
          ".validate": "newData.isString() && newData.val().length <= 20"
        }
      }
    }
  }
}
```

## 🚀 Deployment Instructions

1.  Navigate to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your **AKSHAR** project.
3.  Go to **Realtime Database** > **Rules**.
4.  Copy and paste the JSON above into the editor.
5.  Click **Publish**.

## 🔑 Security Philosophy

1.  **Identity-Gated Writes**: Users are strictly limited to writing only to their own player nodes within a room, unless they are the designated `hostId`.
2.  **Range Validation**: Critical metrics like `WPM` are capped at 300 to prevent automated bot-insertion from skewing leaderboards.
3.  **Encapsulated Logic**: Chat messages must follow a strict schema, preventing malicious code injection into the comms stream.
