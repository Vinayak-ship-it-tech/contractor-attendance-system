import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import API from "../api";
import Layout from "./Layout";
import {
  saveOfflineAttendance,
  syncOfflineAttendance,
} from "../utils/offlineAttendance";

function UploadAttendance() {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const webcamRef = useRef(null);

  const [sites, setSites] = useState([]);
  const [workSite, setWorkSite] = useState("");

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSites = async () => {
    try {
      const res = await API.get("work-sites/");
      setSites(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadSites();

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    window.addEventListener("online", syncOfflineAttendance);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", syncOfflineAttendance);
    };
  }, []);

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);
        setLocation(`${lat}, ${lng}`);
        setCurrentTime(new Date().toLocaleString());
      },
      () => {
        alert("Please allow location permission");
      }
    );
  };

  const handlePhotoCapture = (e) => {
    const selectedPhoto = e.target.files[0];

    if (selectedPhoto) {
      setPhoto(selectedPhoto);
      setPreview(URL.createObjectURL(selectedPhoto));
      autoDetectLocation();
      setCurrentTime(new Date().toLocaleString());
    }
  };

  const captureFromCamera = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      alert("Camera not ready");
      return;
    }

    setPreview(imageSrc);

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          `group_attendance_${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        setPhoto(file);
        autoDetectLocation();
        setCurrentTime(new Date().toLocaleString());
      });
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!workSite) {
      alert("Please select organization/site");
      return;
    }

    if (!photo) {
      alert("Please upload or capture group photo");
      return;
    }

    if (!latitude || !longitude) {
      alert("Location not detected. Please allow location permission.");
      return;
    }

    const formData = new FormData();
    formData.append("group_photo", photo);
    formData.append("work_site", workSite);
    formData.append("location", location);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    try {
      setLoading(true);

      const res = await API.post("upload-group-photo/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(res.data);
      alert("Attendance captured and stored successfully");
    } catch (error) {
      console.log(error);

      const reader = new FileReader();

      reader.onloadend = () => {
        saveOfflineAttendance({
          type: "group_photo",
          group_photo_base64: reader.result,
          file_name: photo?.name,
          work_site: workSite,
          location: location,
          latitude: latitude,
          longitude: longitude,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString(),
        });

        alert(
          "Internet/backend unavailable. Attendance saved offline and will sync later."
        );
      };

      reader.readAsDataURL(photo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="card">
          <h2 className="gradient-title">
            Capture Group Photo Attendance
          </h2>

          <p>
            <b>Detected Date & Time:</b> {currentTime}
          </p>

          {location && (
            <p>
              <b>Detected Location:</b> {location}
            </p>
          )}

          <form onSubmit={uploadPhoto}>
            <label>Work Site</label>

            <select
              value={workSite}
              onChange={(e) => setWorkSite(e.target.value)}
              required
            >
              <option value="">Select Work Site</option>

              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.site_name}
                </option>
              ))}
            </select>

            <label>Group Photo</label>

            <div className="photo-actions">
              <label className="upload-photo-btn">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  hidden
                />
              </label>

              <button
                type="button"
                className="camera-btn"
                onClick={() => setCameraOpen(!cameraOpen)}
              >
                📷 {cameraOpen ? "Close Camera" : "Open Camera"}
              </button>
            </div>

            {cameraOpen && (
              <div className="camera-box">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={360}
                  videoConstraints={{
                    facingMode: "environment",
                  }}
                />

                <button
                  type="button"
                  className="capture-btn"
                  onClick={captureFromCamera}
                >
                  Capture Group Photo
                </button>
              </div>
            )}

            {preview && (
              <img
                src={preview}
                alt="attendance preview"
                className="preview-img"
              />
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Submit Attendance"}
            </button>
          </form>

          {result && (
            <div className="result-box">
              <h3>{result.message}</h3>

              <p>
                <b>Organization:</b> {result.organization}
              </p>

              <p>
                <b>Site:</b> {result.site}
              </p>

              <p>
                <b>Date:</b> {result.date}
              </p>

              <p>
                <b>Time:</b> {result.time}
              </p>

              <p>
                <b>Location:</b> {result.location}
              </p>

              <p>Total Faces: {result.total_faces_detected}</p>
              <p>Unknown Faces: {result.unknown_faces_count}</p>
              <p>Suspicious Faces: {result.suspicious_faces}</p>

              <h4>Present Workers</h4>

              {result.present_workers &&
              result.present_workers.length > 0 ? (
                result.present_workers.map((name, index) => (
                  <p key={index}>✅ {name}</p>
                ))
              ) : (
                <p>No known workers detected.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UploadAttendance;