import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={menuOpen ? "layout-container menu-open" : "layout-container"}>

      <aside className="mobile-drawer">
        <button
          className="mobile-close-btn"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>
        <Sidebar />
      </aside>

      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(true)}
      >
        ☰
      </button>

      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}

export default Layout;