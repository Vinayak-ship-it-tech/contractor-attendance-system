import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const maxSlide = window.innerWidth * 0.72;

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    let moveX = currentX - startX;

    if (menuOpen) {
      moveX = maxSlide + moveX;
    }

    if (moveX < 0) moveX = 0;
    if (moveX > maxSlide) moveX = maxSlide;

    setDragX(moveX);
  };

  const handleTouchEnd = () => {
    setDragging(false);

    if (dragX > maxSlide / 2) {
      setMenuOpen(true);
      setDragX(maxSlide);
    } else {
      setMenuOpen(false);
      setDragX(0);
    }
  };

  const pageStyle = {
    transform: `translateX(${dragging ? dragX : menuOpen ? maxSlide : 0}px) scale(${
      dragging
        ? 1 - (dragX / maxSlide) * 0.08
        : menuOpen
        ? 0.92
        : 1
    })`,
  };

  return (
    <div className="layout-container">

      <aside className="mobile-drawer">
        <Sidebar />
      </aside>

      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main
        className={menuOpen ? "main-content menu-open-page" : "main-content"}
        style={pageStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </main>

    </div>
  );
}

export default Layout;