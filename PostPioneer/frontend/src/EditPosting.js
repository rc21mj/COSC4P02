import React from "react";
import { useLocation } from "react-router-dom";

const EditPost = () => {
    const location = useLocation();
    const { text, image } = location.state || { text: "", image: "" };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Edit Your Post</h1>
            <textarea
                value={text}
                style={{ width: "100%", height: "200px", padding: "10px" }}
            />
            {image && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <h3>Generated Image:</h3>
                    <img src={image} alt="Generated" style={{ width: "100%", maxHeight: "400px" }} />
                </div>
            )}
        </div>
    );
};

export default EditPost;
