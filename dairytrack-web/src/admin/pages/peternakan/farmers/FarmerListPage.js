import { useEffect, useState } from "react";
import { getFarmers, deleteFarmer } from "../../../../api/peternakan/farmer";
import FarmerCreatePage from "./FarmerCreatePage";
import FarmerEditPage from "./FarmerEditPage";

const FarmerListPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editFarmerId, setEditFarmerId] = useState(null);
  const [deleteFarmerId, setDeleteFarmerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getFarmers();
      setFarmers(data);
    } catch (error) {
      console.error("Failed to fetch farmers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFarmerId) return;

    setSubmitting(true);
    try {
      await deleteFarmer(deleteFarmerId);
      fetchData();
      setModalType(null);
    } catch (error) {
      console.error("Failed to delete farmer:", error.message);
      alert("Failed to delete farmer: " + error.message);
    } finally {
      setSubmitting(false);
      setDeleteFarmerId(null);
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

  const getSelectedFarmer = () => {
    return farmers.find((farmer) => farmer.id === deleteFarmerId);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Farmer Data</h2>
        <button onClick={() => setModalType("create")} className="btn btn-info">
          + Add Farmer
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading Farmer Data...</p>
        </div>
      ) : farmers.length === 0 ? (
        <p className="text-gray-500">No Farmer data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Farmer Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Birth Date</th>
                      <th>Contact</th>
                      <th>Religion</th>
                      <th>Address</th>
                      <th>Gender</th>
                      <th>Total Cattle</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmers.map((farmer, index) => (
                      <tr key={farmer.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{farmer.email}</td>
                        <td>{farmer.first_name}</td>
                        <td>{farmer.last_name}</td>
                        <td>{farmer.birth_date}</td>
                        <td>{farmer.contact}</td>
                        <td>{farmer.religion}</td>
                        <td>{farmer.address}</td>
                        <td>{farmer.gender}</td>
                        <td>{farmer.total_cattle}</td>
                        <td>{farmer.join_date}</td>
                        <td>{farmer.status}</td>
                        <td>
                          <button
                            className="btn btn-warning me-2"
                            onClick={() => {
                              setEditFarmerId(farmer.id);
                              setModalType("edit");
                            }}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteFarmerId(farmer.id);
                              setModalType("delete");
                            }}
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

      {/* Create/Edit Modal */}
      {modalType && ["create", "edit"].includes(modalType) && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
          onClick={() => setModalType(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "create" ? "Add Farmer" : "Edit Farmer"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "create" ? (
                  <FarmerCreatePage
                    onFarmerAdded={() => {
                      fetchData();
                      setModalType(null);
                    }}
                    onClose={() => setModalType(null)}
                  />
                ) : (
                  <FarmerEditPage
                    farmerId={editFarmerId}
                    onFarmerUpdated={() => {
                      fetchData();
                      setModalType(null);
                    }}
                    onClose={() => setModalType(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === "delete" && (
        <div
          className="modal fade show d-block"
          style={{
            background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete farmer{" "}
                  <strong>{getSelectedFarmer()?.first_name || "this"}</strong>?
                  <br />
                  Deleted data cannot be recovered.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalType(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerListPage;
