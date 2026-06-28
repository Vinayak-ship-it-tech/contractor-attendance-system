import React, { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef(0);
  const latestX = useRef(0);
  const rafId = useRef(null);

  const maxSlide = window.innerWidth * 0.78;

  const updateDrag = (value) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setDragX(value);
    });
  };

  const handlePointerDown = (e) => {
    if (window.innerWidth > 768) return;

    startX.current = e.clientX;
    latestX.current = menuOpen ? maxSlide : 0;
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging || window.innerWidth > 768) return;

    let moveX = e.clientX - startX.current;

    if (menuOpen) {
      moveX = maxSlide + moveX;
    }

    if (moveX < 0) moveX = 0;
    if (moveX > maxSlide) moveX = maxSlide;

    latestX.current = moveX;
    updateDrag(moveX);
  };

  const handlePointerUp = () => {
    if (window.innerWidth > 768) return;

    setDragging(false);

    if (latestX.current > maxSlide * 0.42) {
      setMenuOpen(true);
      setDragX(maxSlide);
    } else {
      setMenuOpen(false);
      setDragX(0);
    }
  };

  const currentX = dragging ? dragX : menuOpen ? maxSlide : 0;
  const progress = Math.min(currentX / maxSlide, 1);
  const eased = 1 - Math.pow(1 - progress, 2.6);

  const pageStyle = {
    transform: `translate3d(${currentX}px, 0, 0) scale(${
      1 - eased * 0.1
    }) rotateY(${-eased * 4}deg)`,

    borderRadius: `${eased * 34}px 0 0 ${eased * 34}px`,

    boxShadow:
      currentX > 5
        ? `-30px 0 70px rgba(0,0,0,${0.16 + eased * 0.32})`
        : "none",

    transition: dragging
      ? "none"
      : "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.75s ease, box-shadow 0.75s ease",
  };

  return (
    <div className={menuOpen ? "layout-container menu-open" : "layout-container"}>
      <aside className="mobile-drawer">
        <div className="mobile-sidebar-fixed">
          <Sidebar />
        </div>
      </aside>

      <aside className="desktop-sidebar">
        <Sidebar />
      </aside>

      <main
        className="main-content"
        style={pageStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="mobile-page-scroll">{children}</div>
      </main>
    </div>
  );
}

export default Layout;