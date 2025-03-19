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

function About() {
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
      {/* 2) Main Content Container */}
      <main className="flex-1 bg-gray-100 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* About Content in a Card */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              About PostPioneer
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              PostPioneer is a revolutionary social media content generator
              designed to help users create engaging and relevant posts
              effortlessly. Our platform leverages advanced algorithms to
              suggest content ideas, optimize post timing, and enhance user
              engagement.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Features
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Content Suggestions:</strong> Get tailored post ideas
                based on your interests and audience.
              </li>
              <li>
                <strong>Scheduling:</strong> Plan your posts in advance to
                maximize reach and engagement.
              </li>
              <li>
                <strong>Analytics:</strong> Track the performance of your posts
                and refine your strategy.
              </li>
              <li>
                <strong>User-Friendly Interface:</strong> Easy to navigate and
                use, even for beginners.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Join Us
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              Become a part of the PostPioneer community and take your social
              media presence to the next level!
            </p>
            <p className="text-gray-700">
              <a
                href="/login"
                className="text-[#0073b1] hover:underline font-medium mr-1"
              >
                Login
              </a>
              or
              <a
                href="/register"
                className="text-[#0073b1] hover:underline font-medium ml-1"
              >
                Register Now!
              </a>
            </p>
          </div>

          {/* 3) Why Choose Us? Section */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Why Choose PostPioneer?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-12 h-12 text-[#0073b1] mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v18m9-9H3"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  AI-Powered
                </h3>
                <p className="text-gray-600">
                  Harness cutting-edge AI to generate engaging, relevant content
                  for your audience.
                </p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-12 h-12 text-[#0073b1] mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Time-Saving
                </h3>
                <p className="text-gray-600">
                  Automate post creation and scheduling so you can focus on what
                  you do best.
                </p>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-12 h-12 text-[#0073b1] mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3v18h18V3H3z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Insights &amp; Analytics
                </h3>
                <p className="text-gray-600">
                  Track your engagement and refine your strategy with real-time
                  data.
                </p>
              </div>
            </div>
          </div>

          {/* 4) CTA Section */}
          <div className="bg-[#0073b1] rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Transform Your Social Media Strategy?
            </h2>
            <p className="mb-6">
              Sign up today and discover how PostPioneer can help you grow your
              online presence with ease.
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
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
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

export default About;
