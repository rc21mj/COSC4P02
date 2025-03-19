import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase if not already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function Settings() {
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

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User signed out.");
        window.location = "/login";
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const handleAddLinkedIn = () => {
    window.location.href = `http://localhost:5000/linkedin_login?user_id=${user.uid}`;
  };

  const handleRemoveLinkedIn = () => {
    window.location.href = `http://localhost:5000/remove_linkedin?user_id=${user.uid}`;
  };

  const handleAddTwitter = () => {
    window.location.href = `http://localhost:5000/twitter_login?user_id=${user.uid}`;
  };

  const handleRemoveTwitter = () => {
    window.location.href = `http://localhost:5000/remove_twitter?user_id=${user.uid}`;
  };

  const handleDeleteAccount = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    deleteUser(currentUser)
      .then(() => {
        console.log("User deleted.");
        window.location = "/login";
      })
      .catch((error) => {
        console.error("Failed to delete current user:", error);
      });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
          <p className="text-gray-600">
            You are not signed in. Please{" "}
            <a href="/login" className="text-blue-600 underline">
              log in
            </a>{" "}
            to view your settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Account Settings
        </h2>
        <p className="text-gray-600 mb-6 text-center leading-relaxed">
          Manage your social media integrations and account details below.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleAddLinkedIn}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Add LinkedIn
          </button>
          <button
            onClick={handleRemoveLinkedIn}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Remove LinkedIn
          </button>
          <button
            onClick={handleAddTwitter}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Add Twitter
          </button>
          <button
            onClick={handleRemoveTwitter}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Remove Twitter
          </button>
          <button
            onClick={handleSignOut}
            className="w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded-md 
                       hover:bg-gray-600 transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            Sign Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md 
                       hover:bg-red-700 transition-colors focus:outline-none 
                       focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
