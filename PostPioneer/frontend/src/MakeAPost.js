import React, { useState, useEffect } from "react";
import axios from "axios";
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import {useNavigate } from "react-router-dom";
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const MakeAPost = () => {

  const [formData, setFormData] = useState({
    tone: "formal",
    topic: "dancing",
    schedule: "daily",
    edit: "false",
    language: "English",
    customHashtags: "",
    userid: "failedSet",
    customImageOption: "none", // New field for image option
    customImageBase64: "" // Field for uploaded image (if applicable)
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDots, setLoadingDots] = useState(".");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Used for loading animation dots
  useEffect(() => {
    let interval;
  if (isSubmitting) {
    setLoadingDots("."); // Reset at the beginning
    interval = setInterval(() => {
      setLoadingDots(prev => (prev.length >= 3 ? "." : prev + "."));
    }, 400);
  }
  return () => {
    clearInterval(interval);
  };
}, [isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  if (isSubmitting) return; // Prevent duplicate requests

  setIsSubmitting(true);
  setLoadingDots(".");        // Reset loading dots

    try {
      const response = await axios.post("http://localhost:5000/submit", formData);
      //setMessage(response.data.message);
      //setImage(response.data.image);
      const generatedText = response.data.message;
      //const generatedImage = response.data.image;
      let generatedImage = response.data.image;

    // Use uploaded image if "upload" is selected
      if (formData.customImageOption === "upload") {
        generatedImage = formData.customImageBase64; // Use uploaded image
      }
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
  <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#E2E4E6] font-inter flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-8 space-y-6"
      >
        <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-[#1E1E1E] text-center">
          Generate a Post
        </h1>

        {/* Select Tone */}
        <div>
          <label htmlFor="tone" className="block text-base font-medium text-[#1E1E1E] mb-2">
            Select Tone:
          </label>
          <select
            id="tone"
            name="tone"
            value={formData.tone}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
          >
            <option value="formal">Formal</option>
            <option value="educational">Educational</option>
            <option value="comedic">Comedic</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        {/* Select Topic */}
        <div>
          <label htmlFor="topic" className="block text-base font-medium text-[#1E1E1E] mb-2">
            Select Topic:
          </label>
          <select
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
          >
             <option value="sports">Sports</option>
            <option value="news">News</option>
            <option value="business">Business</option>
            <option value="arts">Arts</option>
            <option value="travel">Travel</option>
          </select>
        </div>

        {/* Select Schedule */}
        <div>
          <label htmlFor="schedule" className="block text-base font-medium text-[#1E1E1E] mb-2">
            Select Schedule:
          </label>
          <select
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="biweekly">Biweekly</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-base font-medium text-[#1E1E1E] mb-2">
            Language
          </label>
          <input
            id="language"
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="Type your language..."
            required
            className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
          />
        </div>

        {/* Custom Image Toggle */}
        <div>
          <label htmlFor="customImageOption" className="block text-base font-medium text-[#1E1E1E] mb-2">
            Add Image:
          </label>
          <select
            id="customImageOption"
            name="customImageOption"
            value={formData.customImageOption}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
          >
            <option value="none">None</option>
            <option value="upload">Upload</option>
            <option value="generate">Generate</option>
          </select>
        </div>

        {formData.customImageOption === "upload" && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:bg-[#E2E4E6] file:text-[#1E1E1E]
                         hover:file:bg-[#D1D4D6]"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 w-full max-h-64 object-contain rounded-md"
              />
            )}
          </div>
        )}

        {/* Custom Hashtags */}
        <div>
          <label htmlFor="customHashtags" className="block text-base font-medium text-[#1E1E1E] mb-2">
            Add Your Own Hashtags (optional):
          </label>
          <input
            id="customHashtags"
            type="text"
            name="customHashtags"
            value={formData.customHashtags}
            onChange={handleChange}
            placeholder="#example #yourtags"
            className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            //disabled={isSubmitting}
            className="w-full py-3 bg-[#00B4D8] text-white font-poppins font-semibold rounded-md hover:bg-[#0099C1] transition"
          >
            {isSubmitting ? `Generating post${loadingDots}` : "Submit"}
          </button>
        </div>

        {/* Feedback */}
        {message && (
          <p className="text-green-600 text-center mt-4">{message}</p>
        )}

        {image && (
          <div className="mt-6 text-center">
            <h3 className="font-poppins font-semibold text-lg text-[#1E1E1E] mb-2">
              Generated Image:
            </h3>
            <img
              src={image}
              alt="Generated"
              className="mx-auto w-full max-h-64 object-contain rounded-md"
            />
          </div>
        )}
      </form>
    </div>
  </div>
);
};

export default MakeAPost;
