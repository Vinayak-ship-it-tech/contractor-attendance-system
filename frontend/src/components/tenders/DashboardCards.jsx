export default function DashboardCards({ summary }) {
  const cards = [
    {
      title: "Total Tenders",
      value: summary.total_tenders,
    },
    {
      title: "Open Tenders",
      value: summary.open_tenders,
    },
    {
      title: "Closing Today",
      value: summary.closing_today,
    },
    {
      title: "Organizations",
      value: summary.organizations,
    },
    {
      title: "Departments",
      value: summary.departments,
    },
    {
      title: "Notifications",
      value: summary.unread_notifications,
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((card) => (
        <div className="col-md-4 col-lg-2" key={card.title}>
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h6>{card.title}</h6>
              <h2>{card.value}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}