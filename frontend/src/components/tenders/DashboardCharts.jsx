import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#9333ea",
  "#0891b2",
];

export default function DashboardCharts({ dashboard }) {
  const statusData = dashboard.status_chart || [];

  const organizationData =
    (dashboard.organization_chart || []).map((item) => ({
      name: item["organization__name"],
      count: item.count,
    }));

  return (
    <div className="row mt-4">

      <div className="col-lg-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Tender Status</h5>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="status"
                  outerRadius={100}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>
      </div>

      <div className="col-lg-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">

            <h5 className="mb-3">
              Organization-wise Tenders
            </h5>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={organizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="count"
                  name="Tenders"
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>
      </div>

    </div>
  );
}