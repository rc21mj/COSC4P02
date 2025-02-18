import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PreferencesForm from "./PreferencesForm";
import FirebaseAuthUI from "./FirebaseAuthUI";
function App() {
    return (
        <Router>
            <Routes>
				<Route path="/" element={<FirebaseAuthUI />} />
				<Route path="/login" element={<FirebaseAuthUI />} />
                <Route path="/dashboard" element={<PreferencesForm />} />
            </Routes>
        </Router>
    );
}

export default App;
