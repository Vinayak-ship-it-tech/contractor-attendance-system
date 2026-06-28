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

  const progress = dragX / maxSlide;

  const scale = dragging ? 1 - progress * 0.09 : menuOpen ? 0.91 : 1;
  const rotate = dragging ? -progress * 4 : menuOpen ? -4 : 0;

  const pageStyle = {
    transform: `translateX(${
      dragging ? dragX : menuOpen ? maxSlide : 0
    }px) scale(${scale}) rotateY(${rotate}deg)`,

    borderRadius:
      dragging || menuOpen
        ? `${progress * 34}px 0 0 ${progress * 34}px`
        : "0px",

    boxShadow:
      dragging || menuOpen
        ? `-24px 0 55px rgba(0,0,0,${0.12 + progress * 0.28})`
        : "none",

    transition: dragging
      ? "none"
      : "transform 0.55s cubic-bezier(0.22,1,0.36,1), border-radius 0.55s ease, box-shadow 0.55s ease",
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
        className="main-content"
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