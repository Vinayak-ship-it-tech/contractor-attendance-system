import React, { useState } from "react";
import API from "../api";
import Layout from "./Layout";

function SmartReports() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!month || !year) {
      alert("Please enter month and year");
      return;
    }

    try {
      setLoading(true);

      const res = await API.get(`smart-reports/${month}/${year}/`);

      setReport(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load smart report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1>Smart Reports</h1>

        <div className="card">
          <input
            type="number"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <button onClick={fetchReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {report && (
          <>
            <div className="dashboard-grid">
              <div className="dash-card">
                <h3>Total Workers</h3>
                <h2>{report.summary.total_workers}</h2>
              </div>

              <div className="dash-card">
                <h3>Total Present Days</h3>
                <h2>{report.summary.total_present_days}</h2>
              </div>

              <div className="dash-card">
                <h3>Total Hours</h3>
                <h2>{report.summary.total_work_hours}</h2>
              </div>

              <div className="dash-card">
                <h3>Total Salary</h3>
                <h2>₹{report.summary.total_salary}</h2>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Type</th>
                  <th>Present Days</th>
                  <th>Total Hours</th>
                  <th>Salary Type</th>
                  <th>Gross Salary</th>
                </tr>
              </thead>

              <tbody>
                {report.workers && report.workers.length > 0 ? (
                  report.workers.map((item) => (
                    <tr key={item.worker_id}>
                      <td>{item.worker_name}</td>
                      <td>{item.worker_type}</td>
                      <td>{item.present_days}</td>
                      <td>{item.total_hours}</td>
                      <td>{item.salary_type}</td>
                      <td>₹{item.gross_salary}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No worker report data found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Layout>
  );
}

export default SmartReports;