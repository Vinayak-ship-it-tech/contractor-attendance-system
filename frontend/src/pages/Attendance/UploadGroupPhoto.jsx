import React, { useEffect, useState } from "react";
import API from "../../api";
import Layout from "../Layout";
import "./UploadGroupPhoto.css";

function UploadGroupPhoto() {
const [selectedUnknown, setSelectedUnknown] = useState(null);
const [newWorker, setNewWorker] = useState({
  name: "",
  age: "",
  phone: "",
  worker_type: "temporary",
  daily_wage: "",
  hourly_wage: "",
});
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState("");
  const [workSites, setWorkSites] = useState([]);
  const [workSite, setWorkSite] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  API.get("work-sites/")
    .then((res) => setWorkSites(res.data))
    .catch((err) => console.log(err));
}, []);

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!photo) {
      alert("Please select group photo");
      return;
    }

    const formData = new FormData();
    formData.append("group_photo", photo);
    formData.append("location", location);
    formData.append("work_site", workSite);

    try {
      setLoading(true);

      const res = await API.post("upload-group-photo/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(res.data);
      alert("Attendance processed successfully");
    } catch (error) {
  console.log(error);

  const reader = new FileReader();

  reader.onloadend = () => {
    saveOfflineAttendance({
      type: "group_photo",
      group_photo_base64: reader.result,
      file_name: photo.name,
      location: location,
      work_site: formData.get("work_site"),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
    });

    alert("Backend/internet not available. Group photo saved offline.");
  };

  reader.readAsDataURL(photo);
}
  };

  const registerUnknownWorker = async (e) => {
  e.preventDefault();

  if (!selectedUnknown) {
    alert("Please select unknown face");
    return;
  }

  const formData = new FormData();

  formData.append("unknown_id", selectedUnknown.id);
  formData.append("name", newWorker.name);
  formData.append("age", newWorker.age);
  formData.append("phone", newWorker.phone);
  formData.append("worker_type", newWorker.worker_type);
  formData.append("daily_wage", newWorker.daily_wage);
  formData.append("hourly_wage", newWorker.hourly_wage);

  try {
    await API.post("register-unknown-worker/", formData);
    alert("Unknown person registered as worker");

    setSelectedUnknown(null);
    setNewWorker({
      name: "",
      age: "",
      phone: "",
      worker_type: "temporary",
      daily_wage: "",
      hourly_wage: "",
    });
  } catch (error) {
    console.log(error);
    alert("Failed to register unknown worker");
  }
};

  return (
    <Layout>
      <div className="upload-page">
        <h1>Upload Group Photo</h1>
        <p>Upload group photo to mark worker attendance automatically</p>

        <div className="upload-card">
          <form onSubmit={uploadPhoto}>
            <label>Group Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
            />

            <label>Location</label>
<input
  type="text"
  placeholder="Example: Site A, Gajuwaka"
  value={location}
  onChange={(e) => setLocation(e.target.value)}
/>

              <label>Work Site</label>
              <select value={workSite} onChange={(e) => setWorkSite(e.target.value)}>
                <option value="">Select Work Site</option>
                {workSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.site_name}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Upload & Mark Attendance"}
            </button>
          </form>
        </div>

        {result && (
            <div className="result-card">
                <h2>Attendance Result</h2>

                <div className="result-summary">
                <div>
                    <h3>{result.matched_workers?.length || 0}</h3>
                    <p>Matched Workers</p>
                </div>

                <div>
                    <h3>{result.unknown_faces?.length || 0}</h3>
                    <p>Unknown Faces</p>
                </div>

                <div>
                    <h3>{result.already_marked?.length || 0}</h3>
                    <p>Already Marked</p>
                </div>
                </div>

                <h3 className="section-title">Matched Workers</h3>

                {result.matched_workers?.length > 0 ? (
                <div className="matched-list">
                    {result.matched_workers.map((worker, index) => (
                    <div className="matched-item" key={index}>
                        ✅ {worker.name || worker.worker_name || worker}
                    </div>
                    ))}
                </div>
                ) : (
                <p>No matched workers found</p>
                )}

                <h3 className="section-title">Unknown Faces</h3>

                {result.unknown_faces?.length > 0 ? (
                <div className="unknown-grid">
                    {result.unknown_faces.map((face, index) => (
                    <div className="unknown-card" key={index}>
                        {face.image && (
                        <img src={face.image} alt="Unknown Face" />
                        )}

                        <p>Unknown Person #{index + 1}</p>

                        <button onClick={() => setSelectedUnknown(face)}>
                        Register as Worker
                        </button>
                    </div>
                    ))}
                </div>
                ) : (
                <p>No unknown faces found</p>
                )}
                {selectedUnknown && (
  <div className="register-unknown-card">
    <h2>Register Unknown Person</h2>

    {selectedUnknown.image && (
      <img
        src={selectedUnknown.image}
        alt="Unknown"
        className="selected-unknown-img"
      />
    )}

    <form onSubmit={registerUnknownWorker}>
      <input
        type="text"
        placeholder="Worker Name"
        value={newWorker.name}
        onChange={(e) =>
          setNewWorker({ ...newWorker, name: e.target.value })
        }
        required
      />

      <input
        type="number"
        placeholder="Age"
        value={newWorker.age}
        onChange={(e) =>
          setNewWorker({ ...newWorker, age: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={newWorker.phone}
        onChange={(e) =>
          setNewWorker({ ...newWorker, phone: e.target.value })
        }
      />

      <select
        value={newWorker.worker_type}
        onChange={(e) =>
          setNewWorker({ ...newWorker, worker_type: e.target.value })
        }
      >
        <option value="permanent">Permanent</option>
        <option value="temporary">Temporary</option>
      </select>

      <input
        type="number"
        placeholder="Daily Wage"
        value={newWorker.daily_wage}
        onChange={(e) =>
          setNewWorker({ ...newWorker, daily_wage: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Hourly Wage"
        value={newWorker.hourly_wage}
        onChange={(e) =>
          setNewWorker({ ...newWorker, hourly_wage: e.target.value })
        }
      />

      <div className="form-actions">
        <button type="submit">Save Worker</button>

        <button
          type="button"
          className="cancel-btn"
          onClick={() => setSelectedUnknown(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}
            </div>
            )}
      </div>
    </Layout>
  );
}

export default UploadGroupPhoto;