import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="layout-container">

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileSidebarOpen(true)}
      >
        ☰
      </button>

      <div className={mobileSidebarOpen ? "sidebar mobile-open" : "sidebar"}>
        <button
          className="mobile-close-btn"
          onClick={() => setMobileSidebarOpen(false)}
        >
          ×
        </button>

        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      <main className={mobileSidebarOpen ? "main-content pushed" : "main-content"}>
        {children}
      </main>

    </div>
  );
}

export default Layout;