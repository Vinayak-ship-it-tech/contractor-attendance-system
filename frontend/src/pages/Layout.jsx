import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
  <div className="layout-container">

    <button className="mobile-menu-btn">
      ☰
    </button>

    <div className="sidebar">
      <button className="mobile-close-btn">
        ×
      </button>

      <Sidebar />
    </div>

    <main className="main-content">
      {children}
    </main>

  </div>
);
}

export default Layout;