import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./WorkerProfile.css";

function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const fetchWorker = async () => {
    try {
      const res = await API.get(`workers/${id}/`);
      setWorker(res.data);
    } catch (error) {
      console.log(error);
      alert("Worker details not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="worker-profile-page">Loading...</div>;
  }

  if (!worker) {
    return <div className="worker-profile-page">No worker found</div>;
  }

  return (
    <div className="worker-profile-page">
      <button className="back-btn" onClick={() => navigate("/workers")}>
        ← Back to Workers
      </button>

      <div className="profile-card">
        <div className="profile-top">
          <img
            src={worker.photo || "https://via.placeholder.com/150"}
            alt="Worker"
            className="profile-img"
          />

          <div>
            <h1>{worker.name}</h1>
            <p>Worker ID: #{worker.id}</p>
            <span className="status-badge">Active</span>
          </div>
        </div>

        <div className="details-grid">
          <div>
            <label>Phone</label>
            <h3>{worker.phone || "Not added"}</h3>
          </div>

          <div>
            <label>Daily Wage</label>
            <h3>₹{worker.daily_wage || 0}</h3>
          </div>

          <div>
            <label>Address</label>
            <h3>{worker.address || "Not added"}</h3>
          </div>

          <div>
            <label>Organization</label>
            <h3>{worker.organization_name || "Not assigned"}</h3>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <h2>0</h2>
          <p>Present Days</p>
        </div>

        <div className="summary-card">
          <h2>0</h2>
          <p>Absent Days</p>
        </div>

        <div className="summary-card">
          <h2>0 hrs</h2>
          <p>Total Hours</p>
        </div>

        <div className="summary-card">
          <h2>₹0</h2>
          <p>This Month Salary</p>
        </div>
      </div>
    </div>
  );
}

export default WorkerProfile;