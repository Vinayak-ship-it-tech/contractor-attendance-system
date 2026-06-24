import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import Layout from "./Layout";
import "./WorkPhotosPage.css";

function OrganizationWorkPhotos() {
  const { id } = useParams();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, [id]);

  const loadPhotos = async () => {
    try {
      const res = await API.get(`work-photos/organization/${id}/`);
      setPhotos(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load organization work photos");
    }
  };

  return (
    <Layout>
      <div className="work-photo-page">
        <h1>Organization Work Photos</h1>
        <p>Department-wise before, during, and after work photos</p>

        <div className="photo-grid">
          {photos.map((item) => (
            <div className="photo-card" key={item.id}>
              <img src={item.photo} alt="work" />

              <h3>{item.photo_type}</h3>

              <p>
                <b>Site:</b> {item.site_name}
              </p>

              <p>
                <b>Department:</b> {item.department_name}
              </p>

              <p>{item.description || "No description"}</p>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="no-data">No work photos found</div>
        )}
      </div>
    </Layout>
  );
}

export default OrganizationWorkPhotos;