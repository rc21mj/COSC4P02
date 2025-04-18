import React, { useState, useEffect } from "react";
import axios from "axios";
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import {useNavigate } from "react-router-dom";
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
    customHashtags: "",
	  userid: "failedSet"
  });
  const navigate = useNavigate();
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
  const [previewImage, setPreviewImage] = useState("");
  const [customImageEnabled, setCustomImageEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
	if (isSubmitting) return; // Prevent duplicate requests
	setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:5000/submit", formData);
      //setMessage(response.data.message);
	    //setImage(response.data.image);
      const generatedText = response.data.message;
      const generatedImage = response.data.image;

      // Navigate to EditPost with generated data
      navigate("/editPosting", { state: { text: generatedText, image: generatedImage } });
    } catch (error) {
      setMessage("Error submitting preferences.");
    } finally {
    setIsSubmitting(false);
	}
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prevData => ({
          ...prevData,
          customImageBase64: base64String
        }));
        setPreviewImage(base64String); // <-- new line to set preview
      };
      reader.readAsDataURL(file);
    }
  };
/** */
  return (
    <div style={{padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Generate a Post</h1>
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
    <label style={{ fontWeight: "bold" }}>Add Custom Image:</label>
    <select
      name="customImageEnabled"
      value={customImageEnabled ? "true" : "false"}
      onChange={(e) => setCustomImageEnabled(e.target.value === "true")}
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    >
      <option value="false">false</option>
      <option value="true">true</option>
    </select>
        {customImageEnabled && (
          <div style={{ marginBottom: "10px" }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ width: "100%", padding: "10px" }}
            />
          </div>
        )}
        
      <label style={{ fontWeight: "bold" }}>Add Your Own Hashtags (optional):</label>
        <input
          type="text"
          name="customHashtags"
          value={formData.customHashtags}
          onChange={handleChange}
          placeholder="#example #yourtags"
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
