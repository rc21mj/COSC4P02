import React from "react";
import { useState, useEffect } from "react";

function Base() {
  return (
    <>
      <header>
        <h1>Welcome to PostPioneer</h1>
        <nav>
          <ul>
            <li>
              <a href="{{ url_for('index') }}">Home</a>
            </li>
            <li>
              <a href="{{ url_for('about') }}">About</a>
            </li>
            <li>
              <a href="{{ url_for('how_it_works') }}">How it Works</a>
            </li>
            <li>
              <a href="{{ url_for('sample_posts') }}">Sample Posts</a>
            </li>
            <li>
              <a href="{{ url_for('user_login') }}">User Login</a>
            </li>
          </ul>
        </nav>
      </header>

      <div class="content">{/* {% block content %}{% endblock %} */}</div>

      <footer>
        <p>&copy; 2025 PostPioneer. All rights reserved.</p>
      </footer>

      <script src="{{ url_for('static', filename='js/scripts.js') }}"></script>
    </>
  );
}

export default Base;
