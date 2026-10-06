import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWlvjmu76iIAY3pOIZLN_4Li64jShpAIg",
  authDomain: "mangtakyu-53c47.firebaseapp.com",
  projectId: "mangtakyu-53c47",
  storageBucket: "mangtakyu-53c47.firebasestorage.app",
  messagingSenderId: "344859196115",
  appId: "1:344859196115:web:1de37af72caa013b01b226"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };