/**
 * firebaseClient.js — Inicialización del SDK de Firebase.
 * Las credenciales vienen de variables de entorno VITE_FIREBASE_*.
 * Ver FIREBASE-SETUP.md para instrucciones de configuración.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore }  from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

/**
 * Inicia sesión anónima en Firebase Auth.
 * Devuelve el UID único del usuario anónimo.
 * Si ya hay sesión activa, la reutiliza.
 */
export async function ensureAnonymousAuth() {
  if (auth.currentUser) return auth.currentUser.uid;
  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

export default app;
