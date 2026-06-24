import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import API from "../api";
import Layout from "./Layout";

function AttendanceHeatmap() {
  const [data, setData] = useState([]);

  const fetchHeatmap = async () => {
    try {
      const res = await API.get("attendance-heatmap/");
      setData(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load attendance heatmap");
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  return (
    <Layout>
      <div className="page">
        <h1>Attendance Heat Map</h1>

        <div className="card heatmap-card">
          <CalendarHeatmap
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            endDate={new Date()}
            values={data.map((item) => ({
              date: item.date,
              count: item.count,
            }))}
            classForValue={(value) => {
              if (!value) return "color-empty";
              if (value.count >= 10) return "color-high";
              if (value.count >= 5) return "color-medium";
              return "color-low";
            }}
          />
        </div>
      </div>
    </Layout>
  );
}

export default AttendanceHeatmap;