import React, { useEffect, useState } from "react";
import API from "../../api";
import Layout from "../Layout";
import "./TodayAttendance.css";
import { syncOfflineAttendance } from "../../utils/offlineAttendance";

function TodayAttendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
  API.get("departments/")
    loadTodayAttendance();

  window.addEventListener("online", syncOfflineAttendance);

  return () => {
    window.removeEventListener("online", syncOfflineAttendance);
  };
}, []);

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await API.get(`attendance/?date=${today}`);
      setAttendance(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load today's attendance");
    }
  };

  return (
    <Layout>
      <div className="today-page">
        <h1>Today's Attendance</h1>
        <p className="subtitle">Live attendance status of workers today</p>

        <div className="attendance-grid">
          {attendance.length === 0 && (
            <div className="empty-card">
              No attendance marked today
            </div>
          )}

          {attendance.map((item) => (
            <div className="attendance-card" key={item.id}>
              <h3>{item.worker_name || item.worker?.name}</h3>

              <p>
                <b>Date:</b> {item.date}
              </p>

              <p>
                <b>Check In:</b> {item.check_in || "Not checked in"}
              </p>

              <p>
                <b>Check Out:</b> {item.check_out || "Not checked out"}
              </p>

              <p>
                <b>Status:</b>{" "}
                <span className="present-badge">
                  {item.status || "Present"}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default TodayAttendance;