import React from "react";

export default function TenderFilters({
    organizations,
    departments,
    organization,
    department,
    onOrganizationChange,
    onDepartmentChange,
}) {

    return (

        <div className="row mb-3">

            <div className="col-md-6">

                <select
                    className="form-select"
                    value={organization}
                    onChange={(e) =>
                        onOrganizationChange(e.target.value)
                    }
                >
                    <option value="">All Organizations</option>

                    {organizations.map((org) => (
                        <option key={org.id} value={org.name}>
                            {org.name}
                        </option>
                    ))}

                </select>

            </div>

            <div className="col-md-6">

                <select
                    className="form-select"
                    value={department}
                    onChange={(e) =>
                        onDepartmentChange(e.target.value)
                    }
                >
                    <option value="">All Departments</option>

                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                            {dept.name}
                        </option>
                    ))}

                </select>

            </div>

        </div>

    );

}