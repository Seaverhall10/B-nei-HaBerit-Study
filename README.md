# Bnei HaBerit Study

Vanilla JS participant site for a 12-week Bible study. Google sign-in. Firestore progress. Firebase Hosting. Teacher notes live on teacher.html and are not linked from index.html.

## How Seaver finishes Firebase

1. Create a Firebase project at console.firebase.google.com and register a web app.
2. Enable Authentication, Google provider. Create a Firestore database.
3. Copy public/firebase-config.example.js to public/firebase-config.js and paste the web config values.
4. Add authorized domains: localhost plus your Hosting domain. firebase login and point .firebaserc at the project.
5. Run firebase deploy (hosting + firestore.rules). Sign in on the live URL and confirm checkboxes survive a refresh.

Until config is real, checkboxes save in localStorage.

Edit Week 2 in public/weeks.json anytime and redeploy.
