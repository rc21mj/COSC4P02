import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "./firebase-ui-auth.css";
import "./App.css";
import firebaseConfig from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function HowItWorks() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      console.log(user);
      if (user) {
        setUser(user);
        console.log("user already signed in:", user.email);
      } else {
        console.log("user not signed in");
      }
    });
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="bg-cover bg-center bg-no-repeat pt-16 pb-16 flex items-center justify-center relative"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1573496799822-b0557c9e2f41?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            How PostPioneer Works
          </h1>
          <p className="text-lg mb-8">
            Simplify your social media content creation process in just a few
            steps!
          </p>

          {/* Mini Steps / Quick Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Item 1 */}
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-white mb-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-3-3v6m-8 2a9 9 0 1118 0 9 9 0 01-18 0z"
                />
              </svg>
              <p className="font-semibold">Sign Up</p>
              <p className="text-sm">
                Create an account to unlock all features.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-white mb-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405C20.837 15.158 21 14.605 21 14c0-3.314-2.686-6-6-6-1.71 0-3.247.758-4.311 1.958L9 10v1l1 .75m0 0l-1 2m1-2l2 1.5"
                />
              </svg>
              <p className="font-semibold">Link Accounts</p>
              <p className="text-sm">
                Connect your social media for automated posting.
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-white mb-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2m4 2H4"
                />
              </svg>
              <p className="font-semibold">Schedule &amp; Post</p>
              <p className="text-sm">
                Generate, edit, and schedule content in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Steps Card */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Getting Started
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              PostPioneer is designed to simplify your social media content
              creation process. Follow these steps to get started:
            </p>

            <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
              <li>
                <strong>Sign Up:</strong> Create an account to access basic
                features of PostPioneer.
              </li>
              <li>
                <strong>Connect Your Social Media:</strong> Link your social
                media accounts to allow PostPioneer to post on your behalf.
              </li>
              <li>
                <strong>Generate Content:</strong> Use our content generator to
                create engaging posts tailored to your audience.
              </li>
              <li>
                <strong>Review and Edit:</strong> Review the generated content
                and make any necessary edits before posting.
              </li>
              <li>
                <strong>Schedule or Post:</strong> Choose to post immediately or
                schedule your content for a later time.
              </li>
            </ol>

            <p className="text-gray-700 leading-relaxed">
              With PostPioneer, creating and managing your social media content
              has never been easier!
            </p>
          </div>

          {/* Optional CTA Section */}
          <div className="bg-[#0073b1] rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Creating Engaging Content?
            </h2>
            <p className="mb-6">
              Sign up or connect your social media accounts to let PostPioneer
              do the work for you!
            </p>
            {user ? (
              <a
                href="/post_generation"
                className="inline-block bg-white text-[#0073b1] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </a>
            ) : (
              <a
                href="/register"
                className="inline-block bg-white text-[#0073b1] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HowItWorks;
