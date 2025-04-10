import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getFeedTypeById, updateFeedType } from "../../../../api/pakan/feedType";

const FeedTypeDetailEditModal = ({ feedId, onClose, onSuccess }) => {
  const [feedType, setFeedType] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchFeedType = async () => {
      try {
        setLoading(true);
        if (!feedId) throw new Error("Invalid feed ID provided");
        
        const response = await getFeedTypeById(feedId);
        console.log("Fetch Response:", response);
        
        if (response?.feedType && response.feedType.id === feedId) {
          setFeedType(response.feedType);
          setName(response.feedType.name || "");
        } else {
          throw new Error("Invalid response format or feed type not found");
        }
      } catch (error) {
        console.error("Fetch Error:", error.message);
        Swal.fire({
          title: "Error!",
          text: `Gagal memuat data: ${error.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        setFeedType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedType();
  }, [feedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Nama jenis pakan harus diisi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data jenis pakan akan diperbarui.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, perbarui!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setUpdateLoading(true);
    try {
      const response = await updateFeedType(feedId, { name });
      console.log("API Response:", response);

      // Assuming updateFeedType returns similar structure or at least confirms success
      if (response?.feedType) {
        Swal.fire({
          title: "Sukses!",
          text: "Jenis pakan berhasil diperbarui.",
          icon: "success",
          confirmButtonText: "OK",
        });

        setFeedType({
          ...feedType,
          name: name
        });
        
        if (onSuccess) {
          onSuccess({
            id: feedId,
            name: name
          });
        }
        
        setIsEditing(false);
      } else {
        if (response?.message && response.message.includes("sudah ada")) {
          Swal.fire({
            title: "Error!",
            text: response.message,
            icon: "error",
            confirmButtonText: "OK",
          });
        } else {
          throw new Error(
            response?.message || "Gagal memperbarui jenis pakan."
          );
        }
      }
    } catch (error) {
      console.error("Update Error:", error.message);

      if (
        error.message &&
        (error.message.includes("unique") ||
          error.message.includes("duplicate") ||
          error.message.includes("ER_DUP_ENTRY"))
      ) {
        Swal.fire({
          title: "Error!",
          text: "Jenis pakan dengan nama tersebut sudah ada!",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire("Error!", error.message, "error");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setName(feedType.name);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-info">
              {isEditing ? "Edit Jenis Pakan" : "Detail Jenis Pakan"}
            </h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={updateLoading}
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : feedType ? (
              <>
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="feedTypeName" className="form-label">
                        Nama Jenis Pakan
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="feedTypeName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Contoh: Konsentrat"
                      />
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={toggleEditMode}
                        disabled={updateLoading}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="btn btn-info"
                        disabled={updateLoading}
                      >
                        {updateLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan Perubahan"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="card">
                      <div className="card-body">
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <th style={{ width: "150px" }}>ID</th>
                              <td>{feedType.id}</td>
                            </tr>
                            <tr>
                              <th>Nama</th>
                              <td>{feedType.name}</td>
                            </tr>
                            {feedType.createdAt && (
                              <tr>
                                <th>Dibuat Pada</th>
                                <td>
                                  {new Date(feedType.createdAt).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            )}
                            {feedType.updatedAt && (
                              <tr>
                                <th>Diperbarui Pada</th>
                                <td>
                                  {new Date(feedType.updatedAt).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                      <button 
                        className="btn btn-primary" 
                        onClick={toggleEditMode}
                      >
                        <i className="ri-edit-line me-1"></i> Edit
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="alert alert-danger">
                Data jenis pakan tidak ditemukan atau terjadi kesalahan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedTypeDetailEditModal;