export default function DashboardCards({ dashboard }) {
  return (
    <div className="row g-4 mb-4">

      <div className="col-lg-3 col-md-6">
        <div className="card shadow border-0">
          <div className="card-body">
            <h6>Total Tenders</h6>
            <h2>{dashboard.total_tenders}</h2>
          </div>
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="card shadow border-0">
          <div className="card-body">
            <h6>Organizations</h6>
            <h2>{dashboard.organizations}</h2>
          </div>
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="card shadow border-0">
          <div className="card-body">
            <h6>Departments</h6>
            <h2>{dashboard.departments}</h2>
          </div>
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="card shadow border-0">
          <div className="card-body">
            <h6>Notifications</h6>
            <h2>{dashboard.unread_notifications}</h2>
          </div>
        </div>
      </div>

    </div>
  );
}