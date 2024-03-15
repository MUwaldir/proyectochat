import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, setIsAuthenticated,userAuthenticated}) {
   
    const handleLogout = () => {
        localStorage.removeItem("authToken")
        setIsAuthenticated(false);
    }

  return (
    <nav className="bg-blue-500 p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Chat</Link>
        {isAuthenticated && <p className='text-black'>{userAuthenticated}</p> }
        
        <ul className="flex space-x-4">
          {isAuthenticated ? (
            <li className="text-white cursor-pointer"><button onClick={handleLogout}>Cerrar sesión</button> </li>
          ) : (
            <>
              <li><Link to="/login" className="text-white cursor-pointer">Iniciar sesión</Link></li>
              <li><Link to="/signup" className="text-white cursor-pointer">Registrarse</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
