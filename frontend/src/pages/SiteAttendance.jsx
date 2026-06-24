import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./SiteAttendance.css";

function SiteAttendance() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await API.get("work-sites/");
      setSites(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadAttendance = async () => {
    if (!selectedSite) {
      alert("Please select site");
      return;
    }

    try {
      let url = `attendance/site/${selectedSite}/`;

      if (date) {
        url += `?date=${date}`;
      }

      const res = await API.get(url);
      setAttendance(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load site attendance");
    }
  };

  return (
    <Layout>
      <div className="site-attendance-page">
        <h1>Site-wise Attendance</h1>
        <p>View attendance records by work site</p>

        <div className="site-attendance-filter">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            <option value="">Select Work Site</option>

            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.site_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button onClick={loadAttendance}>Search</button>
        </div>

        <div className="site-attendance-card">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((item) => (
                <tr key={item.id}>
                  <td>{item.worker_name || item.worker?.name}</td>
                  <td>{item.date}</td>
                  <td>{item.check_in_time || "Not added"}</td>
                  <td>{item.check_out_time || "Not added"}</td>
                  <td>{item.total_hours}</td>
                  <td>{item.status}</td>
                  <td>{item.location || "No location"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendance.length === 0 && (
            <div className="no-data">No attendance records found</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default SiteAttendance;