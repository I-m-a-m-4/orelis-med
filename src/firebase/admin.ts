
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let adminApp: App;

export async function initializeAdminApp() {
  if (getApps().length > 0 && adminApp) {
    return adminApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }

  adminApp = initializeApp({
    credential: credential.cert(JSON.parse(serviceAccount)),
  });

  return adminApp;
}
