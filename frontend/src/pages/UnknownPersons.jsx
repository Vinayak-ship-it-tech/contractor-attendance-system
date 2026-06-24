import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";

function UnknownPersons() {
  const [unknowns, setUnknowns] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState({});

  const loadUnknowns = () => {
    API.get("unknown-persons/")
      .then((res) => setUnknowns(res.data))
      .catch((err) => console.log(err));
  };

  const loadWorkers = () => {
    API.get("workers/")
      .then((res) => setWorkers(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadUnknowns();
    loadWorkers();
  }, []);

  const handleChange = (id, field, value) => {
    setFormData({
      ...formData,
      [id]: {
        ...formData[id],
        [field]: value,
      },
    });
  };

  const learnFace = async (unknownId) => {
    const selectedWorkerId = formData[unknownId]?.worker_id;

    if (!selectedWorkerId) {
      alert("Please select existing worker");
      return;
    }

    try {
      const res = await API.post("learn-unknown-face/", {
        unknown_id: unknownId,
        worker_id: selectedWorkerId,
      });

      alert(res.data.message);
      loadUnknowns();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Failed to learn face");
    }
  };

  const registerNewWorker = async (id) => {
    const data = formData[id];

    if (!data || !data.name) {
      alert("Please enter worker name");
      return;
    }

    try {
      await API.post("register-unknown-worker/", {
        unknown_id: id,
        name: data.name,
        phone: data.phone,
        worker_type: data.worker_type || "temporary",
        daily_wage: data.daily_wage || 0,
        hourly_wage: data.hourly_wage || 0,
      });

      alert("Unknown person registered successfully");
      loadUnknowns();
      loadWorkers();
    } catch (error) {
      console.log(error);
      alert("Failed to register unknown person");
    }
  };

  return (
    <Layout>
      <div className="page">
        <h2>AI Worker Recognition Learning</h2>

        {unknowns.length === 0 && <p>No unknown persons found.</p>}

        <div className="grid">
          {unknowns.map((person) => (
            <div className="worker-card" key={person.id}>
              {person.image && (
                <img src={person.image} alt="Unknown Person" />
              )}

              <p>Date: {person.date}</p>
              <p>Time: {person.time}</p>
              <p>Location: {person.location}</p>

              <h4>Learn as Existing Worker</h4>

              <select
                onChange={(e) =>
                  handleChange(person.id, "worker_id", e.target.value)
                }
              >
                <option value="">Select Existing Worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>

              <button onClick={() => learnFace(person.id)}>
                AI Learn Face
              </button>

              <hr />

              <h4>Or Register as New Worker</h4>

              <input
                placeholder="Worker Name"
                onChange={(e) =>
                  handleChange(person.id, "name", e.target.value)
                }
              />

              <input
                placeholder="Phone"
                onChange={(e) =>
                  handleChange(person.id, "phone", e.target.value)
                }
              />

              <select
                defaultValue="temporary"
                onChange={(e) =>
                  handleChange(person.id, "worker_type", e.target.value)
                }
              >
                <option value="temporary">Temporary</option>
                <option value="permanent">Permanent</option>
              </select>

              <input
                type="number"
                placeholder="Daily Wage"
                onChange={(e) =>
                  handleChange(person.id, "daily_wage", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Hourly Wage"
                onChange={(e) =>
                  handleChange(person.id, "hourly_wage", e.target.value)
                }
              />

              <button onClick={() => registerNewWorker(person.id)}>
                Register New Worker
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default UnknownPersons;