import { useEffect, useState } from "react";
import { getAllTenders } from "../../services/tenderService";

export default function AllTenders() {

    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);

    const [search, setSearch] = useState("");

    const [organizations, setOrganizations] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [organization, setOrganization] = useState("");
    const [department, setDepartment] = useState("");

    useEffect(() => {
        loadTenders();
    }, [page, search]);

    async function loadTenders() {

        setLoading(true);

        try {

            const response = await getAllTenders({
                page,
                search,
            });

            setTenders(response.data.results);
            setCount(response.data.count);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="container-fluid p-4">

            <h2>All Tenders</h2>

            <h5>Total Tenders : {count}</h5>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search Tender..."
                value={search}
                onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                }}
            />

            {loading && <p>Loading...</p>}

            <table className="table table-bordered table-hover">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Organization</th>
                        <th>Department</th>
                        <th>Tender</th>
                        <th>Closing</th>

                    </tr>

                </thead>

                <tbody>

                    {tenders.map((tender) => (

                        <tr key={tender.id}>

                            <td>{tender.tender_id}</td>

                            <td>{tender.organization_name}</td>

                            <td>{tender.department_name}</td>

                            <td>{tender.title}</td>

                            <td>{tender.closing_date}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

            <div className="d-flex gap-3">

                <button
                    className="btn btn-primary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>

                <span className="align-self-center">
                    Page {page}
                </span>

                <button
                    className="btn btn-primary"
                    disabled={tenders.length < 100}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>

            </div>

        </div>

    );

}