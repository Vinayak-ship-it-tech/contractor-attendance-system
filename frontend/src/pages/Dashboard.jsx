import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Layout from "./Layout";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

function Dashboard() {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await API.get("dashboard-summary/");
      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  
  const [data, setData] = useState({
   
    unknown_today: 0,
    organizations: [],
  });

  const fetchLiveCount = async () => {
    try {
      const res = await API.get("live-worker-count/");
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const attendancePercent =
    data.total_workers > 0
      ? Math.round((data.present_today / data.total_workers) * 100)
      : 0;

  const workerData = [
  { name: "Active", value: summary.active_workers || 0 },
  {
    name: "Inactive",
    value: (summary.total_workers || 0) - (summary.active_workers || 0),
  },
];

  const billData = [
    { name: "Pending", value: summary.pending_bills || 0 },
    { name: "Paid", value: summary.paid_bills || 0 },
  ];

  const attendanceData = [
    {
      name: "Today",
      Present: summary.present_today || 0,
      Total: summary.total_workers || 0,
    },
  ];

  return (
    <Layout>
      <div className="dashboard-page">
        <section className="hero-panel">
          <div>
            <span className="status-chip">● Live Workforce System</span>
           <h1 className="hero-title">
              Hello , Admin
          </h1>
            <p>
              What's Hapening With Your Team Today
            </p>

            <div className="hero-actions">
              <Link to="/add-worker" className="primary-btn">+ Add Worker</Link>
              <Link to="/upload" className="secondary-btn">Upload Group Photo</Link>
            </div>
          </div>

          <div className="attendance-ring">
            <div>
              <h2>{attendancePercent}%</h2>
              <p>Today Attendance</p>
            </div>
          </div>
        </section>

        
          

          

          

        <section className="kpi-grid">
          <div className="kpi-card blue">
            <p>Total Workers</p>
            <h2>{data.total_workers}</h2>
            <span>Registered workforce</span>
          </div>

          <div className="kpi-card green">
            <p>Present Today</p>
            <h2>{data.present_today}</h2>
            <span>Detected from attendance</span>
          </div>

          <div className="kpi-card red">
            <p>Absent Today</p>
            <h2>{data.absent_today}</h2>
            <span>Not marked today</span>
          </div>

          <div className="kpi-card orange">
            <p>Unknown Faces</p>
            <h2>{data.unknown_today}</h2>
            <span>Need verification</span>
          </div>

           <div className="kpi-card orange">
            <p>Active Sites</p>
            <h2>{summary.active_sites || 0}</h2>
            <span>Currently active work sites</span>
          </div>

          <div className="kpi-card blue">
            <p>Attendance Photos</p>
            <h2>{summary.total_photos || 0}</h2>
            <span>Uploaded group photos</span>
          </div>
        </section>

        <section className="quick-grid">
          <Link to="/add-worker" className="quick-card">
            <div className="quick-icon">👷</div>
            <h1 className="gradient-title">
              Add New Worker
            </h1>
            <p>Enter worker details yourself with face photo.</p>
          </Link>

          <Link to="/workers" className="quick-card">
            <div className="quick-icon">📋</div>
            <h3>Worker List</h3>
            <p>View all permanent and temporary workers.</p>
          </Link>

          <Link to="/upload" className="quick-card">
            <div className="quick-icon">📸</div>
            <h3>Photo Attendance</h3>
            <p>Upload group photo and mark attendance.</p>
          </Link>

          <Link to="/salary" className="quick-card">
            <div className="quick-icon">💰</div>
            <h3>Salary</h3>
            <p>Calculate wages based on attendance.</p>
          </Link>

          <Link to="/reports" className="quick-card">
          <div className="quick-icon">📊</div>
          <h3>Reports & Analytics</h3>
          <p>Generate attendance, salary and performance reports.</p>
          </Link>

        <Link to="/attendance" className="quick-card">
          <div className="quick-icon">✅</div>
          <h3>Attendance Sheet</h3>
          <p>View today's attendance and worker records.</p>
        </Link>
        </section>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Worker Status</h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={workerData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  label
                >
                  <Cell fill="#2563eb" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Bill Status</h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={billData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  label
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#16a34a" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Attendance Today</h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Present" fill="#2563eb" />
                <Bar dataKey="Total" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section className="section-title">
          <div>
            <h2 className="gradient-title">
            Site Wise Live Attendance
          </h2>
            <p>Professional overview of present and absent workers by organization.</p>
          </div>
          <Link to="/organizations">View Organizations →</Link>
        </section>

        <section className="site-grid">
          {data.organizations?.length > 0 ? (
            data.organizations.map((org, index) => {
              const total = org.present_count + org.absent_count;
              const percent =
                total > 0 ? Math.round((org.present_count / total) * 100) : 0;

              return (
                <div className="site-card" key={index}>
                  <div className="site-head">
                    <div>
                      <h3>{org.organization}</h3>
                      <p>{total} workers assigned</p>
                    </div>
                    <span>{percent}%</span>
                  </div>

                  <div className="progress-track">
                    <div style={{ width: `${percent}%` }}></div>
                  </div>

                  <div className="site-numbers">
                    <div>
                      <p>Present</p>
                      <h2 className="green-text">{org.present_count}</h2>
                    </div>
                    <div>
                      <p>Absent</p>
                      <h2 className="red-text">{org.absent_count}</h2>
                    </div>
                  </div>

                  <div className="worker-preview">
                    <h4>Present Workers</h4>
                    {org.present_workers?.slice(0, 4).map((name, i) => (
                      <p key={i}>✅ {name}</p>
                    ))}
                    {org.present_workers?.length === 0 && <p>No present workers</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <h3>No attendance data yet</h3>
              <p>Add workers and upload attendance photo to see live dashboard data.</p>
              <Link to="/add-worker">Add First Worker</Link>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;