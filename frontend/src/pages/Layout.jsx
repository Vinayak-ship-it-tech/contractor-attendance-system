import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const maxSlide = window.innerWidth * 0.74;

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
  const easedProgress = 1 - Math.pow(1 - progress, 2.2);

  const scale = dragging
    ? 1 - easedProgress * 0.095
    : menuOpen
    ? 0.905
    : 1;

  const rotate = dragging
    ? -easedProgress * 5
    : menuOpen
    ? -5
    : 0;

  const radius = dragging || menuOpen ? easedProgress * 38 : 0;
  const shadowPower = dragging || menuOpen ? 0.14 + easedProgress * 0.34 : 0;

  const pageStyle = {
    transform: `translateX(${
      dragging ? dragX : menuOpen ? maxSlide : 0
    }px) scale(${scale}) rotateY(${rotate}deg)`,

    borderRadius: `${radius}px 0 0 ${radius}px`,

    boxShadow:
      dragging || menuOpen
        ? `-28px 0 65px rgba(0,0,0,${shadowPower})`
        : "none",

    transition: dragging
      ? "none"
      : "transform 0.72s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.72s ease, box-shadow 0.72s ease",
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