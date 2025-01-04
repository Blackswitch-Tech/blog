"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  content: string;
}

const UserPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        setBlogPosts(postsData);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };

    fetchBlogPosts();
  }, []);

  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full p-3 border rounded-full border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-8"
        />

        {/* Blog Posts */}
        <div className="grid gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <Link href={`/blog/${post.id}`}>
                <div className="relative w-full h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="cursor-pointer"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.date}</p>
                  <p
                    className="mt-2 text-gray-700 overflow-hidden text-ellipsis"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3, // Limits to 3 lines
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {post.content.slice(0, 100)}...
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
