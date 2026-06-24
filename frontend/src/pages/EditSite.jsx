import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import Layout from "./Layout";
import "./AddSite.css";

function EditSite() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    department: "",
    site_name: "",
    address: "",
    latitude: "",
    longitude: "",
    is_active: true,
  });

  useEffect(() => {
    loadDepartments();
    loadSite();
  }, [id]);

  const loadDepartments = async () => {
    try {
      const res = await API.get("departments/");
      setDepartments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSite = async () => {
    try {
      const res = await API.get(`work-sites/${id}/`);

      setForm({
        department: res.data.department || "",
        site_name: res.data.site_name || "",
        address: res.data.address || "",
        latitude: res.data.latitude || "",
        longitude: res.data.longitude || "",
        is_active: res.data.is_active,
      });
    } catch (error) {
      console.log(error);
      alert("Failed to load site");
    }
  };

  const updateSite = async (e) => {
    e.preventDefault();

    try {
      await API.put(`work-sites/${id}/`, form);

      alert("Site updated successfully");
      navigate("/sites");
    } catch (error) {
      console.log(error);
      alert("Failed to update site");
    }
  };

  return (
    <Layout>
      <div className="add-site-page">
        <h1>Edit Work Site</h1>
        <p>Update contractor work location details</p>

        <div className="add-site-card">
          <form onSubmit={updateSite}>
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
              value={form.site_name}
              onChange={(e) =>
                setForm({ ...form, site_name: e.target.value })
              }
              required
            />

            <label>Address</label>

            <textarea
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <label>Latitude</label>

            <input
              type="text"
              value={form.latitude}
              onChange={(e) =>
                setForm({ ...form, latitude: e.target.value })
              }
            />

            <label>Longitude</label>

            <input
              type="text"
              value={form.longitude}
              onChange={(e) =>
                setForm({ ...form, longitude: e.target.value })
              }
            />

            <label>Status</label>

            <select
              value={form.is_active ? "active" : "inactive"}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active: e.target.value === "active",
                })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="submit">Update Site</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default EditSite;