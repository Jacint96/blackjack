import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBsc8XJ3kk8dKozRhMXrIwS_XBKho3fKUc",
    authDomain: "blackjack-c8ab6.firebaseapp.com",
    projectId: "blackjack-c8ab6",
    storageBucket: "blackjack-c8ab6.appspot.com",
    messagingSenderId: "849105990844",
    appId: "1:849105990844:web:84e36d89ff3ab377f28cb9"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
