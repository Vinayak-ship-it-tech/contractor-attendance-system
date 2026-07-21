import { useEffect, useState } from "react";
import { getRecommendedTenders } from "../../services/tenderService";

export default function RecommendationPanel() {

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      const response = await getRecommendedTenders();
      setRecommendations(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="card shadow-sm mt-4">

      <div className="card-header">
        <h5 className="mb-0">
          ⭐ AI Recommended Tenders
        </h5>
      </div>


      <div className="list-group list-group-flush">

        {recommendations.map((item)=>(
          <div 
            key={item.tender.id}
            className="list-group-item"
          >

            <div className="d-flex justify-content-between">

              <div>

                <h6>
                  {item.tender.title}
                </h6>

                <small>
                  {item.tender.organization_name}
                  {" • "}
                  {item.tender.department_name}
                </small>

              </div>


              <span className="badge bg-success">
                {item.score}%
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}