import React, { useEffect } from "react";

function TwitterPosting() {
  useEffect(() => {
    document
      .getElementById("post-form")
      .addEventListener("submit", async function (event) {
        event.preventDefault();

        const post = document.getElementById("post").value;

        const response = await fetch("/2/tweets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post }),
        });

        const result = await response.json();
        console.log(result);
        alert(result.message);
      });
  }, []);

  return (
    <div className="bg-blue-600 text-white w-64 flex-shrink-0 h-full">
      <nav className="flex flex-col space-y-4 p-4">
        <a href="#" className="block px-3 py-2 rounded-lg hover:bg-blue-500">
          Home
        </a>
        <a
          href="SocialMediaLoginPage"
          className="block px-3 py-2 rounded-lg hover:bg-blue-500"
        >
          Store Credentials
        </a>
        <a
          href="ProPage"
          className="block px-3 py-2 rounded-lg hover:bg-blue-500"
        >
          Pro~
        </a>
        <a href="#" className="block px-3 py-2 rounded-lg hover:bg-blue-500">
          Settings
        </a>
        <a
          href="posting.html"
          className="block px-3 py-2 rounded-lg hover:bg-blue-500"
        >
          Post Page
        </a>
      </nav>

      <div id="main-content" className="flex-grow p-6">
        <div className="flex justify-center items-center h-full">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-xl font-semibold text-gray-700 mb-4">
              Make a post
            </h1>

            <form id="post-form" className="space-y-4">
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-600"
                >
                  Post
                </label>
                <input
                  type="text"
                  id="post"
                  name="post"
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your message"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwitterPosting;
