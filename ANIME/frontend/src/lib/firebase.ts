import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyApIdMy3nHx64BOziS1SRLfwTWnYOAV-xk',
  authDomain: 'anime-c9350.firebaseapp.com',
  projectId: 'anime-c9350',
  storageBucket: 'anime-c9350.firebasestorage.app',
  messagingSenderId: '250217353685',
  appId: '1:250217353685:web:6de16e008e40c1f5366d5c',
  measurementId: 'G-DE789MPCZ1',
}

export const firebaseApp = initializeApp(firebaseConfig)

export async function setupFirebaseAnalytics() {
  if (typeof window === 'undefined') {
    return null
  }

  const supported = await isSupported()
  if (!supported) {
    return null
  }

  return getAnalytics(firebaseApp)
}
