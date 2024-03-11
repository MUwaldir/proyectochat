import React from "react";
import {  Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import Chat from "./components/Chat/Chat";
function App() {
  return (
  
      <div className="App flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-grow">

        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/" exact element={<Chat />} />
        </Routes>
        </div>
      </div>
  
  );
}

export default App;
