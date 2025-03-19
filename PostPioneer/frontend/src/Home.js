import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "./firebase-ui-auth.css";
import "./App.css";
import firebaseConfig from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function Home() {
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
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="bg-cover bg-center bg-no-repeat h-80 flex items-center justify-center relative"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=1200&q=80")`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to PostPioneer
          </h1>
          <p className="text-lg">Your AI-powered social media solution</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Sample Posts Section */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Explore Sample Posts
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              PostPioneer automatically curates engaging content for your brand.
              Here’s a sneak peek of what you can create:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sample Post #1 */}
              <div className="p-4 bg-gray-50 rounded shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Sample Post 1
                </h3>
                <p className="text-gray-600">
                  "Check out our latest product updates and how they can
                  revolutionize your social media strategy!"
                </p>
              </div>
              {/* Sample Post #2 */}
              <div className="p-4 bg-gray-50 rounded shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Sample Post 2
                </h3>
                <p className="text-gray-600">
                  "Join us for a live webinar on social media best practices,
                  featuring industry experts!"
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-[#0073b1] rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6">
              Sign up to start automating your social media content and watch
              your engagement soar!
            </p>

            {user ? (
              <a
                href="/post_generation"
                className="inline-block bg-white text-[#0073b1] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Generate a Post!
              </a>
            ) : (
              <a
                href="/Register"
                className="inline-block bg-white text-[#0073b1] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Sign Up
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
