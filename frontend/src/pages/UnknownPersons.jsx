import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";

function UnknownPersons() {
  const [unknowns, setUnknowns] = useState([]);
  const [formData, setFormData] = useState({});

  const loadUnknowns = () => {
    API.get("unknown-persons/")
      .then((res) => setUnknowns(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadUnknowns();
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

  const registerPerson = async (id) => {
    const data = formData[id];

    if (!data || !data.name) {
      alert("Please enter worker name");
      return;
    }

    try {
      await API.post(`register-unknown/${id}/`, data);
      alert("Unknown person registered successfully");
      loadUnknowns();
    } catch (error) {
      console.log(error);
      alert("Failed to register unknown person");
    }
  };

  return (
    <Layout>
      <div className="page">
        <h2>Unknown Persons</h2>

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

              <button onClick={() => registerPerson(person.id)}>
                Register Worker
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default UnknownPersons;