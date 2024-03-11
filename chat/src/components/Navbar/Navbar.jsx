import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Chat</Link>
        <ul className="flex space-x-4">
          <li><Link to="/login" className="text-white">Login</Link></li>
          <li><Link to="/signup" className="text-white">Signup</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
