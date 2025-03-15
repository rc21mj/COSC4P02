import React, { useState, useEffect } from "react";
import axios from "axios";
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const EditPosting = () => {
  const [post, setPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("guest");

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUserId(user ? user.uid : "guest");
    });
  }, []);

  useEffect(() => {
    const fetchGeneratedPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getPost?userId=${userId}`);
        setPost(response.data.generatedPost);
      } catch (error) {
        setMessage("Error fetching the generated post.");
      }
    };

    if (userId !== "guest") {
      fetchGeneratedPost();
    }
  }, [userId]);

  const handleChange = (e) => {
    setPost(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);
    
    try {
      const response = await axios.post("http://localhost:3000/post", {
        userId,
        editedPost: post,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error submitting the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "Courier, monospace", backgroundColor: "#f4f4f4", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Edit Your Post</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <label style={{ fontWeight: "bold" }}>Generated Post:</label>
        <textarea
          value={post}
          onChange={handleChange}
          rows="6"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", fontFamily: "Courier, monospace" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none" }}>
          Submit Edited Post
        </button>
        {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
      </form>
    </div>
  );
};

export default EditPosting;
