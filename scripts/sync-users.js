/**
 * Nexa User Sync Utility
 * ----------------------
 * This script fetches all users from Firebase Authentication and 
 * creates/updates their records in Firestore so they appear on the Admin Dashboard.
 * 
 * Usage:
 * 1. Ensure serviceAccountKey.json is in the root directory.
 * 2. Run: npm install firebase-admin
 * 3. Run: node scripts/sync-users.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load Service Account
const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('\u001b[31mError: serviceAccountKey.json not found in the root directory.\u001b[0m');
  console.log('Please follow the instructions in the implementation plan to download your key.');
  process.exit(1);
}

// Initialize Admin SDK
const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
admin.initializeApp({
  credential: admin.credential.cert({
    ...serviceAccount,
    private_key: formattedPrivateKey
  })
});

const db = admin.firestore();
const auth = admin.auth();

async function syncUsers() {
  console.log('\u001b[34mStarting user synchronization...\u001b[0m');
  
  try {
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users;
    console.log(`Found ${users.length} users in Firebase Authentication.`);

    const batch = db.batch();
    let count = 0;

    for (const user of users) {
      const userRef = db.collection('users').doc(user.uid);
      
      // We only update if fields are missing to preserve existing analytics
      // But we ensure email and join date are there
      const userData = {
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        createdAt: new Date(user.metadata.creationTime).getTime(),
        lastActive: new Date(user.metadata.lastRefreshTime || user.metadata.creationTime).getTime()
      };

      // Set with merge: true to avoid overwriting existing interests/bookmarks
      batch.set(userRef, userData, { merge: true });
      count++;

      // Firestore batches are limited to 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed ${count} users...`);
      }
    }

    if (count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`\u001b[32mSuccessfully synchronized ${count} users to Firestore!\u001b[0m`);
    console.log('You can now check your Admin Dashboard.');
    
  } catch (error) {
    console.error('\u001b[31mSynchronization failed:\u001b[0m', error);
  }
}

syncUsers().then(() => process.exit());
