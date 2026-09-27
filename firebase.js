// ================================
// DG SISTEMAS - LIGA GOLD
// Configuração do Firebase
// ================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALqVvvuOaDNKRCgxA5JGYADDbFqwX4IT8",
  authDomain: "liga-gold.firebaseapp.com",
  projectId: "liga-gold",
  storageBucket: "liga-gold.firebasestorage.app",
  messagingSenderId: "106325735032",
  appId: "1:106325735032:web:0ef332d43790a608c09f8d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
