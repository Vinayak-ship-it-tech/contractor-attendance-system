import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";
import "./BillsPage.css";

function BillsPage() {
  const [departments, setDepartments] = useState([]);
  const [sites, setSites] = useState([]);
  const [bills, setBills] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const [form, setForm] = useState({
    department: "",
    site: "",
    bill_month: "",
    work_description: "",
    salary_amount: "",
    material_amount: "",
    other_amount: "",
    status: "Pending",
  });

  useEffect(() => {
    loadDepartments();
    loadSites();
    loadBills();
  }, []);

  const loadDepartments = async () => {
    const res = await API.get("departments/");
    setDepartments(res.data);
  };

  const loadSites = async () => {
    const res = await API.get("sites/");
    setSites(res.data);
  };

  const loadBills = async () => {
    const res = await API.get("bills/");
    setBills(res.data);
  };

  const createBill = async (e) => {
    e.preventDefault();

    try {
      await API.post("bills/", form);
      alert("Bill created successfully");

      setForm({
        department: "",
        site: "",
        bill_month: "",
        work_description: "",
        salary_amount: "",
        material_amount: "",
        other_amount: "",
        status: "Pending",
      });

      loadBills();
    } catch (error) {
      console.log(error);
      alert("Failed to create bill");
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    try {
      await API.delete(`bills/${id}/`);
      alert("Bill deleted");
      loadBills();
    } catch (error) {
      console.log(error);
      alert("Failed to delete bill");
    }
  };

  const downloadBillPDF = async (id) => {
  try {
    const res = await API.get(`bills/${id}/pdf/`, {
      responseType: "blob",
    });

    const fileURL = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = fileURL;
    link.setAttribute("download", `bill_${id}.pdf`);

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(error);
    alert("Failed to download bill PDF");
  }
};

const updateBillStatus = async (id, status) => {
  try {
    await API.patch(`bills/${id}/`, { status });

    alert(`Bill marked as ${status}`);
    loadBills();
  } catch (error) {
    console.log(error);
    alert("Failed to update bill status");
  }
};

const filteredBills = bills.filter((bill) => {
  const matchStatus = filterStatus
    ? bill.status === filterStatus
    : true;

  const matchDepartment = filterDepartment
    ? String(bill.department) === String(filterDepartment)
    : true;

  const matchMonth = filterMonth
    ? bill.bill_month?.slice(0, 7) === filterMonth
    : true;

  return matchStatus && matchDepartment && matchMonth;
});

  return (
    <Layout>
      <div className="bills-page">
        <h1>Bills Management</h1>
        <p>Create and manage monthly contractor bills</p>

        <div className="bill-form-card">
          <h2>Create New Bill</h2>

          <form onSubmit={createBill}>
            <select
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              required
            >
              <option value="">Select Organization</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              required
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.bill_month}
              onChange={(e) =>
                setForm({ ...form, bill_month: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Work Description"
              value={form.work_description}
              onChange={(e) =>
                setForm({ ...form, work_description: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Salary Amount"
              value={form.salary_amount}
              onChange={(e) =>
                setForm({ ...form, salary_amount: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Material Amount"
              value={form.material_amount}
              onChange={(e) =>
                setForm({ ...form, material_amount: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Other Amount"
              value={form.other_amount}
              onChange={(e) =>
                setForm({ ...form, other_amount: e.target.value })
              }
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Paid">Paid</option>
            </select>

            <button type="submit">Create Bill</button>
          </form>
        </div>

        <div className="bill-filter-card">
          <h2>Filter Bills</h2>

          <div className="bill-filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Paid">Paid</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Organizations</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />

            <button
              type="button"
              onClick={() => {
                setFilterStatus("");
                setFilterDepartment("");
                setFilterMonth("");
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bills-table-card">
          <h2>All Bills</h2>

          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Site</th>
                <th>Month</th>
                <th>Salary</th>
                <th>Material</th>
                <th>Other</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
             {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.department_name}</td>
                  <td>{bill.site_name}</td>
                  <td>{bill.bill_month}</td>
                  <td>₹{bill.salary_amount}</td>
                  <td>₹{bill.material_amount}</td>
                  <td>₹{bill.other_amount}</td>
                  <td>
                    <b>₹{bill.total_amount}</b>
                  </td>
                  <td>{bill.status}</td>
                  <td>
                     <button
                    className="download-bill-btn"
                    onClick={() => downloadBillPDF(bill.id)}
                    >
                    PDF
                    </button>
                    <button
                      className="delete-bill-btn"
                      onClick={() => deleteBill(bill.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="status-btn pending-btn"
                      onClick={() => updateBillStatus(bill.id, "Pending")}
                    >
                      Pending
                    </button>

                    <button
                      className="status-btn submitted-btn"
                      onClick={() => updateBillStatus(bill.id, "Submitted")}
                    >
                      Submitted
                    </button>

                    <button
                      className="status-btn paid-btn"
                      onClick={() => updateBillStatus(bill.id, "Paid")}
                    >
                      Paid
                    </button>

                    
                   
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBills.length === 0 && (
            <div className="no-data">No bills found</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default BillsPage;