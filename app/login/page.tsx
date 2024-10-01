"use client";

import React, { useState } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login with", { username, password });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-0 bg-white overflow-hidden">
      {/* Container for the Corner Images */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right Image (Vector 1) */}
        <div className="absolute top-0 right-0 p-0">
          <img
            src="/images/Vector 1.png"
            alt="Decorative Vector 1"
            className="w-40 md:w-60 lg:w-80"
          />
        </div>

        {/* Bottom-right Image (Vector 2) */}
        <div className="absolute -bottom-10 right-0 p-0">
          <img
            src="/images/Vector 2.png"
            alt="Decorative Vector 2"
            className="w-16 md:w-24 lg:w-32"
          />
        </div>

        {/* Bottom-left Image (Vector 3) - Slightly Enlarged */}
        <div className="absolute -bottom-10 left-0 p-0">
          <img
            src="/images/Vector 3.png"
            alt="Decorative Vector 3"
            className="w-20 md:w-36 lg:w-48"
          />
        </div>
      </div>

      {/* Login form without a container box */}
      <div className="relative z-10 w-full max-w-md p-0">
        {/* Login heading */}
        <h2 className="text-5xl font-bold mb-16 text-center" style={{ color: '#000080' }}>
          LOGIN
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* Username Input Field */}
          <div className="mb-10 w-3/4">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              className="block w-full p-2 pl-4 bg-[#D9D9D9] border-none rounded-full focus:outline-none focus:ring-blue-500"
            />
          </div>
          {/* Password Input Field */}
          <div className="mb-10 w-3/4">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="block w-full p-2 pl-4 bg-[#D9D9D9] border-none rounded-full focus:outline-none focus:ring-blue-500"
            />
          </div>
          {/* Remember Me Checkbox */}
          <div className="mb-10 w-3/4 flex items-center">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-gray-700">Remember me</span>
            </label>
          </div>
          {/* Submit Button */}
          <div className="w-3/4 flex justify-center">
            <button
              type="submit"
              className="w-1/2 p-2 bg-[#E19E60] text-white rounded-full hover:bg-[#d88e55] focus:outline-none"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
