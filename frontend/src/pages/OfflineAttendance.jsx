import React, { useEffect, useState } from "react";

import {
  syncOfflineAttendance,
  deleteOfflineAttendance,
} from "../utils/offlineAttendance";

import "./OfflineAttendance.css";


function OfflineAttendance() {
  const [records, setRecords] = useState([]);

  const loadOfflineData = () => {
    const data = JSON.parse(localStorage.getItem("offline_attendance")) || [];
    setRecords(data);
  };

  useEffect(() => {
    loadOfflineData();
  }, []);

  const handleSync = async () => {
  try {
    await syncOfflineAttendance();

    loadOfflineData();

    alert("Offline attendance synced successfully");
  } catch (error) {
    console.error(error);
    alert("Sync failed");
  }
};
  const handleDelete = (offlineId) => {
  const confirmDelete = window.confirm(
    "Do you want to delete this offline attendance record?"
  );

  if (!confirmDelete) return;

  deleteOfflineAttendance(offlineId);
  loadOfflineData();
};

 return (
  <div className="offline-page">
    <div className="offline-card">
      <div className="offline-header">
        <div>
          <h1>Offline Attendance</h1>
          <p>
            Pending Records: <strong>{records.length}</strong>
            </p>
          <p>
            Pending attendance records saved without
            internet.
          </p>
        </div>

        <button
          className="sync-btn"
          onClick={handleSync}
        >
          Sync Now
        </button>
      </div>

      <table className="offline-table">
        <thead>
          <tr>
            <th>Worker ID</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Status</th>
            <th>Location</th>
             <th>Action</th>
          </tr>
        </thead>

        <tbody>
            {records.length === 0 ? (
                <tr>
                <td colSpan="6" className="empty-text">
                    No offline attendance found
                </td>
                </tr>
            ) : (
                records.map((item) => (
                <tr key={item.offline_id}>
                    <td>{item.worker}</td>
                    <td>{item.date}</td>
                    <td>{item.check_in}</td>
                    <td>{item.status}</td>
                    <td>
                    {item.latitude}, {item.longitude}
                    </td>
                    <td>
                    <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.offline_id)}
                    >
                        Delete
                    </button>
                    </td>
                </tr>
                ))
            )}
            </tbody>
      </table>
    </div>
  </div>
);
}

export default OfflineAttendance;