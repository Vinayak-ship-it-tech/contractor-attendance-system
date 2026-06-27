import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("login/", {
        username: form.username.trim(),
        password: form.password.trim(),
      });

      localStorage.setItem("token", res.data.token);

      alert("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="logo-circle">
          🏢
        </div>

        <h1>LAKSHMI GANAPATHI ENTERPRISES</h1>

        <p>Contractor Workforce Management System</p>

        <form onSubmit={loginUser}>

          <div className="input-group">
            <input
              type="text"
              placeholder="Admin Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          <button type="submit" className="login-btn">
            LOGIN
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;