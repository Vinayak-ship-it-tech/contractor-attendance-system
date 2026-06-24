import React, { useEffect, useState } from "react";
import API from "../api";
import "./WorkerMobileApp.css";

function WorkerMobileApp() {
  const [workerId, setWorkerId] = useState("");
  const [worker, setWorker] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const loginWorker = async () => {
    try {
      const res = await API.get(`workers/${workerId}/`);
      setWorker(res.data);

      const att = await API.get(`attendance/?worker=${workerId}`);
      setAttendance(att.data);
    } catch (error) {
      alert("Worker not found");
    }
  };

  const checkIn = async () => {
    try {
      await API.post("worker-checkin/", {
        worker_id: worker.id,
      });
      alert("Check-in successful");
      loginWorker();
    } catch (error) {
      alert("Check-in failed");
    }
  };

  const checkOut = async () => {
    try {
      await API.post("worker-checkout/", {
        worker_id: worker.id,
      });
      alert("Check-out successful");
      loginWorker();
    } catch (error) {
      alert("Check-out failed");
    }
  };

  return (
    <div className="mobile-app">
      <div className="mobile-header">
        <h2>Worker App</h2>
        <p>LAKSHMI GANAPATHI ENTERPRISES</p>
      </div>

      {!worker && (
        <div className="mobile-card">
          <h3>Worker Login</h3>

          <input
            type="number"
            placeholder="Enter Worker ID"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          />

          <button onClick={loginWorker}>Login</button>
        </div>
      )}

      {worker && (
        <>
          <div className="mobile-card profile-card">
            {worker.face_image && <img src={worker.face_image} alt={worker.name} />}

            <h3>{worker.name}</h3>
            <p>Worker ID: {worker.id}</p>
            <p>Phone: {worker.phone || "Not added"}</p>
            <p>Status: {worker.is_active ? "Active" : "Inactive"}</p>
          </div>

          <div className="mobile-actions">
            <button onClick={checkIn}>Check In</button>
            <button onClick={checkOut}>Check Out</button>
          </div>

          <a
            className="id-btn"
            href={`${API.defaults.baseURL}workers/${worker.id}/id-card/`}
            target="_blank"
            rel="noreferrer"
          >
            Download ID Card
          </a>

          <div className="mobile-card">
            <h3>My Attendance</h3>

            {attendance.length === 0 && <p>No attendance found.</p>}

            {attendance.map((item) => (
              <div className="attendance-row" key={item.id}>
                <p><b>Date:</b> {item.date}</p>
                <p><b>Status:</b> {item.status}</p>
                <p><b>Check In:</b> {item.check_in_time || "-"}</p>
                <p><b>Check Out:</b> {item.check_out_time || "-"}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default WorkerMobileApp;