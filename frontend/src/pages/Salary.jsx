import React, { useState } from "react";
import API from "../api";
import Layout from "./Layout";

function Salary() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSalary = async () => {
    if (!month || !year) {
      alert("Please enter month and year");
      return;
    }

    try {
      setLoading(true);

      API.get(id ? `salary/${month}/${year}/?department_id=${id}` : `salary/${month}/${year}/`)
      setSalary(res.data);

    } catch (error) {
      console.log(error);
      alert("Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (salary.length === 0) {
      alert("No salary data available");
      return;
    }

    let csv =
      "Worker,Present Days,Total Hours,Daily Wage,Hourly Wage,Salary Type,Total Salary\n";

    salary.forEach((item) => {
      csv += `${item.worker},${item.present_days},${item.total_hours},${item.daily_wage},${item.hourly_wage},${item.salary_type},${item.salary}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `salary_${month}_${year}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="page">
        <div className="card">
          <h2>Monthly Salary Calculation</h2>

          <input
            type="number"
            placeholder="Month (Ex: 6)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <input
            type="number"
            placeholder="Year (Ex: 2026)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <button onClick={getSalary}>
            {loading ? "Calculating..." : "Calculate Salary"}
          </button>

          <button onClick={exportCSV}>
            Download Excel CSV
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Present Days</th>
              <th>Total Hours</th>
              <th>Daily Wage</th>
              <th>Hourly Wage</th>
              <th>Salary Type</th>
              <th>Total Salary</th>
            </tr>
          </thead>

          <tbody>
            {salary.map((item, index) => (
              <tr key={index}>
                <td>{item.worker}</td>
                <td>{item.present_days}</td>
                <td>{item.total_hours}</td>
                <td>₹{item.daily_wage}</td>
                <td>₹{item.hourly_wage}</td>
                <td>{item.salary_type}</td>
                <td>₹{item.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Salary;