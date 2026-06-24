import React, { useEffect, useState } from "react";
import axios from "axios";

function AttendanceAnomalies() {
  const [data, setData] = useState({
    date: "",
    total_anomalies: 0,
    anomalies: [],
  });

  const fetchAnomalies = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/attendance-anomalies/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch anomalies");
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <div className="page">
      <h1>Attendance Anomaly Detection</h1>

      <div className="card">
        <h2>Total Anomalies: {data.total_anomalies}</h2>
        <p>Date: {data.date}</p>
        <button onClick={fetchAnomalies}>Refresh</button>
      </div>

      <div className="grid">
        {data.anomalies.map((item, index) => (
          <div className="worker-card" key={index}>
            <h3>{item.type}</h3>
            <p><b>Worker:</b> {item.worker}</p>
            <p>{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttendanceAnomalies;