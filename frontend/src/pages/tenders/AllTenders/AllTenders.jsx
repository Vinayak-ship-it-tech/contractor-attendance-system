import { useEffect, useState } from "react";
import {
  getAllTenders,
  getOrganizations,
  getDepartments,
} from "../../../services/tenderService";




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

    const [filters, setFilters] = useState({
        search: "",
        organization: "",
        department: "",
        status: "",
        });

    useEffect(() => {
    loadTenders();
    }, [page, search, organization, department]);

    useEffect(() => {
    loadOrganizations();
    loadDepartments();
    }, []);

    async function loadTenders() {

        setLoading(true);

        try {

            const response = await getAllTenders({
                page,
                search,
                organization,
                department,
            });

            setTenders(response.data.results);
            setCount(response.data.count);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }

    async function loadOrganizations() {

        try {

            const response = await getOrganizations();

            setOrganizations(response.data);

        } catch (error) {

            console.error(error);

        }

    }

    async function loadDepartments() {

        try {

            const response = await getDepartments();

            setDepartments(response.data);

        } catch (error) {

            console.error(error);

        }

    }

    return (

        <div className="container-fluid p-4">

            <h2>All Tenders</h2>

            <h5>Total Tenders : {count}</h5>

            <SearchBar
            
                value={search}
                placeholder="Search Tender..."
                onChange={(value) => {
                    setPage(1);
                    setSearch(value);
                }}
            />
            <TenderFilters
                organizations={organizations}
                departments={departments}
                organization={organization}
                department={department}
                onOrganizationChange={(value) => {
                    setPage(1);
                    setOrganization(value);
                }}
                onDepartmentChange={(value) => {
                    setPage(1);
                    setDepartment(value);
                }}
            />

            {loading && <p>Loading...</p>}

            <TenderTable tenders={tenders} />

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