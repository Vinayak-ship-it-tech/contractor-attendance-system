import React, { useEffect } from "react";
import "./WelcomeAnimation.css";

function WelcomeAnimation({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="welcome-animation-screen">
      <h1 className="welcome-animation-text">
        Welcome to
      </h1>

      <h2 className="enterprise-animation-text">
        LAKSHMI GANAPATHI ENTERPRISES
      </h2>
    </div>
  );
}

export default WelcomeAnimation;