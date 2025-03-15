import React from 'react';
import { useState, useEffect } from "react";

import firebase from 'firebase/compat/app';
import { getAuth, signOut, deleteUser } from "firebase/auth";
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';
import firebaseConfig from './firebaseConfig';
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
function Settings() {
	const [user, setUser] = useState(null);
  React.useEffect(() => {
	firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		setUser(user);
		console.log("user already signed in:", user.email);
	} else {
		console.log("user not signed in");
	}
	});
	
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
	<h1>Settings</h1>
		<div>
		{user ? (
		 <div>
		 <ul>
			<li><button onClick={handleSignOut}>Sign out</button></li>
			<li><button onClick={handleDeleteAccount}>Delete account</button></li>
		</ul>
		</div>
      ) : null}
		</div>
    </div>
  );
}
export default Settings;
