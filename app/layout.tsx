// app/layout.tsx

import './globals.css'; // Import the global stylesheet for Tailwind CSS
import React from 'react';

export const metadata = {
  title: 'My Blog Website',
  description: 'A simple blog built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags or link tags can be added here */}
      </head>
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}
