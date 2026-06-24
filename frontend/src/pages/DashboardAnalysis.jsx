import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./DashboardAnalysis.css";

function DashboardAnalysis() {
  const [data, setData] = useState({
    total_workers: 0,
    present_today: 0,
    absent_today: 0,
    unknown_today: 0,
  });

  const [attendance, setAttendance] = useState([]);

  const fetchData = async () => {
    try {
      const countRes = await API.get("live-worker-count/");
      setData(countRes.data);

      const attRes = await API.get("attendance/");
      setAttendance(attRes.data.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="hr-dashboard">
        <div className="top-bar">
          <div>
            <h2>Attendance Sheet</h2>
            <p>LAKSHMI GANAPATHI ENTERPRISES</p>
          </div>

          <div className="top-actions">
            <select>
              <option>All Departments</option>
              <option>GVMC</option>
              <option>KMC</option>
              <option>VMC</option>
            </select>

            <div className="admin-box">Admin 👤</div>
          </div>
        </div>

        <div className="dashboard-layout">
          <div className="left-panel">
            <div className="chart-card">
              <div className="card-title">
                <h3>Attendance Status</h3>
                <span>2026</span>
              </div>

              <div className="bar-chart">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(
                  (m, i) => (
                    <div className="bar-item" key={m}>
                      <div className="bar-wrap">
                        <span
                          className="bar present-bar"
                          style={{ height: `${80 + i * 12}px` }}
                        ></span>
                        <span
                          className="bar late-bar"
                          style={{ height: `${30 + i * 5}px` }}
                        ></span>
                      </div>
                      <p>{m}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="booking-card">
              <div className="card-title">
                <h3>Recent Attendance</h3>
                <span>View details</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((item) => (
                      <tr key={item.id}>
                        <td>{item.worker_name}</td>
                        <td>{item.date}</td>
                        <td>{item.check_in_time}</td>
                        <td>
                          <span className="status-badge">Present</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No attendance data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="middle-panel">
            <div className="department-card">
              <h3>All Departments</h3>

              <div className="department-row">
                <h2>{data.total_workers}</h2>
                <div>
                  <p>Total Workers</p>
                  <span>Active workforce</span>
                </div>
              </div>

              <div className="department-row">
                <h2>{data.present_today}</h2>
                <div>
                  <p>On-time / Present</p>
                  <span>Marked today</span>
                </div>
              </div>

              <div className="department-row">
                <h2>{data.absent_today}</h2>
                <div>
                  <p>Absent</p>
                  <span>Not marked today</span>
                </div>
              </div>

              <div className="department-row">
                <h2>{data.unknown_today}</h2>
                <div>
                  <p>Unknown</p>
                  <span>Need registration</span>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="employee-card">
              <div className="card-title">
                <h3>Logged In Staff</h3>
                <span>View all</span>
              </div>

              {attendance.length > 0 ? (
                attendance.map((item) => (
                  <div className="employee-row" key={item.id}>
                    <div className="avatar">👷</div>
                    <div>
                      <h4>{item.worker_name}</h4>
                      <p>Check In: {item.check_in_time}</p>
                      <span className="late-text">
                        {item.check_out_time ? "Completed" : "Working"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No workers logged in today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardAnalysis;