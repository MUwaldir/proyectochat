import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
const URLAPI = "http://localhost:3001";

function LoginForm({ setIsAuthenticated, setUserAuthenticated,setUserId}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };
    // Aquí puedes agregar la lógica para enviar el formulario de registro al servidor
    try {
      const response = await fetch(`${URLAPI}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      console.log(data);
      const username = data.username;
      const userIdResponse = data.userId;
      console.log("el user login  " + data.username);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", data.username);

      setIsAuthenticated(true);
      setUserAuthenticated(username);
      setUserId(userIdResponse)

      navigate("/");
    } catch (error) {
      console.error("Error logging in user:", error);
      return { success: false, message: "Error logging in user" };
    }
  };

  return (
    <div className="auth-form max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-2"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
