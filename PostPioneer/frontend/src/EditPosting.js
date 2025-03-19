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
                navigate('/dashboard'); // Redirect to dashboard after successful post
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
        <div style={{ padding: "20px" }}>
            <h1>Edit Your Post</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                    style={{ width: "100%", height: "200px", padding: "10px" }}
                />
                {image && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <h3>Generated Image:</h3>
                        <img src={image} alt="Generated" style={{ width: "100%", maxHeight: "400px" }} />
                    </div>
                )}
                <button 
                    type="submit" 
                    style={{ 
                        width: "100%", 
                        padding: "10px", 
                        backgroundColor: "#007BFF", 
                        color: "white", 
                        border: "none" 
                    }}
                >
                    Submit Post
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default EditPost;