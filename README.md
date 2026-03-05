# HKBU Buddy 🎓

> **A verified HKBU student app that matches you with buddies, plugs you into school events, and lets you post "need groupmates" requests – 100% school-focused.**

Built for the BUHACK DareToHack Hackathon.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Verified Sign-up** | HKBU email-only registration with nickname privacy |
| 🤝 **Buddy Matching** | AI-style matching via ≥70% shared interest overlap |
| 📅 **School Events** | Browse & RSVP to official + student-created events |
| 💬 **Community Feed** | Dcard-style posts for groupmates, lost & found, language exchange |
| 💌 **In-app Chat** | Real-time messaging with matched buddies |
| 🏆 **Gamification** | Points system (+10 match, +5 post, +20 RSVP) & leaderboard |

---

## 🛠 Tech Stack

- **Framework**: React Native (Expo) + TypeScript
- **Backend / DB**: Firebase (Auth + Firestore)
- **Navigation**: React Navigation v6
- **State**: React Context + Firebase real-time listeners

---

## 📱 App Flow

```
Welcome → Sign Up (nickname + HKBU email + interests + privacy consent)
                    ↓
              Main Screen
         ┌────────┼─────────┐
    Match Buddy  Events  Community
         │         │         │
       Chat     RSVP      Post/Like
                            │
                        Leaderboard
```

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- Expo CLI: `npm install -g expo-cli`
- Firebase project (see setup below)

### 1. Clone & Install

```bash
git clone https://github.com/ks-120/BUHACK-DareToHack.git
cd BUHACK-DareToHack/hkbu-app
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create a project
2. Enable **Email/Password** authentication
3. Enable **Firestore** in native mode
4. Copy your SDK config and paste it into `src/config/firebase.ts`

```ts
// src/config/firebase.ts
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 3. Run the App

```bash
# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
# Or press 'w' for web
```

---

## 📁 Project Structure

```
hkbu-app/
├── App.tsx                     # Entry point
├── src/
│   ├── config/
│   │   └── firebase.ts         # Firebase initialisation
│   ├── hooks/
│   │   └── useAuth.tsx         # Auth context & hook
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Stack navigator
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MainScreen.tsx
│   │   ├── MatchScreen.tsx
│   │   ├── EventsScreen.tsx
│   │   ├── FeedScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── LeaderboardScreen.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── utils/
│       └── constants.ts        # Interests, tags, colours
```

---

## 🔒 Privacy

- Only **nicknames** are shown to other users
- Real name and email are never exposed in the UI
- Privacy consent pop-up required at sign-up

---

## 🏅 Gamification

| Action | Points |
|--------|--------|
| View buddy matches | +10 pts |
| Create a post | +5 pts |
| RSVP to an event | +20 pts |

Top 10 users appear on the Leaderboard.
