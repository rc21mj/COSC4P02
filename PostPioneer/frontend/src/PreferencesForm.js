import React, { useState, useEffect } from "react";
import axios from "axios";
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const PreferencesForm = () => {

  const [formData, setFormData] = useState({
    tone: "formal",
    topic: "",
    schedule: "daily",
    edit: "false",
	language: "english",
	userid: "failedSet"
  });
  //set userID
  React.useEffect(() => {
	firebase.auth().onAuthStateChanged(function(user) {
	setFormData(prevData => ({
	...prevData,
	userid: user ? user.uid : "guest",
	}));
	});
  },[]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
	if (isSubmitting) return; // Prevent duplicate requests
	setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:3000/submit", formData);
      setMessage(response.data.message);
      setImage(response.data.image);
      // Redirect to the edit page with postID as query parameter
      const postID = response.data.postID; // Assuming you return postID from backend
      history.push(/edit-post/${postID});
    } catch (error) {
      setMessage("Error submitting preferences.");
    } finally {
    setIsSubmitting(false);
	}
  };
  

  return (
    <div style={{ fontFamily: "Courier, monospace", backgroundColor: "#ebf1f2", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Choose Your Preferences</h1>
      <form 
        onSubmit={handleSubmit}
        style={{
          maxWidth: "500px",
          margin: "auto",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <label style={{ fontWeight: "bold" }}>Select Tone:</label>
        <select name="tone" value={formData.tone} onChange={handleChange} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
          <option value="formal">Formal</option>
          <option value="educational">Educational</option>
          <option value="comedic">Comedic</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
        </select>

        <label style={{ fontWeight: "bold" }}>Enter Topic:</label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="Type your topic..."
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <label style={{ fontWeight: "bold" }}>Select Schedule:</label>
        <select name="schedule" value={formData.schedule} onChange={handleChange} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="biweekly">Biweekly</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <label style={{ fontWeight: "bold" }}>Review & Edit Post before Posting:</label>
        <select name="edit" value={formData.edit} onChange={handleChange} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
		<label style={{ fontWeight: "bold" }}>Language</label>
        <input
          type="text"
          name="language"
          value={formData.language}
          onChange={handleChange}
          placeholder="Type your language..."
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />


        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "white", border: "none" }}>
          Submit Preferences
        </button>

        {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
		{image && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h3>Generated Image:</h3>
            <img src={image} alt="Generated" style={{ width: "100%", maxHeight: "400px", borderRadius: "8px" }} />
          </div>
        )}
      </form>
    </div>
  );
};

export default PreferencesForm;
