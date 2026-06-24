import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import { useParams } from "react-router-dom";

function WorkPhotos() {
  const [sites, setSites] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [form, setForm] = useState({
    site: "",
    bill_month: "",
    photo_type: "before",
    description: "",
  });

  const [photo, setPhoto] = useState(null);

  const loadSites = async () => {
    const res = await API.get("sites/");
    setSites(res.data);
  };

  const loadPhotos = async () => {
    const res = await API.get(id ? `work-photos/?department_id=${id}` : "work-photos/");
    setPhotos(res.data);
  };

  useEffect(() => {
    loadSites();
    loadPhotos();
  }, []);

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!form.site || !form.bill_month || !photo) {
      alert("Site, bill month and photo required");
      return;
    }

    const data = new FormData();
    data.append("site", form.site);
    data.append("bill_month", form.bill_month);
    data.append("photo_type", form.photo_type);
    data.append("description", form.description);
    data.append("photo", photo);

    await API.post("work-photos/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Work photo uploaded");
    setPhoto(null);
    loadPhotos();
  };

  const downloadPDF = () => {
    if (!form.site || !form.bill_month) {
      alert("Select site and bill month first");
      return;
    }

    const date = new Date(form.bill_month);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    window.open(
      `http://127.0.0.1:8000/api/work-photos/pdf/${form.site}/${month}/${year}/`,
      "_blank"
    );
  };

  return (
    <Layout>
      <div className="page">
        <div className="card">
          <h2>Upload Work Photos</h2>

          <form onSubmit={uploadPhoto}>
            <select
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
            >
              <option value="">Select Site</option>

              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.department_name} - {site.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.bill_month}
              onChange={(e) =>
                setForm({ ...form, bill_month: e.target.value })
              }
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
              onChange={(e) => setPhoto(e.target.files[0])}
            />

            <button type="submit">Upload Photo</button>
            <button type="button" onClick={downloadPDF}>
              Download PDF
            </button>
          </form>
        </div>

        <div className="grid">
          {photos.map((item) => (
            <div className="worker-card" key={item.id}>
              <img src={item.photo} alt="Work" />
              <h3>{item.site_name}</h3>
              <p>{item.department_name}</p>
              <p>Type: {item.photo_type}</p>
              <p>Date: {item.bill_month}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default WorkPhotos;
