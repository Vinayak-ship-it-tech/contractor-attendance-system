import React, { useEffect, useState } from "react";
import API from "../../api";
import Layout from "../Layout";
import "./UnknownPersons.css";

function UnknownPersons() {
  const [unknowns, setUnknowns] = useState([]);
  const [selectedUnknown, setSelectedUnknown] = useState(null);

  const [workerData, setWorkerData] = useState({
    name: "",
    age: "",
    phone: "",
    worker_type: "temporary",
    daily_wage: "",
    hourly_wage: "",
  });

  useEffect(() => {
    loadUnknowns();
  }, []);

  const loadUnknowns = async () => {
    try {
      const res = await API.get("unknown-persons/");
      setUnknowns(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load unknown persons");
    }
  };

  const registerWorker = async (e) => {
    e.preventDefault();

    if (!selectedUnknown) {
      alert("Please select unknown person");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("unknown_id", selectedUnknown.id);
      formData.append("name", workerData.name);
      formData.append("age", workerData.age);
      formData.append("phone", workerData.phone);
      formData.append("worker_type", workerData.worker_type);
      formData.append("daily_wage", workerData.daily_wage);
      formData.append("hourly_wage", workerData.hourly_wage);

      await API.post("register-unknown-worker/", formData);

      alert("Unknown person registered as worker");

      setSelectedUnknown(null);
      setWorkerData({
        name: "",
        age: "",
        phone: "",
        worker_type: "temporary",
        daily_wage: "",
        hourly_wage: "",
      });

      loadUnknowns();
    } catch (error) {
      console.log(error);
      alert("Failed to register worker");
    }
  };

  return (
    <Layout>
      <div className="unknown-page">
        <h1>Unknown Persons</h1>
        <p>Faces detected in group photos but not registered as workers</p>

        {unknowns.length === 0 && (
          <div className="empty-card">No unknown persons found</div>
        )}

        <div className="unknown-grid">
          {unknowns.map((person) => (
            <div className="unknown-card" key={person.id}>
              <img src={person.image} alt="Unknown Person" />

              <h3>Unknown Person #{person.id}</h3>

              <p>
                <b>Date:</b> {person.date}
              </p>

              <p>
                <b>Time:</b> {person.time}
              </p>

              <p>
                <b>Location:</b> {person.location || "No location"}
              </p>

              <button onClick={() => setSelectedUnknown(person)}>
                Register as Worker
              </button>
            </div>
          ))}
        </div>

        {selectedUnknown && (
          <div className="register-card">
            <h2>Register Unknown Person</h2>

            <img
              src={selectedUnknown.image}
              alt="Selected Unknown"
              className="selected-img"
            />

            <form onSubmit={registerWorker}>
              <input
                type="text"
                placeholder="Worker Name"
                value={workerData.name}
                onChange={(e) =>
                  setWorkerData({ ...workerData, name: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Age"
                value={workerData.age}
                onChange={(e) =>
                  setWorkerData({ ...workerData, age: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={workerData.phone}
                onChange={(e) =>
                  setWorkerData({ ...workerData, phone: e.target.value })
                }
              />

              <select
                value={workerData.worker_type}
                onChange={(e) =>
                  setWorkerData({
                    ...workerData,
                    worker_type: e.target.value,
                  })
                }
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </select>

              <input
                type="number"
                placeholder="Daily Wage"
                value={workerData.daily_wage}
                onChange={(e) =>
                  setWorkerData({ ...workerData, daily_wage: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Hourly Wage"
                value={workerData.hourly_wage}
                onChange={(e) =>
                  setWorkerData({ ...workerData, hourly_wage: e.target.value })
                }
              />

              <div className="form-actions">
                <button type="submit">Save Worker</button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedUnknown(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UnknownPersons;