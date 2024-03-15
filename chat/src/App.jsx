import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import Chat from "./components/Chat/Chat";
const URLAPI = "http://localhost:3001";
const token = localStorage.getItem("authToken");
const user = localStorage.getItem('username')


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState('');
  const [userId, setUserId] = useState(null);



  useEffect(() => {
    const ValidateSession =async () => {
    try {
      if(!token) return;
      const response = await fetch(`${URLAPI}/api/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });

      if(response.ok) {
       console.log("data de valiacion : " +response)
        setIsAuthenticated(true)
        setUserAuthenticated(user)
        
      }else {
        console.log("Error al validar  la session: " )
        localStorage.removeItem("authToken")
        setIsAuthenticated(false)
      }
     
     
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
    ValidateSession()
  }, []);
  console.log(isAuthenticated);
  return (
    <div className="App flex flex-col min-h-screen  ">
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        userAuthenticated={userAuthenticated}
      />

      {/* <div className="flex-grow bg-gray-100 "> */}
        <Routes>
          <Route
            path="/login"
            element={<LoginForm setIsAuthenticated={setIsAuthenticated} setUserAuthenticated={setUserAuthenticated} setUserId={setUserId} />}
          />
          <Route
            path="/signup"
            element={<SignupForm setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/"
            exact
            element={<Chat isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}  userId={userId} userAuthenticated={userAuthenticated} />}
          />
        </Routes>
      </div>
    // </div>
  );
}

export default App;
