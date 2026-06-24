import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./AddSite.css";

function AddSite() {
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
  department: "",
  site_name: "",
  address: "",
  latitude: "",
  longitude: "",
});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await API.get("departments/");
      setDepartments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addSite = async (e) => {
    e.preventDefault();

    try {
      await API.post("work-sites/", form);

      alert("Site added successfully");

      setForm({
        department: "",
        site_name: "",
        address: "",
        latitude: "",
        longitude: "",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to add site");
    }
  };

  return (
    <Layout>
      <div className="add-site-page">
        <h1>Add Work Site</h1>
        <p>Create a new contractor work location</p>

        <div className="add-site-card">
          <form onSubmit={addSite}>
            <label>Organization / Department</label>
            <select
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            >
              <option value="">Select Organization</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <label>Site Name</label>
            <input
              type="text"
              placeholder="Example: GVMC Park Site"
              value={form.site_name}
              onChange={(e) =>
                setForm({ ...form, site_name: e.target.value })
              }
              required
            />

            <label>Address</label>
            <textarea
              placeholder="Enter site address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <label>Latitude</label>
            <input
              type="text"
              placeholder="Example: 17.6868"
              value={form.latitude}
              onChange={(e) =>
                setForm({ ...form, latitude: e.target.value })
              }
            />

            <label>Longitude</label>
            <input
              type="text"
              placeholder="Example: 83.2185"
              value={form.longitude}
              onChange={(e) =>
                setForm({ ...form, longitude: e.target.value })
              }
            />

            <button type="submit">Save Site</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AddSite;