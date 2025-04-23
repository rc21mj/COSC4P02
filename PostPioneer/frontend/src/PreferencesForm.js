
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
	  userid: "failedSet",
    imageOption: "none"
  });
  const [uploadedImage, setUploadedImage] = useState(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsGenerating(true);
    setShowResults(true);
    
    try {
      const submitData = {
        ...formData,
        uploadedImage: formData.imageOption === 'upload' ? uploadedImage : null
      };
      const response = await axios.post("http://localhost:5000/submit", submitData);
      const newGeneratedText = response.data.message;
      const newGeneratedImage = formData.imageOption === 'generate' ? response.data.image : uploadedImage;
      
      setGeneratedText(newGeneratedText);
      setImage(newGeneratedImage);
      setMessage("Generation completed successfully!");
    } catch (error) {
      setMessage("Error during generation: " + error.message);
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };
  
/** */
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

        <label style={{ fontWeight: "bold" }}>Select Topic:</label>
        <select
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        >
          <option value="">-- Select a topic --</option>
          <option value="sports">Sports</option>
          <option value="news">News</option>
          <option value="business">Business</option>
          <option value="arts">Arts</option>
          <option value="travel">Travel</option>
        </select>

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

        <label style={{ fontWeight: "bold" }}>Image Option:</label>
        <select 
            name="imageOption" 
            value={formData.imageOption} 
            onChange={handleChange} 
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        >
            <option value="none">No Image</option>
            <option value="generate">Generate Image</option>
            <option value="upload">Upload Image</option>
        </select>

        {formData.imageOption === 'upload' && (
            <div style={{ marginBottom: "10px" }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ width: "100%", padding: "10px" }}
                />
                {uploadedImage && (
                    <img 
                        src={uploadedImage} 
                        alt="Uploaded preview" 
                        style={{ 
                            width: "100%", 
                            maxHeight: "200px", 
                            objectFit: "contain", 
                            marginTop: "10px" 
                        }} 
                    />
                )}
            </div>
        )}

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

      {showResults && (
        <div style={{
          maxWidth: "500px",
          margin: "20px auto",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ textAlign: "center", color: "#333" }}>Generated Content</h2>
          
          {isGenerating ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Generating content, please wait...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold" }}>Generated Text:</label>
                <textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  style={{
                    width: "100%",
                    height: "200px",
                    padding: "10px",
                    marginTop: "10px"
                  }}
                />
              </div>

              {image && (
                <div style={{ textAlign: "center" }}>
                  <h3>Generated/Uploaded Image:</h3>
                  <img
                    src={image}
                    alt="Post"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "8px"
                    }}
                  />
                </div>
              )}

              <button
                onClick={async () => {
                  try {
                    await axios.post("http://localhost:5000/hil_submit", {
                      userid: formData.userid,
                      generated_post: generatedText,
                      image: formData.imageOption !== 'none' ? image : null
                    });
                    setMessage("Post submitted successfully!");
                  } catch (error) {
                    setMessage("Error submitting post: " + error.message);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  marginTop: "20px"
                }}
              >
                Submit Final Post
              </button>
            </>
          )}
        </div>
      )}

      {message && <p style={{ color: "green", textAlign: "center", marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default PreferencesForm;
