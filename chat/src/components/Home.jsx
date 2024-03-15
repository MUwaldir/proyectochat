import React from 'react';
import { Link } from 'react-router-dom';
import { FaComment } from 'react-icons/fa'; // Importa el ícono de chat
// import { FaComment } from 'react-icons/fa'; // Importa el ícono de chat

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FaComment className="text-6xl mb-4 text-blue-500" /> {/* Ícono de chat */}
      <h1 className="text-4xl font-bold mb-4 text-center">Bienvenido a nuestra aplicación de chat</h1>
      <p className="text-lg text-center mb-8">Regístrate o inicia sesión para comenzar a chatear con tus amigos</p>
      <div className="flex space-x-4">
        <Link to={'/login'}>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            Iniciar sesión
          </button>
        </Link>
        <Link to={'/signup'}>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
            Registrarse
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
