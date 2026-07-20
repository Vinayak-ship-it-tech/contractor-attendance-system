import React from "react";

export default function TenderTable({ tenders = [] }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered align-middle">

        <thead className="table-dark">
          <tr>
            <th>Tender ID</th>
            <th>Organization</th>
            <th>Department</th>
            <th>Title</th>
            <th>Value</th>
            <th>Closing Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {tenders.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No tenders found
              </td>
            </tr>
          ) : (
            tenders.map((tender) => (
              <tr key={tender.id}>
                <td>{tender.tender_id}</td>
                <td>{tender.organization_name}</td>
                <td>{tender.department_name}</td>
                <td>{tender.title}</td>
                <td>₹ {tender.tender_value}</td>
                <td>{tender.closing_date}</td>
                <td>{tender.status}</td>
              </tr>
            ))
          )}

        </tbody>

      </table>
    </div>
  );
}