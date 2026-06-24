import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./AssignWorkersToSite.css";

function AssignWorkersToSite() {
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");

  useEffect(() => {
    loadSites();
    loadWorkers();
  }, []);

  const loadSites = async () => {
    try {
      const res = await API.get("work-sites/");
      setSites(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadWorkers = async () => {
    try {
      const res = await API.get("workers/");
      setWorkers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const assignWorker = async (workerId) => {
    if (!selectedSite) {
      alert("Please select site first");
      return;
    }

    try {
      await API.patch(`workers/${workerId}/`, {
        work_site: selectedSite,
      });

      alert("Worker assigned to site");
      loadWorkers();
    } catch (error) {
      console.log(error);
      alert("Failed to assign worker");
    }
  };

  return (
    <Layout>
      <div className="assign-page">
        <h1>Assign Workers to Site</h1>
        <p>Select a work site and assign workers</p>

        <div className="assign-filter">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            <option value="">Select Work Site</option>

            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.site_name}
              </option>
            ))}
          </select>
        </div>

        <div className="assign-grid">
          {workers.map((worker) => (
            <div className="assign-card" key={worker.id}>
              {worker.face_image && (
                <img src={worker.face_image} alt={worker.name} />
              )}

              <h3>{worker.name}</h3>

              <p>
                <b>Phone:</b> {worker.phone || "No phone"}
              </p>

              <p>
                <b>Current Site:</b>{" "}
                {worker.work_site_name || "Not assigned"}
              </p>

              <button onClick={() => assignWorker(worker.id)}>
                Assign to Selected Site
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default AssignWorkersToSite;