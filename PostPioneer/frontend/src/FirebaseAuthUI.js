import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import "./firebase-ui-auth.css";
import firebaseConfig from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function FirebaseAuthUI() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        setUser(user);
        console.log("user already signed in:", user.email);
      } else {
        console.log("user not signed in");
      }
    });
  }, []);

  useEffect(() => {
    let ui = firebaseui.auth.AuthUI.getInstance();
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth());
    }
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
        // {
        //   provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //   requireDisplayName: false,
        // },
      ],
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          console.log("Signed in with result: ", authResult);
          window.location.href = "/dashboard";
        },
      },
    });
    return () => {
      ui.reset();
    };
  }, []);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User signed out.");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
    window.location = "/login";
  };

  const handleDeleteAccount = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    deleteUser(user)
      .then(() => {
        console.log("User deleted.");
      })
      .catch((error) => {
        console.error("Failed to delete current user:", error);
      });
    window.location = "/login";
  };

  return (
    <main>
      <h2>User Login</h2>

      <div id="firebaseui-auth-container"></div>
    </main>
  );
}

export default FirebaseAuthUI;
