import React, { useState } from 'react';

const Footer = ({ isLightMode, toggleLightMode }) => {
  return (
    <footer className="bg-gray-800 text-white py-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <a href="https://www.musictheory.net/exercises" className="hover:underline">Interactive Music Theory</a>
          <a href="https://www.musictheory.net/lessons" className="hover:underline">Music Theory Lessons</a>
          <a href="https://www.musictheory.net/exercises" className="hover:underline">Music Theory Exercises</a>
          <a href="https://www.musictheory.net/games" className="hover:underline">Music Theory Games</a>
        </div>
        <button
          onClick={toggleLightMode}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {isLightMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="moving-part bg-indigo-500 opacity-50"></div>
        <div className="moving-part bg-indigo-400 opacity-50"></div>
        <div className="moving-part bg-indigo-300 opacity-50"></div>
      </div>
    </footer>
  );
};

export default Footer;
