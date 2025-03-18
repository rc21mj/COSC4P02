import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import "./firebase-ui-auth.css";
import "./App.css";
import firebaseConfig from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function Layout1({ children }) {
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
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
    window.location = "/login";
  };

  return (
    <>
      <header>
        <h1>Welcome to PostPioneer</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/how-it-works">How it Works</Link>
            </li>
            <li>
              <Link to="/support">Support Page</Link>
            </li>
            {user ? (
              <li>
                <Link to="/post_generation">Generate a Post!</Link>
              </li>
            ) : null}
            {user ? (
              <li>
                <Link to="/payment">Payment Plan</Link>
              </li>
            ) : null}
            {user ? (
              <li>
                <Link to="/settings">Settings</Link>
              </li>
            ) : null}
            {user ? (
              <li class="signOutButton">
                <Link
                  to="/home"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                >
                  Sign out
                </Link>
              </li>
            ) : (
              <li>
                <Link to="/login">User Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <div className="content">{children}</div>

      <footer>
        <p>&copy; 2025 PostPioneer. All rights reserved.</p>
      </footer>
    </>
  );
}

export default Layout1;
