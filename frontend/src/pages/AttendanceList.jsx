import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";

function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState("");
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState({});

  const loadAttendance = () => {
    let url = "attendance/";

    if (date) {
      url = `attendance/?date=${date}`;
    }

    API.get(url)
      .then((res) => setAttendance(res.data))
      .catch((err) => console.log(err));
  };

  const loadWorkers = () => {
    API.get("workers/")
      .then((res) => setWorkers(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadAttendance();
    loadWorkers();
  }, []);

  const correctAttendance = async (attendanceId) => {
    const workerId = selectedWorker[attendanceId];

    if (!workerId) {
      alert("Please select correct worker");
      return;
    }

    try {
      await API.post(`attendance/${attendanceId}/correct/`, {
        corrected_worker_id: workerId,
        reason: "AI wrong face match correction",
      });

      alert("Attendance corrected successfully");
      loadAttendance();
    } catch (error) {
      console.log(error);
      alert("Failed to correct attendance");
    }
  };

  const checkout = async (id) => {
    try {
      await API.post(`checkout/${id}/`);
      alert("Checked out successfully");
      loadAttendance();
    } catch (error) {
      console.log(error);
      alert("Checkout failed");
    }
  };

  return (
    <Layout>
      <div className="page">
        <h2>Attendance List</h2>

        <div className="card">
          <div className="filter-box">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button onClick={loadAttendance}>Filter</button>
          </div>
        </div>

        {attendance.length === 0 && <p>No attendance records found.</p>}

        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th>Location</th>
              <th>Correction</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((item) => (
              <tr key={item.id}>
                <td>{item.worker_name}</td>
                <td>{item.date}</td>
                <td>{item.check_in_time}</td>
                <td>{item.check_out_time || "Not checked out"}</td>
                <td>{item.total_hours}</td>

                <td>
                  {item.latitude && item.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Map
                    </a>
                  ) : (
                    item.location || "No location"
                  )}
                </td>

                <td>
                  <select
                    value={selectedWorker[item.id] || ""}
                    onChange={(e) =>
                      setSelectedWorker({
                        ...selectedWorker,
                        [item.id]: e.target.value,
                      })
                    }
                  >
                    <option value="">Correct Worker</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => correctAttendance(item.id)}>
                    Correct
                  </button>
                </td>

                <td>
                  {!item.check_out_time ? (
                    <button onClick={() => checkout(item.id)}>Check Out</button>
                  ) : (
                    "Done"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default AttendanceList;