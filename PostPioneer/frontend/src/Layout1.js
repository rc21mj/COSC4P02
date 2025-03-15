import React from "react";
import { Link } from "react-router-dom";

function Layout1({ children }) {
  return (
    <>
      <header>
        <h1>Welcome to PostPioneer</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/how-it-works">How it Works</Link>
            </li>
            <li>
              <Link to="/sample-posts">Sample Posts</Link>
            </li>
            <li>
              <Link to="/login">User Login</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className="content">{children}</div>

      <footer>
        <p>&copy; 2025 PostPioneer. All rights reserved.</p>
      </footer>
    </>
  );
}

export default Layout1;
