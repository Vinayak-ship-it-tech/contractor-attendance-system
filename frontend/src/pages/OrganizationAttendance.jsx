import React, { useEffect, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";
import Layout from "./Layout";

function OrganizationAttendance() {
  const { id } = useParams();

  const [organization, setOrganization] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchOrganization();
    fetchAttendance();
  }, [id]);

  const fetchOrganization = async () => {
    try {
      const res = await API.get(`departments/${id}/`);
      setOrganization(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get(`attendance/?department_id=${id}`);
      setAttendance(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load organization attendance");
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1>
          {organization ? organization.name : "Organization"} Attendance
        </h1>

        <table>
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Worker Name</th>
              <th>Date</th>
              <th>Location of Work</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No attendance records found
                </td>
              </tr>
            ) : (
              attendance.map((item) => (
                <tr key={item.id}>
                  <td>{item.worker}</td>
                  <td>{item.worker_name || item.worker}</td>
                  <td>{item.date}</td>
                  <td>{item.location || "Not available"}</td>
                  <td>{item.check_in_time || "-"}</td>
                  <td>{item.check_out_time || "-"}</td>
                  <td>
                    {item.check_in_time ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        Present
                      </span>
                    ) : (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        Absent
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default OrganizationAttendance;