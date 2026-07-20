import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../api";
import { getOfflineAttendanceCount } from "../utils/offlineAttendance";
import {
  FaChartPie,
  FaUsers,
  FaUserPlus,
  FaClipboardList,
  FaMapMarkerAlt,
  FaImages,
  FaMoneyBillWave,
  FaFileAlt,
  FaBuilding,
  FaChevronDown,
  FaChevronRight,
  FaWifi,
  FaSignOutAlt,
  FaGavel,
  FaBell,
  FaRobot,
} from "react-icons/fa";
import "./Sidebar.css";


function Sidebar() {
  const [openAttendance, setOpenAttendance] = useState(false);
  const [openWorkPhotos, setOpenWorkPhotos] = useState(false);
  const [openSalary, setOpenSalary] = useState(false);
  const [openTenders, setOpenTenders] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [offlineCount, setOfflineCount] = useState(0);

  const updateOfflineCount = () => {
  setOfflineCount(getOfflineAttendanceCount());
};

useEffect(() => {
  API.get("departments/")
    .then((res) => setOrganizations(res.data))
    .catch((err) => console.log(err));

  updateOfflineCount();

  window.addEventListener(
    "offlineAttendanceUpdated",
    updateOfflineCount
  );

  return () => {
    window.removeEventListener(
      "offlineAttendanceUpdated",
      updateOfflineCount
    );
  };
}, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <div className="brand animated-brand">
        <div className="brand-logo brand-logo-animate">LGE</div>
        <div className="brand-text">
          <h2>LAKSHMI GANAPATHI</h2>
          <p>ENTERPRISES</p>
        </div>
      </div>

      <nav className="menu">
        <NavLink to="/dashboard">
          <FaChartPie /> Dashboard
        </NavLink>

        <NavLink to="/workers">
          <FaUsers /> Workers
        </NavLink>

        <NavLink to="/add-worker">
          <FaUserPlus /> Add Worker
        </NavLink>

        <button onClick={() => setOpenAttendance(!openAttendance)}>
          <span><FaClipboardList /> Attendance</span>
          {openAttendance ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {openAttendance && (
          <div className="submenu">
            <NavLink to="/attendance">All Attendance</NavLink>
            <NavLink to="/attendance/today" className="submenu-link">
            Today's Attendance
          </NavLink>
          <NavLink to="/attendance/history">
            Attendance History
          </NavLink>
          <NavLink to="/attendance/upload">
            Upload Group Photo
          </NavLink>
          <NavLink to="/attendance/unknown-persons">
            Unknown Persons
          </NavLink>
            {organizations.map((org) => (
              <NavLink key={org.id} to={`/attendance/organization/${org.id}`}>
                {org.name}
                
              </NavLink>
              
              
            ))}
          </div>
        )}
        <NavLink to="/offline-attendance">
          <FaWifi /> Offline Attendance
          {offlineCount > 0 && (
            <span className="badge">{offlineCount}</span>
          )}
        </NavLink>

        <NavLink to="/sites">
          <FaMapMarkerAlt /> Sites
        </NavLink>
        <NavLink to="/sites/assign-workers">
          <FaUsers /> Assign Workers
        </NavLink>
        <NavLink to="/sites/add">
          <FaMapMarkerAlt /> Add Site
        </NavLink>
        <NavLink to="/sites/attendance">
          <FaClipboardList /> Site Attendance
        </NavLink>

        <button onClick={() => setOpenWorkPhotos(!openWorkPhotos)}>
          <span><FaImages /> Work Photos</span>
          {openWorkPhotos ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {openWorkPhotos && (
          <div className="submenu">
            <NavLink to="/work-photos">All Work Photos</NavLink>
            {organizations.map((org) => (
              <NavLink key={org.id} to={`/work-photos/organization/${org.id}`}>
                {org.name}
              </NavLink>
            ))}
          </div>
        )}

        <button onClick={() => setOpenSalary(!openSalary)}>
          <span><FaMoneyBillWave /> Salary</span>
          {openSalary ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {openSalary && (
          <div className="submenu">
            <NavLink to="/salary">All Salary</NavLink>
            {organizations.map((org) => (
              <NavLink key={org.id} to={`/salary/organization/${org.id}`}>
                {org.name}
              </NavLink>
            ))}
          </div>
        )}

        <NavLink to="/bills">
          <FaFileAlt /> Bills
        </NavLink>

        <button onClick={() => setOpenTenders(!openTenders)}>
        <span>
          <FaGavel /> Tenders
        </span>

        {openTenders ? <FaChevronDown /> : <FaChevronRight />}
      </button>

      {openTenders && (
        <div className="submenu">

          <NavLink to="/tenders/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/tenders">
            All Tenders
          </NavLink>

          <NavLink to="/tenders/organizations">
            Organizations
          </NavLink>

          <NavLink to="/tenders/departments">
            Departments
          </NavLink>

          <NavLink to="/tenders/notifications">
            <FaBell /> Notifications
          </NavLink>

          <NavLink to="/tenders/ai">
            <FaRobot /> AI Assistant
          </NavLink>

        </div>
      )}

        <NavLink to="/ai-chat">
          <FaFileAlt /> AI Assistant
        </NavLink>

        <NavLink to="/reports">
          <FaFileAlt /> Reports
        </NavLink>

        <NavLink to="/organizations">
          <FaBuilding /> Organizations
        </NavLink>
      </nav>

      <div className="admin-footer">
        <div>
          <strong>Admin Panel</strong>
          <p>Contractor System</p>
        </div>
        <button onClick={logout}>
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;