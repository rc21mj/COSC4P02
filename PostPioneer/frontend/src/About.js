import React from "react";

const About = () => {
  return (
    <div className="about-container">
      <h1>About PostPioneer</h1>
      <p>
        PostPioneer is a revolutionary social media content generator designed to
        help users create engaging and relevant posts effortlessly. Our platform
        leverages advanced algorithms to suggest content ideas, optimize post
        timing, and enhance user engagement.
      </p>

      <h2>Features</h2>
      <ul>
        <li>
          Content Suggestions: Get tailored post ideas based on your interests and
          audience.
        </li>
        <li>
          Scheduling: Plan your posts in advance to maximize reach and engagement.
        </li>
        <li>
          Analytics: Track the performance of your posts and refine your strategy.
        </li>
        <li>
          User-Friendly Interface: Easy to navigate and use, even for beginners.
        </li>
      </ul>

      <h2>Join Us</h2>
      <p>
        Become a part of the PostPioneer community and take your social media
        presence to the next level!
      </p>
      <p>
        <a href="/user_login">Login</a> or{" "}
        <a href="/register">Register Now!</a>
      </p>
    </div>
  );
};

export default About;