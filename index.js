// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

async function main() {
  // Firebase project configuration object
  const firebaseConfig = {
    apiKey: 'AIzaSyCywO9Y1dImuqux0QnlT-rv7bw-SQ-qtwg',
    authDomain: 'fir-amazing-web-codelab.firebaseapp.com',
    projectId: 'fir-amazing-web-codelab',
    storageBucket: 'fir-amazing-web-codelab.appspot.com',
    messagingSenderId: '231934865284',
    appId: '1:231934865284:web:8a975b8aa8c843f5be77d1',
    measurementId: 'G-1MTC0FZB1K'
  };

  // Initialize App
  firebase.initializeApp(firebaseConfig);

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      }
    }
  };
  /*
  // Sign in Google -- not sure if it works
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  firebase.auth().useDeviceLanguage();*/

  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  /*startRsvpButton.addEventListener('click', () => {
    ui.start('#firebaseui-auth-container', uiConfig);
  });*/
  startRsvpButton.addEventListener('click', () => {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut(); // User is signed in; allows user to sign out
    } else {
      ui.start('#firebaseui-auth-container', uiConfig); // No user is signed in; allows user to sign in
    }
  });

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      guestbookContainer.style.display = 'block';
    } else {
      startRsvpButton.textContent = 'Login';
      guestbookContainer.style.display = 'none';
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    firebase
      .firestore()
      .collection('guestbook')
      .add({
        text: input.value,
        timestamp: Date.now(),
        name: firebase.auth().currentUser.displayName,
        userId: firebase.auth().currentUser.uid
      });
    input.value = '';
    return false;
  });
}
main();
