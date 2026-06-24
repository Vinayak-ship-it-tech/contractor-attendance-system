import React, { useEffect, useState } from "react";
import API from "../../api";
import Layout from "../Layout";
import "./AttendanceHistory.css";

function AttendanceHistory() {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState("");

  const loadAttendance = async () => {
    try {
      let url = "attendance/";

      if (date) {
        url = `attendance/?date=${date}`;
      }

      const res = await API.get(url);
      setAttendance(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load attendance history");
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  return (
    <Layout>
      <div className="history-page">
        <h1>Attendance History</h1>
        <p>View worker attendance records by date</p>

        <div className="history-filter">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button onClick={loadAttendance}>Search</button>
        </div>

        <div className="history-card">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((item) => (
                <tr key={item.id}>
                  <td>{item.worker_name || item.worker?.name}</td>
                  <td>{item.date}</td>
                  <td>{item.check_in || "Not added"}</td>
                  <td>{item.check_out || "Not added"}</td>
                  <td>{item.status || "Present"}</td>
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

export default AttendanceHistory;