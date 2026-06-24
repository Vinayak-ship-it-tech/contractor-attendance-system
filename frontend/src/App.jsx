import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import AddWorker from "./pages/AddWorker";
import WorkerList from "./pages/WorkerList";
import UploadAttendance from "./pages/UploadAttendance";
import AttendanceList from "./pages/AttendanceList";
import OrganizationAttendance from "./pages/OrganizationAttendance";
import WorkerProfile from "./pages/WorkerProfile";

import TodayAttendance from "./pages/Attendance/TodayAttendance";
import AttendanceHistory from "./pages/Attendance/AttendanceHistory";
import UploadGroupPhoto from "./pages/Attendance/UploadGroupPhoto";
import AttendanceUnknownPersons from "./pages/Attendance/UnknownPersons";

import SalaryPage from "./pages/SalaryPage";
import OrganizationSalary from "./pages/OrganizationSalary";

import ReportsPage from "./pages/ReportsPage";
import SmartReports from "./pages/SmartReports";

import SiteList from "./pages/SiteList";
import AddSite from "./pages/AddSite";
import EditSite from "./pages/EditSite";
import AssignWorkersToSite from "./pages/AssignWorkersToSite";
import SiteAttendance from "./pages/SiteAttendance";

import WorkPhotosPage from "./pages/WorkPhotosPage";
import OrganizationWorkPhotos from "./pages/OrganizationWorkPhotos";

import BillsPage from "./pages/BillsPage";
import Organizations from "./pages/Organizations";
import AIChatAssistant from "./pages/AIChatAssistant";
import AttendanceHeatmap from "./pages/AttendanceHeatmap";
import ProductivityScore from "./pages/ProductivityScore";
import VoiceAttendance from "./pages/VoiceAttendance";
import AttendanceAnomalies from "./pages/AttendanceAnomalies";
import DashboardAnalysis from "./pages/DashboardAnalysis";
import OfflineAttendance from "./pages/OfflineAttendance";
import { syncOfflineAttendance } from "./utils/offlineAttendance";

import ProtectedRoute from "./pages/ProtectedRoute";
import "./style.css";

const Secure = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

function App() {

  useEffect(() => {
    syncOfflineAttendance();

    window.addEventListener("online", syncOfflineAttendance);

    return () => {
      window.removeEventListener(
        "online",
        syncOfflineAttendance
      );
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route path="/welcome" element={<Secure><Welcome /></Secure>} />
        <Route path="/dashboard" element={<Secure><Dashboard /></Secure>} />

        <Route path="/workers" element={<Secure><WorkerList /></Secure>} />
        <Route path="/workers/:id" element={<Secure><WorkerProfile /></Secure>} />
        <Route path="/add-worker" element={<Secure><AddWorker /></Secure>} />

        <Route path="/attendance" element={<Secure><AttendanceList /></Secure>} />
        <Route path="/attendance/today" element={<Secure><TodayAttendance /></Secure>} />
        <Route path="/attendance/history" element={<Secure><AttendanceHistory /></Secure>} />
        <Route path="/attendance/upload" element={<Secure><UploadGroupPhoto /></Secure>} />
        <Route path="/attendance/unknown-persons" element={<Secure><AttendanceUnknownPersons /></Secure>} />
        <Route path="/attendance/organization/:id" element={<Secure><OrganizationAttendance /></Secure>} />

        <Route path="/upload" element={<Secure><UploadAttendance /></Secure>} />

        <Route path="/salary" element={<Secure><SalaryPage /></Secure>} />
        <Route path="/salary/organization/:id" element={<Secure><OrganizationSalary /></Secure>} />

        <Route path="/reports" element={<Secure><ReportsPage /></Secure>} />
        <Route path="/smart-reports" element={<Secure><SmartReports /></Secure>} />

        <Route path="/sites" element={<Secure><SiteList /></Secure>} />
        <Route path="/sites/add" element={<Secure><AddSite /></Secure>} />
        <Route path="/sites/edit/:id" element={<Secure><EditSite /></Secure>} />
        <Route path="/sites/assign-workers" element={<Secure><AssignWorkersToSite /></Secure>} />
        <Route path="/sites/attendance" element={<Secure><SiteAttendance /></Secure>} />

        <Route path="/work-photos" element={<Secure><WorkPhotosPage /></Secure>} />
        <Route path="/work-photos/organization/:id" element={<Secure><OrganizationWorkPhotos /></Secure>} />

        <Route path="/bills" element={<Secure><BillsPage /></Secure>} />
        <Route path="/organizations" element={<Secure><Organizations /></Secure>} />

        <Route path="/ai-chat" element={<Secure><AIChatAssistant /></Secure>} />
        <Route path="/heatmap" element={<Secure><AttendanceHeatmap /></Secure>} />
        <Route path="/productivity" element={<Secure><ProductivityScore /></Secure>} />
        <Route path="/voice-attendance" element={<Secure><VoiceAttendance /></Secure>} />
        <Route path="/anomalies" element={<Secure><AttendanceAnomalies /></Secure>} />
        <Route path="/dashboard-analysis" element={<Secure><DashboardAnalysis /></Secure>} />
        <Route path="/offline-attendance" element={<Secure><OfflineAttendance /></Secure>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;