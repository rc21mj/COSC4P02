import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const auth = getAuth();

// Simple regex for email and password strength
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Minimum eight characters, at least one letter and one number

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Client-side validation
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password should be at least 8 characters long and include at least one letter and one number."
      );
      return;
    }

    setError(""); // Clear any previous errors

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up successfully
        const user = userCredential.user;
        console.log("User registered:", user);

        // Redirect to How It Works page
        navigate("/how-it-works");
      })
      .catch((error) => {
        console.error("Error during registration:", error.code, error.message);

        // Handle Firebase-specific errors
        switch (error.code) {
          case "auth/email-already-in-use":
            setError(
              "This email is already in use. Try logging in or use another email."
            );
            break;
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;
          case "auth/weak-password":
            setError(
              "The password is too weak. Please choose a stronger password."
            );
            break;
          default:
            setError(error.message);
        }
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Create an Account
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Get started with PostPioneer and supercharge your social media
          presence!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
          </div>

          {/* Display error message if any */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#0073b1] text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          >
            Create an account
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?
          <a href="/login" className="text-[#0073b1] hover:underline ml-1">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
