import React from "react";
import AuthForm from "../components/AuthForm";

const Home = () => {
  return (
    <div
      className="relative flex h-screen w-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 items-center justify-end"
      style={{ backgroundImage: "url('/src/assets/bg.jpg')", backgroundBlendMode: "overlay", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-0"></div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-end w-full pr-20">
        <div className="mb-10 text-right">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-2xl mb-2 tracking-tight">Welcome to EvRide</h1>
          <p className="text-lg text-gray-200 font-medium">Your journey to sustainable mobility starts here.</p>
        </div>
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-96 border border-white/40">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Home;