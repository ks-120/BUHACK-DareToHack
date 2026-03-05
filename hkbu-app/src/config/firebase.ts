import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey ?? 'YOUR_API_KEY',
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain ?? 'YOUR_AUTH_DOMAIN',
  projectId: Constants.expoConfig?.extra?.firebaseProjectId ?? 'YOUR_PROJECT_ID',
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket ?? 'YOUR_STORAGE_BUCKET',
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId ?? 'YOUR_MESSAGING_SENDER_ID',
  appId: Constants.expoConfig?.extra?.firebaseAppId ?? 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
