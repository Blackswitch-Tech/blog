import React from 'react';

const HomePage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to the Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder for blog cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Blog Post Title 1</h2>
          <p className="text-gray-700">This is a short summary of the blog post content...</p>
        </div>
        {/* Add more blog posts similarly */}
      </div>
    </div>
  );
};

export default HomePage;
