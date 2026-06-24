import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import API from "../api";
import Layout from "./Layout";
import "./AddWorker.css";

function AddWorker() {
  const [workSites, setWorkSites] = useState([]);
  const webcamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    worker_type: "permanent",
    daily_wage: "",
    hourly_wage: "",
    work_site: "",
    face_image: null,
  });

  useEffect(() => {
    API.get("work-sites/")
      .then((res) => setWorkSites(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "face_image") {
      setForm({ ...form, face_image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const capturePhoto = () => {
  const image = webcamRef.current.getScreenshot();

  setImageSrc(image);

  fetch(image)
    .then((res) => res.blob())
    .then((blob) => {
      const file = new File(
        [blob],
        `worker_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      setForm({
        ...form,
        face_image: file,
      });
    });
};

  const submitWorker = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      if (form[key] !== "" && form[key] !== null) {
        data.append(key, form[key]);
      }
    });

    try {
      await API.post("workers/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Worker added successfully");

      setForm({
        name: "",
        age: "",
        phone: "",
        worker_type: "permanent",
        daily_wage: "",
        hourly_wage: "",
        work_site: "",
        face_image: null,
      });
    } catch (error) {
      console.log(error);
      alert("Failed to add worker");
    }
  };

  return (
    <Layout>
      <div className="add-worker-page">
        <div className="worker-header">
          <div>
            <h1 className="gradient-title">
              Add New Worker
            </h1>
            <p>Register permanent or temporary workers with face photo.</p>
          </div>
        </div>

        <form className="worker-form-card" onSubmit={submitWorker}>
          <div className="form-grid">
            <div className="input-box">
              <label>Worker Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label>Worker Type</label>
              <select
                name="worker_type"
                value={form.worker_type}
                onChange={handleChange}
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div className="input-box">
              <label>Daily Wage</label>
              <input
                type="number"
                name="daily_wage"
                value={form.daily_wage}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label>Hourly Wage</label>
              <input
                type="number"
                name="hourly_wage"
                value={form.hourly_wage}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label>Work Site</label>
              <select
                name="work_site"
                value={form.work_site}
                onChange={handleChange}
              >
                <option value="">Select Work Site</option>
                {workSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.site_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-box camera-input-box">
              <label>Face Photo</label>

              <div className="photo-actions">
                <label className="upload-photo-btn">
                  Upload Photo
                  <input
                    type="file"
                    name="face_image"
                    accept="image/*"
                    onChange={handleChange}
                    hidden
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setCameraOpen(!cameraOpen)}
                  className="camera-btn"
                >
                  📷 {cameraOpen ? "Close Camera" : "Open Camera"}
                </button>
              </div>

              {cameraOpen && (
                <div className="camera-box">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={320}
                    videoConstraints={{
                      facingMode: "user",
                    }}
                  />

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="capture-btn"
                  >
                    Capture Photo
                  </button>
                </div>
              )}

              {imageSrc && (
                <div className="preview-box">
                  <p>Captured Preview</p>
                  <img src={imageSrc} alt="preview" className="preview-img" />
                </div>
              )}
            </div>
          </div>

          <button className="save-worker-btn" type="submit">
            Save Worker
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AddWorker;