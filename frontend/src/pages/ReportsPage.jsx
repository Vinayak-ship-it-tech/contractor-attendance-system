import React, { useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./ReportsPage.css";

function ReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const downloadReport = async () => {
    try {
      const res = await API.get(`reports/monthly/${month}/${year}/`, {
        responseType: "blob",
      });

      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = fileURL;
      link.setAttribute("download", `salary_report_${month}_${year}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error);
      alert("Failed to download report");
    }
  };

  return (
    <Layout>
      <div className="reports-page">
        <h1>Reports</h1>
        <p>Download monthly attendance and salary reports</p>

        <div className="report-card">
          <h2>Monthly Salary Report</h2>

          <div className="report-filter">
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

            <button onClick={downloadReport}>Download PDF</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ReportsPage;