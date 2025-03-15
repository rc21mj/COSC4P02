import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PreferencesForm from "./PreferencesForm";
import FirebaseAuthUI from "./FirebaseAuthUI";
import SupportForm from "./SupportForm";
import TestMigration from "./TestMigration";
import TwitterPosting from "./Posting";
import Home from "./Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<FirebaseAuthUI />} />
        <Route path="/post_generation" element={<PreferencesForm />} />
        <Route path="/support" element={<SupportForm />} />
        <Route path="/payment" element={<TestMigration />} />
        <Route path="/posting" element={<TwitterPosting />} />
        
      </Routes>
    </Router>
  );
}

export default App;
