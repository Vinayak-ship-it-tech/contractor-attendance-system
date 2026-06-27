import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={mobileSidebarOpen ? "layout-container menu-open" : "layout-container"}>

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileSidebarOpen(true)}
      >
        ☰
      </button>

      <aside className="mobile-video-sidebar">
        <button
          className="mobile-close-btn"
          onClick={() => setMobileSidebarOpen(false)}
        >
          ×
        </button>

        <Sidebar />
      </aside>

      <main
        className="main-content"
        onClick={() => {
          if (mobileSidebarOpen) setMobileSidebarOpen(false);
        }}
      >
        {children}
      </main>

    </div>
  );
}

export default Layout;