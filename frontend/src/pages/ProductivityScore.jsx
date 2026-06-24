import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";

function ProductivityScore() {
  const [scores, setScores] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const fetchScores = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `productivity-score/${month}/${year}/`
      );

      setScores(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load productivity scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <Layout>
      <div className="page">
        <h1>Worker Productivity Score</h1>

        <div className="card">
          <div className="filter-box">
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Month"
            />

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year"
            />

            <button onClick={fetchScores}>
              {loading ? "Loading..." : "Check"}
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Present Days</th>
              <th>Total Hours</th>
              <th>Score</th>
              <th>Rating</th>
            </tr>
          </thead>

          <tbody>
            {scores.length > 0 ? (
              scores.map((item) => (
                <tr key={item.worker_id}>
                  <td>{item.worker_name}</td>
                  <td>{item.present_days}</td>
                  <td>{item.total_hours}</td>
                  <td>{item.final_score}/100</td>
                  <td>{item.rating}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No productivity data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default ProductivityScore;