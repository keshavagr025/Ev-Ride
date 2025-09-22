import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sirf demo ke liye (API nahi use kar raha)
    if (email && password) {
      alert(`${isLogin ? "Login" : "Sign Up"} successful!`);
      navigate("/dashboard");
    } else {
      alert("Please enter valid details");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-[320px] text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
        <span
          className="text-blue-400 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
};

export default AuthForm;
