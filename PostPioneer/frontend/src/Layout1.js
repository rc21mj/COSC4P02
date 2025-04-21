import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import "firebase/compat/auth";
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
    window.location = "/Home";
  };

  return (
  <>
    <header className="bg-[#0D1B2A] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav>
          <ul className="flex justify-center space-x-10 font-inter text-lg">
            <li>
              <Link
                to="/"
                className="hover:text-[#00D9D4] transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="hover:text-[#00D9D4] transition-colors"
              >
                Dashboard
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link
                    to="/post_generation"
                    className="hover:text-[#00D9D4] transition-colors"
                  >
                    Generate a Post!
                  </Link>
                </li>
                <li>
                  <Link
                    to="/payment"
                    className="hover:text-[#00D9D4] transition-colors"
                  >
                    Payment Plan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="hover:text-[#00D9D4] transition-colors"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="hover:text-[#00D9D4] transition-colors"
                  >
                    Sign out
                  </button>
                </li>
              </>
            )}
            {!user && (
              <li>
                <Link
                  to="/login"
                  className="hover:text-[#00D9D4] transition-colors"
                >
                  User Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>

    <div className="content">{children}</div>

    <footer>
      {/* ...footer unchanged... */}
    </footer>
  </>
);
}

export default Layout1;
