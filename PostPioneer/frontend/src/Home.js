import React from "react";

const Home = () => {
  return (
    <div className="home-page">
      <header>
        <h1>Welcome to My Website</h1>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section>
          <h2>Post Pioneer</h2>
          <p>Post Pioneer home page - containing sample posts, about page.</p>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 My Website. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default Home;
