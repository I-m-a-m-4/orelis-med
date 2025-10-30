import { initializeApp, getApps, App, getApp, ServiceAccount, credential } from 'firebase-admin/app';

// Use a global variable to cache the admin app instance to avoid re-initialization.
// This is a common pattern in serverless environments.
let adminApp: App;

export async function initializeAdminApp(): Promise<App> {
  // Check if the app is already initialized
  if (getApps().length > 0) {
    // getApp() returns the default app if no name is provided
    return getApp();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    // Initialize the default app
    return initializeApp({
      credential: credential.cert(serviceAccount),
    });
  } catch (e: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT or initialize app', e);
    throw new Error('Firebase Admin initialization failed. Ensure FIREBASE_SERVICE_ACCOUNT is a valid JSON string.');
  }
}
