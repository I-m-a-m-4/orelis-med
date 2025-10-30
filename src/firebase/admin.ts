
import { initializeApp, getApps, App, getApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

const ADMIN_APP_NAME = 'firebase-admin-app-aic';

let adminApp: App;

export async function initializeAdminApp() {
  if (getApps().some(app => app.name === ADMIN_APP_NAME)) {
    return getApp(ADMIN_APP_NAME);
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }

  adminApp = initializeApp({
    credential: credential.cert(JSON.parse(serviceAccount)),
  }, ADMIN_APP_NAME);

  return adminApp;
}
