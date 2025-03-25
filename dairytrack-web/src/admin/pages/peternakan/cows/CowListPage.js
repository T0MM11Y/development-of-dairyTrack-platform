import { useEffect, useState } from "react";
import { getCows, deleteCow } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const CowListPage = () => {
  const [cows, setCows] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await getCows();
      setCows(data);
    } catch (error) {
      console.error("Gagal mengambil data sapi:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCow(id);
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus sapi:", error.message);
      alert("Gagal menghapus sapi: " + error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Cow Data</h2>
        <button
          onClick={() => navigate("/admin/peternakan/sapi/create")}
          className="btn btn-info waves-effect waves-light"
        >
          + Add Cow
        </button>
      </div>

      {cows.length === 0 ? (
        <p className="text-gray-500">No cow data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Cow Data</h4>
              <p className="card-title-desc">
                This table provides a comprehensive list of cows registered on
                the farm. You can view detailed information such as name, breed,
                birth date, and lactation status. The table uses alternating row
                colors for better readability.
              </p>

              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Breed</th>
                      <th>Birth Date</th>
                      <th>Weight (kg)</th>
                      <th>Reproductive Status</th>
                      <th>Gender</th>
                      <th>Entry Date</th>
                      <th>Lactation Status</th>
                      <th>Lactation Phase</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cows.map((cow, index) => (
                      <tr key={cow.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{cow.name}</td>
                        <td>{cow.breed}</td>
                        <td>{cow.birth_date}</td>
                        <td>{cow.weight_kg}</td>
                        <td>{cow.reproductive_status}</td>
                        <td>{cow.gender}</td>
                        <td>{cow.entry_date}</td>
                        <td>
                          {cow.lactation_status ? (
                            <div className="d-flex align-items-center">
                              <i className="ri-checkbox-blank-circle-fill font-size-10 text-success align-middle me-2"></i>
                              <span className="text-black">Yes</span>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <i className="ri-checkbox-blank-circle-fill font-size-10 text-warning align-middle me-2"></i>
                              <span className="text-black">No</span>
                            </div>
                          )}
                        </td>
                        <td>{cow.lactation_phase || "-"}</td>
                        <td className="whitespace-nowrap">
                          <button
                            className="btn btn-warning waves-effect waves-light mr-2"
                            onClick={() =>
                              navigate(`/admin/peternakan/sapi/edit/${cow.id}`)
                            }
                            aria-label={`Edit cow ${cow.name}`}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(cow.id)}
                            className="btn btn-danger waves-effect waves-light"
                            aria-label={`Delete cow ${cow.name}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CowListPage;
