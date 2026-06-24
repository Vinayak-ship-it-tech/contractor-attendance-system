import React, { useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./SalaryPage.css";

function SalaryPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryData, setSalaryData] = useState([]);

  const calculateSalary = async () => {
    try {
      const res = await API.get(`salary/${month}/${year}/`);
      setSalaryData(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to calculate salary");
    }
  };

  return (
    <Layout>
      <div className="salary-page">
        <h1>Salary Management</h1>
        <p>Calculate monthly salary based on attendance</p>

        <div className="salary-filter">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <button onClick={calculateSalary}>Calculate Salary</button>
        </div>

        <div className="salary-card">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Present Days</th>
                <th>Total Hours</th>
                <th>Daily Wage</th>
                <th>Hourly Wage</th>
                <th>Total Salary</th>
              </tr>
            </thead>

            <tbody>
              {salaryData.map((item, index) => (
                <tr key={index}>
                  <td>{item.worker_name}</td>
                  <td>{item.present_days}</td>
                  <td>{item.total_hours}</td>
                  <td>₹{item.daily_wage}</td>
                  <td>₹{item.hourly_wage}</td>
                  <td>
                    <b>₹{item.total_salary}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {salaryData.length === 0 && (
            <div className="no-data">No salary data found</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default SalaryPage;