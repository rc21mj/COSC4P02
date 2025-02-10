import logo from './logo.svg';
import React from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';

function App() {
 const firebaseConfig = {
	 // removed for security
 };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
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
	  ]
	});
  },[]);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
		<h1>Login to Post Pioneer</h1>
		<div id="firebaseui-auth-container"></div>
      </header>
    </div>
  );
}

export default App;
