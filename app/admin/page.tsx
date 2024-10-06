"use client";

import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import icons

const AdminPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      date: "26/09/2024",
      image: "/images/blog-image-1.jpg", // Replace with your image path
    },
    {
      id: 2,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      date: "26/09/2024",
      image: "/images/blog-image-2.jpg", // Replace with your image path
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-gray-100">
      {/* Search Bar and Profile */}
      <div className="w-full max-w-4xl flex items-center mb-8">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 p-3 border rounded-full border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="ml-4">
          <img
            src="/images/profile-icon.jpg" // Replace with your profile image path
            alt="Admin Profile"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="w-full max-w-4xl space-y-8">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Blog Post Image */}
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            {/* Blog Post Details */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex space-x-4 text-gray-700">
                <button className="flex items-center space-x-1 hover:text-red-600">
                  <FaTrash /> {/* Delete Icon */}
                  <span>Delete</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <FaEdit /> {/* Edit Icon */}
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
