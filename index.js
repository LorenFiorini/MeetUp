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
      subscribeGuestbook();
      subscribeCurrentRSVP(user);
    } else {
      startRsvpButton.textContent = 'Login';
      guestbookContainer.style.display = 'none';
      unsubscribeGuestbook();
      unsubscribeCurrentRSVP();
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

  function subscribeGuestbook() {
    guestbookListener = firebase
      .firestore()
      .collection('guestbook')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snaps => {
        guestbook.innerHTML = '';
        snaps.forEach(doc => {
          const entry = document.createElement('p');
          entry.textContent = doc.data().name + ': ' + doc.data().text;
          guestbook.appendChild(entry);
        });
      });
  }

  function unsubscribeGuestbook() {
    if (guestbookListener != null) {
      guestbookListener();
      guestbookListener = null;
    }
  }

  // Record attendees
  rsvpYes.onclick = () => {
    const userDoc = firebase
      .firestore()
      .collection('attendees')
      .doc(firebase.auth().currentUser.uid);
    userDoc
      .set({
        attending: true
      })
      .catch(console.error);
  };

  rsvpNo.onclick = () => {
    const userDoc = firebase
      .firestore()
      .collection('attendees')
      .doc(firebase.auth().currentUser.uid);
    userDoc
      .set({
        attending: false
      })
      .catch(console.error);
  };

  firebase
    .firestore()
    .collection('attendees')
    .where('attending', '==', true)
    .onSnapshot(snap => {
      const newAttendeeCount = snap.docs.length;

      numberAttending.innerHTML = newAttendeeCount + ' people going';
    });

  function subscribeCurrentRSVP(user) {
    rsvpListener = firebase
      .firestore()
      .collection('attendees')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc && doc.data()) {
          const attendingResponse = doc.data().attending;
          // Update css classes for buttons
          if (attendingResponse) {
            rsvpYes.className = 'clicked';
            rsvpNo.className = '';
          } else {
            rsvpYes.className = '';
            rsvpNo.className = 'clicked';
          }
        }
      });
  }

  function unsubscribeCurrentRSVP() {
    if (rsvpListener != null) {
      rsvpListener();
      rsvpListener = null;
    }
    rsvpYes.className = '';
    rsvpNo.className = '';
  }
}
main();
