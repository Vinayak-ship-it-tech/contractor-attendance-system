import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#f8fafc",
      }}
    >
      <h1
        style={{
          fontSize: "50px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Welcome to
      </h1>

      <h2
        style={{
          fontSize: "60px",
          color: "#2563eb",
          textAlign: "center",
        }}
      >
        LAKSHMI GANAPATHI ENTERPRISES
      </h2>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "15px 40px",
          marginTop: "40px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "10px",
          border: "none",
          background: "#2563eb",
          color: "white",
        }}
      >
        HOME
      </button>
    </div>
  );
}

export default Welcome;