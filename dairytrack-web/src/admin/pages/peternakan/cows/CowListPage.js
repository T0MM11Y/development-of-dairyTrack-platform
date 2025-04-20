import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  getCows,
  deleteCow,
  exportCowsPDF,
  exportCowsExcel,
} from "../../../../api/peternakan/cow";
import CowCreatePage from "./CowCreatePage";
import CowEditPage from "./CowEditPage";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "jspdf-autotable";

const CowListPage = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editCowId, setEditCowId] = useState(null);
  const [deleteCowId, setDeleteCowId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedEntryDate, setSelectedEntryDate] = useState(null);
  // Pagination states
  const itemsPerPage = 8; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCows = cows.filter((cow) => {
    const searchLower = searchQuery.toLowerCase();
    const genderMatch =
      !selectedGender ||
      cow.gender?.toLowerCase() === selectedGender.toLowerCase();
    const entryDateMatch =
      !selectedEntryDate ||
      new Date(cow.entry_date).toDateString() ===
        selectedEntryDate.toDateString();
    const searchMatch =
      cow.name?.toLowerCase().includes(searchLower) ||
      cow.breed?.toLowerCase().includes(searchLower) ||
      cow.reproductive_status?.toLowerCase().includes(searchLower);

    return genderMatch && entryDateMatch && searchMatch;
  });
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

  const handleDelete = async () => {
    if (!deleteCowId) return;

    setSubmitting(true);
    try {
      await deleteCow(deleteCowId);
      fetchData();
      setModalType(null);
    } catch (error) {
      console.error("Gagal menghapus sapi:", error.message);
      alert("Gagal menghapus sapi: " + error.message);
    } finally {
      setSubmitting(false);
      setDeleteCowId(null);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCows.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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

  const clearFilters = () => {
    setSearchQuery(""); // Reset pencarian
    setSelectedGender(""); // Reset filter gender
    setSelectedEntryDate(null); // Reset filter tanggal masuk
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    clearFilters(); // Hapus semua filter
    fetchData(); // Muat ulang data
    setTimeout(() => setIsRefreshing(false), 1000); // Hentikan animasi setelah 1 detik
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

    let success = false;

    try {
      const response = await exportCowsExcel();

      if (!response.ok) {
        throw new Error(`Failed to export Excel: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "CowsData.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success = true;
    } catch (error) {
      console.error("Failed to export Excel:", error.message);
      Swal.fire({
        title: "Error!",
        text: "Failed to export Excel: " + error.message,
        icon: "error",
      });
    }

    // Always show success message
    if (success) {
      await Swal.fire({
        title: "Success!",
        text: "Excel file has been exported successfully.",
        icon: "success",
      });
    }
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

    let success = false;

    try {
      const response = await exportCowsPDF();

      if (!response || !response.ok) {
        throw new Error(
          `Failed to export PDF: ${response?.statusText || "Unknown error"}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "CowsData.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success = true;
    } catch (error) {
      console.error("PDF export error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to export PDF: " + error.message,
        icon: "error",
      });
    }

    // Always show success message
    if (success) {
      await Swal.fire({
        title: "Success!",
        text: "PDF file has been exported successfully.",
        icon: "success",
      });
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

  const getSelectedCow = () => {
    return cows.find((cow) => cow.id === deleteCowId);
  };

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3 d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center">
            <i className="bi bi-cow me-2"></i> Cow Data
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
          {/* Filter by Gender */}
          <div className="col-md-2 d-flex flex-column">
            <label className="form-label">Filter by Gender</label>
            <select
              className="form-select"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {/* Filter by Entry Date */}
          <div className="col-md-2 d-flex flex-column">
            <label className="form-label">Filter by Entry Date</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-calendar-event"></i>
              </span>
              <ReactDatePicker
                selected={selectedEntryDate}
                onChange={(date) => setSelectedEntryDate(date)}
                placeholderText="Select Date"
                className="form-control"
                todayButton="Today"
                isClearable
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
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
              + Add Cow
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
                    {currentItems.map((cow, index) => (
                      <tr key={cow.id}>
                        <th scope="row">{indexOfFirstItem + index + 1}</th>
                        <td>{cow.name}</td>
                        <td>{cow.breed}</td>
                        <td>{cow.birth_date}</td>
                        <td>{cow.weight_kg}</td>
                        <td>{cow.reproductive_status}</td>
                        <td>{cow.gender}</td>
                        <td>{cow.entry_date}</td>
                        <td>
                          {cow.lactation_status ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
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
                            onClick={() => {
                              setDeleteCowId(cow.id);
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
                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredCows.length)} of{" "}
                    {filteredCows.length} Cows
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
                  {modalType === "create" ? "Tambah Sapi" : "Edit Sapi"}
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
                  <CowCreatePage
                    onCowAdded={() => {
                      fetchData();
                      setModalType(null);
                    }}
                    onClose={() => setModalType(null)}
                  />
                ) : (
                  <CowEditPage
                    cowId={editCowId}
                    onCowUpdated={() => {
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
                <h5 className="modal-title text-danger">Konfirmasi Hapus</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Apakah Anda yakin ingin menghapus sapi{" "}
                  <strong>{getSelectedCow()?.name || "ini"}</strong>?
                  <br />
                  Data yang sudah dihapus tidak dapat dikembalikan.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalType(null)}
                  disabled={submitting}
                >
                  Batal
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
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
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

export default CowListPage;
