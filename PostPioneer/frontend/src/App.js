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
import Settings from "./Settings";
import About from "./About";
import HowitWorks from "./HowitWorks";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Router>
      <Layout1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<FirebaseAuthUI />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/post_generation" element={<PreferencesForm />} />
          <Route path="/how-it-works" element={<HowitWorks />} />
          <Route path="/support" element={<SupportForm />} />
          <Route path="/payment" element={<TestMigration />} />
          <Route path="/posting" element={<TwitterPosting />} />
          <Route path="/editPosting" element={<EditPosting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout1>
    </Router>
  );
}

export default App;
