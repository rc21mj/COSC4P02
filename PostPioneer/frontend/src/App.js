import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PreferencesForm from "./PreferencesForm";
import FirebaseAuthUI from "./FirebaseAuthUI";
import SupportForm from "./SupportForm";
import TestMigration from "./TestMigration";
import TwitterPosting from "./Posting";
import Home from "./Home";
import Layout1 from "./Layout1"; // Import the Layout1 component
import "./App.css";
import EditPosting from "./EditPosting";

function App() {
  return (
    <Router>
      <Layout1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<FirebaseAuthUI />} />
          <Route path="/post_generation" element={<PreferencesForm />} />
          <Route path="/support" element={<SupportForm />} />
          <Route path="/payment" element={<TestMigration />} />
          <Route path="/posting" element={<TwitterPosting />} />
          <Route path="/editing" element={<EditPosting />} />
        </Routes>
      </Layout1>
    </Router>
  );
}

export default App;
