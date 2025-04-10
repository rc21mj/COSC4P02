import React from "react";

const analyticsData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 200 },
  { name: "May", value: 350 },
];

const userPosts = [
  { id: 1, title: "My First Post", content: "This is the content of the first post." },
  { id: 2, title: "Another Post", content: "Here's some more content in another post." },
  { id: 3, title: "Latest Update", content: "Latest post update with insights." },
];

export default function Dashboard() {
  return (
    <div className="p-4 grid gap-4 grid-cols-1 lg:grid-cols-3">
      {/* User Posts Section */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">User Posts</h1>
        {userPosts.map((post) => (
          <div key={post.id} className="mb-4">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-600">{post.content}</p>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <ul className="text-sm text-gray-700">
          {analyticsData.map((item, index) => (
            <li key={index} className="mb-2">
              <strong>{item.name}:</strong> {item.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
