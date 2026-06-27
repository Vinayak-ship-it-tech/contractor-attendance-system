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

      <section className="mobile-page">

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        <main className="main-content">
          {children}
        </main>

      </section>

    </div>
  );
}

export default Layout;