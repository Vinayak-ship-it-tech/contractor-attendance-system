import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [maxSlide, setMaxSlide] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const latestX = useRef(0);
  const isHorizontalDrag = useRef(false);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 768) {
        setMaxSlide(window.innerWidth * 0.78);
        document.body.classList.add("mobile-layout-active");
      } else {
        setMenuOpen(false);
        setDragX(0);
        document.body.classList.remove("mobile-layout-active");
      }
    };

    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      document.body.classList.remove("mobile-layout-active");
    };
  }, []);

  const handlePointerDown = (e) => {
    if (window.innerWidth > 768) return;

    startX.current = e.clientX;
    startY.current = e.clientY;
    latestX.current = menuOpen ? maxSlide : 0;
    isHorizontalDrag.current = false;
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging || window.innerWidth > 768) return;

    const diffX = e.clientX - startX.current;
    const diffY = e.clientY - startY.current;

    if (!isHorizontalDrag.current) {
      if (Math.abs(diffY) > Math.abs(diffX)) return;
      if (Math.abs(diffX) > 8) isHorizontalDrag.current = true;
    }

    let moveX = menuOpen ? maxSlide + diffX : diffX;

    moveX = Math.max(0, Math.min(moveX, maxSlide));

    latestX.current = moveX;
    setDragX(moveX);
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
  const progress = maxSlide ? Math.min(currentX / maxSlide, 1) : 0;
  const eased = 1 - Math.pow(1 - progress, 2.4);

  const pageStyle = {
    transform: `translate3d(${currentX}px, 0, 0) scale(${1 - eased * 0.08}) rotateY(${-eased * 3}deg)`,
    borderRadius: `${eased * 30}px 0 0 ${eased * 30}px`,
    boxShadow:
      currentX > 5
        ? `-28px 0 70px rgba(0,0,0,${0.18 + eased * 0.28})`
        : "none",
    transition: dragging
      ? "none"
      : "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.65s ease, box-shadow 0.65s ease",
  };

  return (
    <div className={menuOpen ? "layout-container menu-open" : "layout-container"}>
      <div className="mobile-sidebar-layer">
        <Sidebar />
      </div>

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