# Frontend Integration Guide: Email Automation Backend

This guide provides a comprehensive overview of how to integrate and use the Email Automation backend logic effectively in your frontend application.

---

## 🚀 Getting Started

The backend is built with Express.js and uses MongoDB for storage. It integrates with Gmail via OAuth2 and provides real-time updates through Socket.io.

**Base URL**: `http://localhost:5000` (or your deployed backend URL)

---

## 🔐 Authentication (Gmail OAuth2)

Logging in and connecting a Gmail account follows a specific flow:

### 1. Generate Auth URL
Redirect the user to the Google Consent screen.
- **Endpoint**: `GET /api/gmail/auth`
- **Query Parameters**:
  - `orgName` (optional): Used to construct a default `returnUrl`.
  - `returnUrl` (optional): Where to redirect after successful auth.
  - `syncPeriod` (optional): `7`, `30`, `90`, or `everything` (default: `30`).
  - `inboxCategories` (optional): Comma-separated categories (e.g., `primary, promotions`).
- **Response**: `{ "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }`

### 2. Handling the Redirect
The backend handles the callback and redirects the user back to your `returnUrl` with a `googleId` query parameter.
- **URL Pattern**: `FRONTEND_URL?googleId=USER_GOOGLE_ID`
- **Action**: Store this `googleId` in `localStorage` or your state management library. It is required for all subsequent API calls.

### 3. Verification
Check if a user is still connected and get their profile info.
- **Endpoint**: `GET /api/gmail/status?googleId=USER_GOOGLE_ID`
- **Response**:
  ```json
  {
    "connected": true,
    "profileImage": "https://...",
    "email": "user@gmail.com"
  }
  ```

---

## 📧 Email Management

All email endpoints require the `googleId` either in the `x-google-id` header (recommended) or as a query parameter.

### 1. Fetching Emails (Folder View)
- **Endpoint**: `GET /api/gmail/emails`
- **Query Parameters**:
  - `folder`: `inbox` (default), `sent`, `trash`, `archive`, `all`.
  - `page`: Page number (default: `1`).
  - `maxResults`: Items per page (default: `25`).
- **Response**: Includes an `emails` array and a `pagination` object.

### 2. Fetching Specific Content
- **Single Email**: `GET /api/gmail/emails/:messageId`
- **Full Thread**: `GET /api/gmail/threads/:threadId` (Returns all messages in the conversation).

### 3. Modifying Emails
Perform actions like archiving or marking as read.
- **Endpoint**: `POST /api/gmail/modify/:messageId`
- **Body**: `{ "action": "mark_read" | "mark_unread" | "archive" | "trash" }`

---

## 📤 Sending Emails

### 1. New Email
- **Endpoint**: `POST /api/gmail/send`
- **Body**:
  ```json
  {
    "to": "recipient@example.com",
    "subject": "Hello World",
    "body": "<h1>Html content is supported</h1>",
    "cc": "cc@example.com",
    "bcc": "bcc@example.com"
  }
  ```

### 2. Replying to a Thread
- **Endpoint**: `POST /api/gmail/emails/:messageId/reply`
- **Body**: Same as send, but `subject` and `to` are automatically handled if omitted.

---

## 🤖 AI Features (Google Gemini)

Generate professional replies based on the email content.
- **Endpoint**: `POST /api/ai/generate-reply`
- **Body**:
  ```json
  {
    "emailContext": "The content of the email you are replying to",
    "tone": "professional" | "friendly" | "concise" | "helpful"
  }
  ```
- **Response**: `{ "reply": "Generated text..." }`

---

## ⚡ Real-Time Synchronization (Socket.io)

The backend uses Webhooks to detect new emails and notifies the frontend immediately.

### 1. Setup
Connect to the socket server and register the current user.
```javascript
import { io } from "socket.io-client";

const socket = io(BACKEND_URL);

// Must call this after login
socket.emit('register', userGoogleId);

// Listen for new emails
socket.on('new_emails', (data) => {
  console.log(`Received ${data.count} new emails`);
  // Trigger a refresh or show a notification
});
```

---

## 📊 Data Structures

### Email Object
```typescript
interface Email {
  messageId: string;
  threadId: string;
  subject: string;
  sender: { name: string; email: string };
  receiver: string;
  date: string; // ISO String
  snippet: string; // Short preview text
  body: string; // Full HTML body
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
}
```

---

## 🛠️ Best Practices

1. **Authentication State**: Always verify connectivity via `/status` on app mount.
2. **Infinite Scroll**: Use the `pagination` metadata from `/emails` to implement smooth scrolling.
3. **HTML Sanitization**: The `body` field contains raw HTML from Gmail. Always use a library like `DOMPurify` before rendering it in your React/Vue components.
4. **Optimistic Updates**: When marking an email as read or archiving, update the local state immediately before the API call finishes for a "snappy" feel.
5. **Caching**: Utilize the `threadId` to group messages in your UI, similar to how the Gmail web app works.
