import { useEffect, useState } from "react";
import { getDashboard } from "../../../services/tenderService";
import RecentTenders from "../../../components/tenders/RecentTenders.jsx";
import DashboardCards from "../../../components/tenders/DashboardCards.jsx";
import DepartmentPieChart from "../../../components/tenders/DepartmentPieChart.jsx";
import OrganizationBarChart from "../../../components/tenders/OrganizationBarChart.jsx";
import RecommendationPanel from "../../../components/tenders/RecommendationPanel.jsx";


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

      <DashboardCards summary={dashboard.summary} />

        <div className="row mt-4">

        <div className="col-lg-6 mb-4">
            <DepartmentPieChart
            data={dashboard.department_stats}
            />
        </div>

        <div className="col-lg-6 mb-4">
            <OrganizationBarChart
            data={dashboard.organization_stats}
            />
        </div>

        </div>


        <div className="row mt-4">

        <div className="col-lg-7 mb-4">
            <RecentTenders
                tenders={dashboard.recent_tenders}
                />
        </div>

        <div className="col-lg-5 mb-4">
            <RecommendationPanel />
        </div>

        </div>

    </div>
  );
}