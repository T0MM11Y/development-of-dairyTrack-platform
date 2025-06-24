import { useEffect, useState } from "react";
import { getSymptomById } from "../../../../controllers/symptomController";
import { Spinner } from "react-bootstrap";

const SymptomViewPage = ({ symptomId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fieldOrder = [
    "eye_condition",
    "mouth_condition",
    "nose_condition",
    "anus_condition",
    "leg_condition",
    "skin_condition",
    "behavior",
    "weight_condition",
    "reproductive_condition",
  ];

  const renderFieldLabel = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const renderCondition = (val) => {
    if (!val || val.toLowerCase() === "normal") {
      return <span className="badge bg-success">Normal</span>;
    }
    return <span className="badge bg-warning text-dark">{val}</span>;
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSymptomById(symptomId);
        setData(res);
      } catch (err) {
        setError("Gagal memuat data gejala.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [symptomId]);

  return (
    <div
      className="modal fade show d-block"
      style={{
        background: "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow">
          <div className="modal-header bg-info bg-opacity-10 border-bottom-0">
            <h5 className="modal-title text-info fw-semibold d-flex align-items-center">
              <i className="bi bi-activity me-2"></i>
              Health Check Symptom Details
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="info" />
                <p className="mt-2 text-muted">Loading Data...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40%" }}>Body Part</th>
                      <th>Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldOrder.map((key) => (
                      <tr key={key}>
                        <td className="fw-medium">{renderFieldLabel(key)}</td>
                        <td>{renderCondition(data[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer border-top-0">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomViewPage;
