# Firebase Setup Guide

This guide will help you set up Firebase authentication and Firestore for The Bottom Tick application.

## Prerequisites

- A Google account
- Node.js installed on your machine
- The Bottom Tick project cloned locally

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `the-bottom-tick` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Add Web App to Firebase Project

1. In your Firebase project console, click the web icon (`</>`) to add a web app
2. Register app with nickname: `the-bottom-tick-web`
3. **Don't** set up Firebase Hosting for now
4. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env.local`
2. Fill in the Firebase configuration values from Step 2:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 4: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" sign-in provider
5. Add your domain to authorized domains (for production)

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in "test mode" (we'll secure it later)
4. Choose a location close to your users
5. Click "Done"

## Step 6: Configure Firestore Security Rules

1. In Firestore console, go to "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own watchlists
    match /watchlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Test the Setup

1. Run the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/landing`
3. Try signing in with Google
4. Check if the account page loads at `http://localhost:3000/account`

## Database Structure

The application uses the following Firestore collections:

### Users Collection (`/users/{uid}`)
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subscription: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
  };
  watchlists: {
    growth: string[];  // Array of ticker symbols
    decline: string[]; // Array of ticker symbols
  };
}
```

### Watchlists Collection (`/watchlists/{uid}`)
```typescript
{
  growth: WatchlistItem[];
  decline: WatchlistItem[];
}

interface WatchlistItem {
  ticker: string;
  addedAt: Timestamp;
  type: 'growth' | 'decline';
}
```

## Storage Recommendation

**For watchlists, we recommend using Firestore** because:

1. **Real-time updates**: Users can see their watchlists update in real-time
2. **Offline support**: Firestore caches data locally for offline access
3. **Scalability**: Can handle millions of users and watchlist items
4. **Security**: Row-level security with Firebase Auth integration
5. **Querying**: Easy to query and filter watchlist items
6. **Cost-effective**: Generous free tier, pay-per-use pricing

Alternative storage options considered:
- **Firebase Realtime Database**: Good for real-time, but less structured
- **Firebase Storage**: For file storage, not suitable for structured data
- **Local Storage**: Limited storage, no cross-device sync
- **External Database**: More complex setup, additional costs

## Next Steps

1. Set up the Firebase project following this guide
2. Test authentication with Google sign-in
3. Implement watchlist functionality in the ticker components
4. Add subscription management (future feature)
5. Set up production security rules
6. Configure Firebase hosting (optional)

## Troubleshooting

### Common Issues:

1. **"Firebase not configured"**: Check that `.env.local` exists and has correct values
2. **"Auth domain not authorized"**: Add your domain to Firebase Auth settings
3. **"Permission denied"**: Check Firestore security rules
4. **"User not found"**: Ensure user profile is created after sign-in

### Environment Variables Not Working:
- Ensure `.env.local` is in project root
- Restart development server after changing environment variables
- Check that all variables start with `NEXT_PUBLIC_`

For additional help, check the [Firebase Documentation](https://firebase.google.com/docs) or open an issue in the project repository.
