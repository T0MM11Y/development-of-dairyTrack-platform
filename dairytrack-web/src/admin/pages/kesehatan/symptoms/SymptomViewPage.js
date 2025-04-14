import { useEffect, useState } from "react";
import { getSymptomById } from "../../../../api/kesehatan/symptom";

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
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

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
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-info">Detail Gejala</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading || !data ? (
              <p className="text-center">Memuat data...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <tbody>
                    {fieldOrder.map((key) => (
                      <tr key={key}>
                        <th style={{ width: "40%" }}>{renderFieldLabel(key)}</th>
                        <td>{data[key] || "Normal"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomViewPage;
