import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

const EditPost = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { text, image, platform } = location.state || { text: "", image: "", platform: "" };
    
    const [formData, setFormData] = useState({
        userid: "formal",
        text: text
    });
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set userID
    useEffect(() => {
        firebase.auth().onAuthStateChanged(function(user) {
            setFormData(prevData => ({
                ...prevData,
                userid: user ? user.uid : "guest",
            }));
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent duplicate requests
        setIsSubmitting(true);
        try {
            const response = await axios.post("http://localhost:5000/hil_submit", {
                userid: formData.userid,
                generated_post: formData.text
            });
            if (response.status === 200) {
                navigate('/post_generation'); // Redirect to dashboard after successful post
            } else {
                setMessage("Error submitting post.");
            }
        } catch (error) {
            setMessage("Error submitting post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#E2E4E6] font-inter py-12 px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-[#1E1E1E]">
              Edit Your Post
            </h1>
      
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Editable Text */}
              <textarea
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="w-full h-48 border border-gray-300 rounded-md p-4 text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
              />
      
              {/* Generated Image */}
              {image && (
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-poppins font-semibold text-[#1E1E1E]">
                    Generated Image:
                  </h3>
                  <img
                    src={image}
                    alt="Generated"
                    className="mx-auto w-full max-w-md rounded-md shadow-md"
                  />
                </div>
              )}
      
              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-[#00B4D8] text-white font-poppins font-semibold rounded-md hover:bg-[#0099C1] transition"
              >
                Submit Post
              </button>
            </form>
      
            {/* Feedback */}
            {message && (
              <p className="text-green-600 text-center mt-4">{message}</p>
            )}
          </div>
        </div>
      );
            }

export default EditPost;