import { useEffect, useState } from "react";
import { getTenders } from "../../services/tenderService";

export default function RecentTenders() {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    loadRecentTenders();
  }, []);

  async function loadRecentTenders() {
    try {
      const response = await getTenders({
        page: 1,
      });

      // DRF pagination
      setTenders(response.data.results || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header">
        <h5 className="mb-0">Recent Tenders</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-hover mb-0">

          <thead>
            <tr>
              <th>Tender ID</th>
              <th>Title</th>
              <th>Organization</th>
              <th>Department</th>
              <th>Status</th>
              <th>Closing Date</th>
            </tr>
          </thead>

          <tbody>
            {tenders.map((tender) => (
              <tr key={tender.id}>
                <td>{tender.tender_id}</td>
                <td>{tender.title}</td>
                <td>{tender.organization_name}</td>
                <td>{tender.department_name}</td>
                <td>
                  <span
                    className={`badge ${
                      tender.status === "Open"
                        ? "bg-success"
                        : tender.status === "Closed"
                        ? "bg-secondary"
                        : "bg-danger"
                    }`}
                  >
                    {tender.status}
                  </span>
                </td>
                <td>{tender.closing_date}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}