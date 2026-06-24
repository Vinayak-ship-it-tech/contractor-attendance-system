import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./WorkPhotosPage.css";

function WorkPhotosPage() {
  const [sites, setSites] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [form, setForm] = useState({
    site: "",
    bill_month: "",
    photo_type: "before",
    description: "",
    photo: null,
  });

  useEffect(() => {
    loadSites();
    loadPhotos();
  }, []);

  const loadSites = async () => {
    const res = await API.get("sites/");
    setSites(res.data);
  };

  const loadPhotos = async () => {
    const res = await API.get("work-photos/");
    setPhotos(res.data);
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("site", form.site);
    data.append("bill_month", form.bill_month);
    data.append("photo_type", form.photo_type);
    data.append("description", form.description);
    data.append("photo", form.photo);

    try {
      await API.post("work-photos/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Work photo uploaded successfully");
      loadPhotos();
    } catch (error) {
      console.log(error);
      alert("Failed to upload work photo");
    }
  };

  return (
    <Layout>
      <div className="work-photo-page">
        <h1>Work Photos</h1>
        <p>Upload before, during, and after work photos for bill proof</p>

        <div className="work-photo-card">
          <form onSubmit={uploadPhoto}>
            <select
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              required
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.bill_month}
              onChange={(e) =>
                setForm({ ...form, bill_month: e.target.value })
              }
              required
            />

            <select
              value={form.photo_type}
              onChange={(e) =>
                setForm({ ...form, photo_type: e.target.value })
              }
            >
              <option value="before">Before Work</option>
              <option value="during">During Work</option>
              <option value="after">After Work</option>
            </select>

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, photo: e.target.files[0] })
              }
              required
            />

            <button type="submit">Upload Photo</button>
          </form>
        </div>

        <div className="photo-grid">
          {photos.map((item) => (
            <div className="photo-card" key={item.id}>
              <img src={item.photo} alt="work" />
              <h3>{item.photo_type}</h3>
              <p>{item.description || "No description"}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default WorkPhotosPage;