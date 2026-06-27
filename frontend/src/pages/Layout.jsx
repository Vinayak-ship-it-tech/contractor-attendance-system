import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;

    // swipe right = open sidebar
    if (endX - startX > 80) {
      setMenuOpen(true);
    }

    // swipe left = close sidebar
    if (startX - endX > 80) {
      setMenuOpen(false);
    }
  };

  return (
    <div className={menuOpen ? "layout-container menu-open" : "layout-container"}>

      <aside className="mobile-drawer">
        <Sidebar />
      </aside>

      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main
        className="main-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </main>

    </div>
  );
}

export default Layout;