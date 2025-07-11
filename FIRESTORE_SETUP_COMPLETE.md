# Complete Firebase & Firestore Setup Guide for User Profiles

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `the-bottom-tick` (or your preferred name)
4. **Optional:** Enable Google Analytics (recommended for production)
5. Click "Create project"

## Step 2: Add Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Register app:
   - App nickname: `the-bottom-tick-web`
   - **Check** "Also set up Firebase Hosting" (optional)
3. Click "Register app"
4. **Copy the Firebase configuration** - you'll need this for Step 4

## Step 3: Enable Authentication

1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click **"Google"** sign-in provider
5. Click **"Enable"** toggle
6. Add your email in **"Project support email"**
7. For **"Authorized domains"**, add:
   - `localhost` (for development)
   - Your production domain when ready
8. Click **"Save"**

## Step 4: Configure Environment Variables

1. In your project root, create `.env.local` file:

```bash
# Copy these values from Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**How to get these values:**
1. Go to Firebase Console > Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on your web app
4. Copy each value from the config object

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select a location (choose closest to your users):
   - `us-central1` (Iowa) - Good for US
   - `europe-west1` (Belgium) - Good for Europe
   - `asia-northeast1` (Tokyo) - Good for Asia
5. Click **"Done"**

## Step 6: Create Database Structure

The database will be automatically created when users sign up, but here's the structure:

### Collections:

#### 1. `users` collection
```
users/
├── {userId}/
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── subscription: object
│   │   ├── plan: "free" | "premium"
│   │   └── status: "active" | "cancelled" | "expired"
│   └── watchlists: object
│       ├── growth: array of ticker strings
│       └── decline: array of ticker strings
```

#### 2. `watchlists` collection (detailed watchlist items)
```
watchlists/
├── {userId}/
│   ├── growth: array of objects
│   │   ├── ticker: string
│   │   ├── addedAt: timestamp
│   │   └── type: "growth"
│   └── decline: array of objects
│       ├── ticker: string
│       ├── addedAt: timestamp
│       └── type: "decline"
```

## Step 7: Set Up Security Rules

1. In Firestore Console, go to **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own watchlists
    match /watchlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

## Step 8: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Open `http://localhost:3000`
3. You should be redirected to `/landing`
4. Click **"Continue with Google"**
5. Sign in with your Google account
6. You should be redirected to `/dashboard`
7. Check Firebase Console > Firestore Database - you should see your user profile created

## Step 9: Verify Data Structure

After signing in, check Firestore Console:

1. Go to **Firestore Database** > **Data** tab
2. You should see:
   - `users` collection with your user document
   - Your user ID as the document ID
   - All user profile fields populated

## Step 10: Test Watchlist Functionality

1. Go to `/search` page
2. Search for a stock (e.g., "AAPL")
3. Click **"+ Growth"** or **"+ Decline"** buttons
4. Go to `/dashboard` and check the watchlists section
5. Verify in Firestore Console that watchlist data is saved

## Common Issues & Solutions

### Issue 1: "Firebase not configured"
**Solution:** Check that `.env.local` exists in project root and contains all required variables

### Issue 2: "Auth domain not authorized"
**Solution:** 
1. Go to Firebase Console > Authentication > Settings
2. Add your domain to "Authorized domains"
3. For development, add `localhost`

### Issue 3: "Permission denied" when reading/writing data
**Solution:** 
1. Check that security rules are properly set
2. Ensure user is authenticated
3. Verify that the user ID matches the document path

### Issue 4: User profile not created
**Solution:**
1. Check browser console for errors
2. Verify that the `useUserProfile` hook is being called
3. Check that `firestoreService.createUserProfile` is working

### Issue 5: Environment variables not loading
**Solution:**
1. Ensure `.env.local` is in the project root (not in src/)
2. Restart the development server
3. Check that variables start with `NEXT_PUBLIC_`

## Database Schema Details

### User Profile Document Structure:
```typescript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://photo-url.com/image.jpg",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  subscription: {
    plan: "free",
    status: "active"
  },
  watchlists: {
    growth: ["AAPL", "GOOGL"],
    decline: ["XYZ", "ABC"]
  }
}
```

### Watchlist Document Structure:
```typescript
{
  growth: [
    {
      ticker: "AAPL",
      addedAt: Timestamp,
      type: "growth"
    }
  ],
  decline: [
    {
      ticker: "XYZ",
      addedAt: Timestamp,
      type: "decline"
    }
  ]
}
```

## Next Steps

1. **Complete the setup** following this guide
2. **Test authentication** by signing in
3. **Test watchlists** by adding stocks
4. **Check Firestore Console** to verify data is being saved
5. **Set up production security rules** before deploying

## Production Checklist

Before deploying to production:

- [ ] Update Firebase security rules for production
- [ ] Add production domain to Firebase Auth settings
- [ ] Set up Firebase hosting (optional)
- [ ] Configure environment variables in production
- [ ] Test all authentication flows
- [ ] Test all database operations
- [ ] Set up Firebase billing (if expecting high usage)

This setup will give you a complete authentication system with user profiles and watchlist functionality stored in Firestore!
