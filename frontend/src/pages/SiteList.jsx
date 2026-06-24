import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Layout from "./Layout";
import "./SiteList.css";

function SiteList() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await API.get("work-sites/");
      setSites(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load sites");
    }
  };

  const deleteSite = async (id) => {
  if (!window.confirm("Are you sure you want to delete this site?")) return;

  try {
    await API.delete(`work-sites/${id}/`);
    alert("Site deleted successfully");
    loadSites();
  } catch (error) {
    console.log(error);
    alert("Failed to delete site");
  }
};

const toggleSiteStatus = async (site) => {
  try {
    await API.patch(`work-sites/${site.id}/`, {
      is_active: !site.is_active,
    });

    loadSites();
  } catch (error) {
    console.log(error);
    alert("Failed to update site status");
  }
};

  return (
    <Layout>
      <div className="sites-page">
        <h1>Work Sites</h1>
        <p>Manage all contractor work locations</p>

        <button className="add-site-btn" onClick={() => navigate("/sites/add")}>
        + Add Site
        </button>

        <div className="sites-grid">
          {sites.map((site) => (
            <div className="site-card" key={site.id}>
              <h2>{site.site_name}</h2>

              <p>
                <b>Address:</b> {site.address || "No address"}
              </p>

              <p>
                <b>Latitude:</b> {site.latitude || "Not added"}
              </p>

              <p>
                <b>Longitude:</b> {site.longitude || "Not added"}
              </p>

              <p>
                <b>Status:</b>{" "}
                <span className={site.is_active ? "active" : "inactive"}>
                    {site.is_active ? "Active" : "Inactive"}
                </span>
                </p>

                <div className="site-actions">
                <button
                    className="edit-btn"
                    onClick={() => navigate(`/sites/edit/${site.id}`)}
                >
                    Edit
                </button>

                <button
                    className="status-btn"
                    onClick={() => toggleSiteStatus(site)}
                >
                    {site.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                    className="delete-btn"
                    onClick={() => deleteSite(site.id)}
                >
                    Delete
                </button>
                </div>
            </div>
          ))}
        </div>

        {sites.length === 0 && (
          <div className="empty-card">No work sites found</div>
        )}
      </div>
    </Layout>
  );
}

export default SiteList;