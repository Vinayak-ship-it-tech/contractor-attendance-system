import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./Organizations.css";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("departments/");
      setOrganizations(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load organizations");
    }
  };

  const saveOrganization = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Organization name is required");
      return;
    }

    try {
      if (editingId) {
        await API.put(`departments/${editingId}/`, {
          name: name.trim(),
        });

        alert("Organization updated successfully");
      } else {
        await API.post("departments/", {
          name: name.trim(),
        });

        alert("Organization added successfully");
      }

      setName("");
      setEditingId(null);
      fetchOrganizations();
    } catch (error) {
      console.log(error);
      alert("Failed to save organization");
    }
  };

  const editOrganization = (org) => {
    setEditingId(org.id);
    setName(org.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const deleteOrganization = async (org) => {
    const firstConfirm = window.confirm(
      `Are you sure you want to delete "${org.name}"?`
    );

    if (!firstConfirm) return;

    try {
      await API.delete(`departments/${org.id}/`);
      alert("Organization deleted successfully");
      fetchOrganizations();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        const data = error.response.data;

        const adminConfirm = window.confirm(
          `${data.message}\n\n` +
            `Sites: ${data.sites_count}\n` +
            `Work Photos: ${data.work_photos_count}\n` +
            `Attendance Records: ${data.attendance_count}\n\n` +
            `Do you still want to permanently delete this organization?`
        );

        if (adminConfirm) {
          await API.delete(`departments/${org.id}/?force=true`);
          alert("Organization deleted permanently");
          fetchOrganizations();
        }
      } else {
        console.log(error);
        alert("Failed to delete organization");
      }
    }
  };

  return (
    <Layout>
      <div className="org-page">
        <h1>Organizations</h1>

        <form className="org-form" onSubmit={saveOrganization}>
          <input
            type="text"
            placeholder="Enter organization name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button type="submit">
            {editingId ? "Update Organization" : "Add Organization"}
          </button>

          {editingId && (
            <button type="button" className="cancel-btn" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        <div className="org-list">
          {organizations.map((org) => (
            <div className="org-card" key={org.id}>
              <h3>{org.name}</h3>

              <div className="org-actions">
                <button onClick={() => editOrganization(org)}>Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => deleteOrganization(org)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Organizations;