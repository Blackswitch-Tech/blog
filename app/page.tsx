"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/lib/firebase";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
}

const UserPage = () => {
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]); // State to store fetched blog posts

  // Fetch blog posts from Firestore on component mount
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts")); // Fetch data from "posts" collection
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        setBlogPosts(postsData); // Set fetched data to state
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };

    fetchBlogPosts();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter blog posts based on the search term
  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-gray-100">
      {/* Search Bar */}
      <div className="w-full max-w-4xl flex items-center mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 p-3 border rounded-full border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Blog Posts List */}
      <div className="w-full max-w-4xl space-y-8">
        {filteredPosts.map((post) => (
          console.log(post),
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Blog Post Image */}
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
              
            />
            {/* Blog Post Details */}
            <div className="p-6">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-500">{post.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
