import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PreferencesForm from "./PreferencesForm";
import FirebaseAuthUI from "./FirebaseAuthUI";
import SupportForm from "./SupportForm";
import TestMigration from "./TestMigration";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirebaseAuthUI />} />
        <Route path="/login" element={<FirebaseAuthUI />} />
        <Route path="/dashboard" element={<PreferencesForm />} />
        <Route path="/support" element={<SupportForm />} />
        <Route path="/test" element={<TestMigration />} />
      </Routes>
    </Router>
  );
}

export default App;
