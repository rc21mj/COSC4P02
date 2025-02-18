import React from 'react';
import firebase from 'firebase/compat/app';
import { getAuth, signOut, deleteUser } from "firebase/auth";
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';
import './firebase-ui-auth.css'
import firebaseConfig from './firebaseConfig';
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
function FirebaseAuthUI() {
  React.useEffect(() => {
	firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		console.log("user already signed in:", user.email);
	} else {
		console.log("user not signed in");
	}
	});
	
  },[]);
  React.useEffect(() => {
	let ui = firebaseui.auth.AuthUI.getInstance();
	if(!ui){
		ui =
		new firebaseui.auth.AuthUI(firebase.auth());
	}
	ui.start('#firebaseui-auth-container', {
	  signInOptions: [
		{
		  provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
		  requireDisplayName: false
		},
		{
		  provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		  requireDisplayName: false
		}
	  ],
	  callbacks:{
		  signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          console.log("Signed in with result: ", authResult);
          window.location.href = "/dashboard";
	  }
	 }
	});
	return () => {
      ui.reset();
	};
  },[]);
  const handleSignOut = () => {
	const auth = getAuth();
	signOut(auth).then(() => {
		console.log("User signed out.");
	}).catch((error) => {
		console.error("Sign out error:", error);
	});
	window.location = '/login'
  };
  const handleDeleteAccount = () => {
	const auth = getAuth();
	const user = auth.currentUser;
	deleteUser(user).then(() => {
		console.log("User deleted.");
	}).catch((error) => {
		console.error("Failed to delete current user:", error);
	});
	window.location = '/login'
  };
  return (
    <div className="App">
      <header className="App-header">
		<div id="firebaseui-auth-container"></div>
		<div>
		<button onClick={handleSignOut}>Sign out</button>
		<button onClick={handleDeleteAccount}>Delete account</button>
		</div>
      </header>
    </div>
  );
}

export default FirebaseAuthUI;
