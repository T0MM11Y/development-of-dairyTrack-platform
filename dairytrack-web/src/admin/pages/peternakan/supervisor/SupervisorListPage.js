import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  getSupervisors,
  deleteSupervisor,
  exportSupervisorsPDF,
  exportSupervisorsExcel,
} from "../../../../api/peternakan/supervisor";
import SupervisorCreatePage from "./SupervisorCreatePage";
import SupervisorEditPage from "./SupervisorEditPage";
import "react-datepicker/dist/react-datepicker.css";
import "jspdf-autotable";

const SupervisorListPage = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editSupervisorId, setEditSupervisorId] = useState(null);
  const itemsPerPage = 8; // Jumlah item per halaman

  const [deleteSupervisorId, setDeleteSupervisorId] = useState(null);
  const [selectedGender, setSelectedGender] = useState(""); // Filter by gender

  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntryDate, setSelectedEntryDate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // State untuk animasi refresh

  const filteredSupervisors = supervisors.filter((supervisor) => {
    const searchLower = searchQuery.toLowerCase();
    const genderMatch =
      !selectedGender ||
      supervisor.gender?.toLowerCase() === selectedGender.toLowerCase();
    const searchMatch =
      supervisor.email?.toLowerCase().includes(searchLower) ||
      supervisor.first_name?.toLowerCase().includes(searchLower) ||
      supervisor.last_name?.toLowerCase().includes(searchLower) ||
      supervisor.contact?.toLowerCase().includes(searchLower) ||
      supervisor.gender?.toLowerCase().includes(searchLower);

    return genderMatch && searchMatch;
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSupervisors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSupervisors.length / itemsPerPage);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getSupervisors();
      setSupervisors(data);
    } catch (error) {
      console.error("Failed to fetch supervisors:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchQuery(""); // Reset pencarian
    setSelectedEntryDate(null); // Reset filter tanggal masuk
    fetchData(); // Muat ulang data
    setTimeout(() => setIsRefreshing(false), 1000); // Hentikan animasi setelah 1 detik
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDelete = async () => {
    if (!deleteSupervisorId) return;

    setSubmitting(true);
    try {
      await deleteSupervisor(deleteSupervisorId);
      fetchData();
      setModalType(null);

      // Tampilkan pesan sukses dengan Swal
      await Swal.fire({
        title: "Deleted!",
        text: "Supervisor berhasil dihapus.",
        icon: "success",
      });
    } catch (error) {
      console.error("Failed to delete supervisor:", error.message);

      // Tampilkan pesan error dengan Swal
      await Swal.fire({
        title: "Error!",
        text: "Failed to delete supervisor: " + error.message,
        icon: "error",
      });
    } finally {
      setSubmitting(false);
      setDeleteSupervisorId(null);
    }
  };
  const handleExportExcel = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to export the Excel file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, export it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      const response = await exportSupervisorsExcel();

      if (!response.ok) {
        throw new Error(`Failed to export Excel: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SupervisorsData.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel:", error.message);
      Swal.fire({
        title: "Error!",
        text: "Failed to export Excel: " + error.message,
        icon: "error",
      });
    }

    // Always show success message
    await Swal.fire({
      title: "Success!",
      text: "Excel file has been exported successfully.",
      icon: "success",
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
      );
      pages.push(
        <button
          key="prev"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <span key="start-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${
            currentPage === i ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => paginate(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <span key="end-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      );
      pages.push(
        <button
          key="last"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      );
    }

    return pages;
  };
  const handleExportPDF = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to export the PDF file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, export it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      const response = await exportSupervisorsPDF();

      if (!response || !response.ok) {
        throw new Error(
          `Failed to export PDF: ${response?.statusText || "Unknown error"}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SupervisorsData.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to export PDF: " + error.message,
        icon: "error",
      });
    }

    // Always show success message
    await Swal.fire({
      title: "Success!",
      text: "PDF file has been exported successfully.",
      icon: "success",
    });
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

  const getSelectedSupervisor = () => {
    return supervisors.find(
      (supervisor) => supervisor.id === deleteSupervisorId
    );
  };

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3 d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center">
            <i className="bi bi-person"></i> Supervisor Data
          </span>
          <button
            className="btn btn-outline-primary waves-effect waves-light"
            onClick={handleRefresh}
            title="Refresh Table"
            style={{
              padding: "7px",
              borderRadius: "50%",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#007bff")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <i
              className="bi bi-arrow-clockwise"
              style={{
                transition: "transform 0.5s ease",
                transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
              }}
            ></i>
          </button>
        </h2>
      </div>

      {/* Filter Section */}
      <div className="card p-3 mb-4 bg-light">
        <div className="row g-3 align-items-center justify-content-between">
          {/* Search Field */}
          <div className="col-md-3 d-flex flex-column">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-md-4 d-flex gap-2 justify-content-end">
            <button
              onClick={() => setModalType("create")}
              className="btn btn-info"
            >
              + Add Supervisor
            </button>
            <button
              onClick={handleExportExcel}
              className="btn btn-success"
              title="Export to Excel"
            >
              <i className="ri-file-excel-2-line"></i> Export to Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="btn btn-secondary"
              title="Export to PDF"
            >
              <i className="ri-file-pdf-line"></i> Export to PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading supervisor data...</p>
        </div>
      ) : supervisors.length === 0 ? (
        <p className="text-gray-500">No supervisor data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Supervisor Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Contact</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupervisors.map((supervisor, index) => (
                      <tr key={supervisor.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{supervisor.email}</td>
                        <td>{supervisor.first_name}</td>
                        <td>{supervisor.last_name}</td>
                        <td>{supervisor.contact}</td>
                        <td>{supervisor.gender}</td>

                        <td>
                          <button
                            className="btn btn-warning me-2"
                            onClick={() => {
                              setEditSupervisorId(supervisor.id);
                              setModalType("edit");
                            }}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteSupervisorId(supervisor.id);
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
                </table>{" "}
                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredSupervisors.length)} of{" "}
                    {filteredSupervisors.length} Supervisors
                  </p>
                  <nav>{renderPagination()}</nav>
                </div>
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
                  {modalType === "create"
                    ? "Add Supervisor"
                    : "Edit Supervisor"}
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
                  <SupervisorCreatePage
                    onSupervisorAdded={() => {
                      fetchData();
                      setModalType(null);
                    }}
                    onClose={() => setModalType(null)}
                  />
                ) : (
                  <SupervisorEditPage
                    supervisorId={editSupervisorId}
                    onSupervisorUpdated={() => {
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
                  Are you sure you want to delete supervisor{" "}
                  <strong>{getSelectedSupervisor()?.email || "this"}</strong>?
                  <br />
                  This action cannot be undone.
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

export default SupervisorListPage;
