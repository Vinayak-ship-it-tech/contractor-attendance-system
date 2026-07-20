import { useEffect, useState } from "react";
import { getDashboard } from "../../../services/tenderService";
import RecentTenders from "../../../components/tenders/RecentTenders.jsx";


export default function TenderDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  if (!dashboard) {
    return <h3 className="p-4">Loading Dashboard...</h3>;
  }

  return (
    <div className="container-fluid p-4">

      <h2 className="mb-4">Tender Dashboard</h2>

      <div className="row">

        <div className="col-md-3">
          <div className="card shadow p-3">
            <h5>Total Tenders</h5>
            <h2>{dashboard.total_tenders}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow p-3">
            <h5>Organizations</h5>
            <h2>{dashboard.organizations}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow p-3">
            <h5>Departments</h5>
            <h2>{dashboard.departments}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow p-3">
            <h5>Unread Notifications</h5>
            <h2>{dashboard.unread_notifications}</h2>
          </div>
        </div>

      </div>

    </div>
  );
}