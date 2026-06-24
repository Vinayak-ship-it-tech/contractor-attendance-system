import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Layout from "./Layout";

function WorkerList() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [editingWorker, setEditingWorker] = useState(null);
  const [search, setSearch] = useState("");

  const loadWorkers = () => {
    API.get("workers/")
      .then((res) => setWorkers(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) =>
    worker.name?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteWorker = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;

    try {
      await API.delete(`workers/${id}/`);
      alert("Worker deleted");
      loadWorkers();
    } catch (error) {
      console.log(error);
      alert("Failed to delete worker");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.post(`workers/${id}/toggle-status/`);
      loadWorkers();
    } catch (error) {
      console.log(error);
      alert("Failed to update status");
    }
  };

  const updateWorker = async (e) => {
    e.preventDefault();

    try {
      await API.put(`workers/${editingWorker.id}/`, editingWorker);
      alert("Worker updated successfully");
      setEditingWorker(null);
      loadWorkers();
    } catch (error) {
      console.log(error);
      alert("Failed to update worker");
    }
  };

  return (
    <Layout>
      <div className="page">
        <h2>Workers List</h2>

        <div className="card">
          <h2>Search Worker Details</h2>

          <input
            type="text"
            placeholder="Search by worker name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {editingWorker && (
          <div className="card">
            <h2>Edit Worker</h2>

            <form onSubmit={updateWorker}>
              <input
                value={editingWorker.name || ""}
                onChange={(e) =>
                  setEditingWorker({ ...editingWorker, name: e.target.value })
                }
                placeholder="Worker Name"
              />

              <input
                type="number"
                value={editingWorker.age || ""}
                onChange={(e) =>
                  setEditingWorker({ ...editingWorker, age: e.target.value })
                }
                placeholder="Age"
              />

              <input
                value={editingWorker.phone || ""}
                onChange={(e) =>
                  setEditingWorker({ ...editingWorker, phone: e.target.value })
                }
                placeholder="Phone Number"
              />

              <select
                value={editingWorker.worker_type || "permanent"}
                onChange={(e) =>
                  setEditingWorker({
                    ...editingWorker,
                    worker_type: e.target.value,
                  })
                }
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </select>

              <input
                type="number"
                value={editingWorker.daily_wage || ""}
                onChange={(e) =>
                  setEditingWorker({
                    ...editingWorker,
                    daily_wage: e.target.value,
                  })
                }
                placeholder="Daily Wage"
              />

              <input
                type="number"
                value={editingWorker.hourly_wage || ""}
                onChange={(e) =>
                  setEditingWorker({
                    ...editingWorker,
                    hourly_wage: e.target.value,
                  })
                }
                placeholder="Hourly Wage"
              />

              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditingWorker(null)}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {filteredWorkers.length === 0 && <p>No workers found.</p>}

        <div className="grid">
          {filteredWorkers.map((worker) => (
            <div className="worker-card" key={worker.id}>
              {worker.face_image && (
                <img src={worker.face_image} alt={worker.name} />
              )}

              <h3>{worker.name}</h3>

              <p>
                <b>Age:</b> {worker.age || "Not added"}
              </p>

              <p>
                <b>Phone:</b> {worker.phone || "No phone"}
              </p>

              <p>
                <b>Designation:</b> {worker.worker_type}
              </p>

              <p>
                <b>Daily Pay:</b> ₹{worker.daily_wage}
              </p>

              <p>
                <b>Hourly Pay:</b> ₹{worker.hourly_wage}
              </p>

              <p>
                <b>Status:</b>{" "}
                <b className={worker.is_active ? "active" : "inactive"}>
                  {worker.is_active ? "Active" : "Inactive"}
                </b>
              </p>

              <button onClick={() => navigate(`/workers/${worker.id}`)}>
                View
              </button>

              <button onClick={() => setEditingWorker(worker)}>Edit</button>

              <button onClick={() => toggleStatus(worker.id)}>
                {worker.is_active ? "Deactivate" : "Activate"}
              </button>
                

              <button onClick={() => deleteWorker(worker.id)}>
                Delete
              </button>

              <a
                href={`${API.defaults.baseURL}workers/${worker.id}/id-card/`}
                target="_blank"
                rel="noreferrer"
                className="id-card-btn"
              >
                Download ID Card
              </a>
              
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default WorkerList;