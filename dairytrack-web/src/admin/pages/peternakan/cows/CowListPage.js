import { useEffect, useState } from "react";
import { getCows, deleteCow } from "../../../../api/peternakan/cow";
import CowCreatePage from "./CowCreatePage";
import CowEditPage from "./CowEditPage";

const CowListPage = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit"
  const [editCowId, setEditCowId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCows();
      setCows(data);
    } catch (error) {
      console.error("Gagal mengambil data sapi:", error.message);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModalType(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Cow Data</h2>
        <button onClick={() => setModalType("create")} className="btn btn-info">
          + Add Cow
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading cow data...</p>
        </div>
      ) : cows.length === 0 ? (
        <p className="text-gray-500">No cow data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Cow Data</h4>
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
                        <td>{cow.lactation_status ? "Yes" : "No"}</td>
                        <td>{cow.lactation_phase || "-"}</td>

                        <td>
                          <button
                            className="btn btn-warning me-2"
                            onClick={() => {
                              setEditCowId(cow.id);
                              setModalType("edit");
                            }}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(cow.id)}
                            className="btn btn-danger"
                          >
                            <i className="ri-delete-bin-6-line"></i>
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

      {/* Modal */}
      {modalType && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          onClick={() => setModalType(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "create" ? "Tambah Sapi" : "Edit Sapi"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "create" ? (
                  <CowCreatePage
                    onCowAdded={() => {
                      fetchData();
                      setModalType(null); // Ini penting untuk menutup modal
                    }}
                    onClose={() => setModalType(null)} // Tambahkan ini untuk menutup modal
                  />
                ) : (
                  <CowEditPage
                    cowId={editCowId}
                    onCowUpdated={() => {
                      fetchData();
                      setModalType(null);
                    }}
                    onClose={() => setModalType(null)} // Tambahkan ini
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CowListPage;
