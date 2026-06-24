import React, { useState } from "react";
import axios from "axios";

function VoiceAttendance() {
  const [audio, setAudio] = useState(null);
  const [result, setResult] = useState(null);

  const uploadAudio = async () => {
    const formData = new FormData();
    formData.append("audio", audio);
    formData.append("location", "Voice Attendance Site");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/voice-attendance/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(res.data);
    } catch (error) {
      console.log(error);
      alert("Voice attendance failed");
    }
  };

  return (
    <div className="page">
      <h1>Voice Attendance</h1>

      <div className="card">
        <p>Upload audio saying worker names.</p>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files[0])}
        />

        <button onClick={uploadAudio}>Submit Voice Attendance</button>
      </div>

      {result && (
        <div className="result-box">
          <h3>Spoken Text</h3>
          <p>{result.spoken_text}</p>

          <h3>Marked Workers</h3>
          {result.marked_workers.map((name, index) => (
            <p key={index}>{name}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default VoiceAttendance;