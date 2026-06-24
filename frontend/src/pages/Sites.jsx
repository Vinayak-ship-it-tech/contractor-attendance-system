import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "./Layout";

function Sites() {
  const [departments, setDepartments] = useState([]);
  const [sites, setSites] = useState([]);

  const [form, setForm] = useState({
    department: "",
    name: "",
    location: "",
  });

  const loadData = async () => {
    const deptRes = await API.get("departments/");
    const siteRes = await API.get("sites/");

    setDepartments(deptRes.data);
    setSites(siteRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addSite = async (e) => {
    e.preventDefault();

    if (!form.department || !form.name) {
      alert("Organization and site name required");
      return;
    }

    await API.post("sites/", form);
    alert("Site added");
    setForm({ department: "", name: "", location: "" });
    loadData();
  };

  return (
    <Layout>
      <div className="page">
        <div className="card">
          <h2>Add Site</h2>

          <form onSubmit={addSite}>
            <select
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            >
              <option value="">Select Organization</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Site Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />

            <button type="submit">Add Site</button>
          </form>
        </div>

        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Site</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            {sites.map((site) => (
              <tr key={site.id}>
                <td>{site.department_name}</td>
                <td>{site.name}</td>
                <td>{site.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Sites;