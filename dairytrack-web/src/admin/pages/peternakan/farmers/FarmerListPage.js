import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Untuk bahasa Indonesia
import {
  getFarmers,
  deleteFarmer,
  exportFarmersPDF,
  exportFarmersExcel,
} from "../../../../api/peternakan/farmer"; // Tambahkan import untuk fungsi ekspor
import FarmerCreatePage from "./FarmerCreatePage";
import FarmerEditPage from "./FarmerEditPage";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FarmerListPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editFarmerId, setEditFarmerId] = useState(null);
  const [deleteFarmerId, setDeleteFarmerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const isSupervisor = user?.type === "supervisor";
  const disableIfSupervisor = isSupervisor
  ? {
      disabled: true,
      title: "Supervisor tidak memiliki akses",
      style: { opacity: 0.5, cursor: "not-allowed" },
    }
  : {};

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedJoinDate, setSelectedJoinDate] = useState(null);
  const itemsPerPage = 8; // Jumlah item per halaman
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFarmers = farmers.filter((farmer) => {
    const searchLower = searchQuery.toLowerCase();
    const genderMatch =
      !selectedGender ||
      farmer.gender?.toLowerCase() === selectedGender.toLowerCase();
    const joinDateMatch =
      !selectedJoinDate ||
      new Date(farmer.join_date).toDateString() ===
        selectedJoinDate.toDateString();
    const searchMatch =
      farmer.first_name?.toLowerCase().includes(searchLower) ||
      farmer.last_name?.toLowerCase().includes(searchLower) ||
      farmer.contact?.toLowerCase().includes(searchLower) ||
      farmer.email?.toLowerCase().includes(searchLower);

    return genderMatch && joinDateMatch && searchMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFarmers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);

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

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this farmer? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteFarmer(deleteFarmerId);
      fetchData();
      setModalType(null);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Farmer has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete farmer:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to delete farmer: " + error.message,
      });
    } finally {
      setSubmitting(false);
      setDeleteFarmerId(null);
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

    let success = false;

    try {
      const response = await exportFarmersExcel();

      if (!response.ok) {
        throw new Error(`Failed to export Excel: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FarmersData.xlsx";
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
      const response = await exportFarmersPDF();

      if (!response || !response.ok) {
        throw new Error(
          `Failed to export PDF: ${response?.statusText || "Unknown error"}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FarmersData.pdf";
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearFilters = () => {
    setSearchQuery(""); // Reset pencarian
    setSelectedGender(""); // Reset filter gender
    setSelectedJoinDate(null); // Reset filter tanggal bergabung
    setCurrentPage(1); // Kembali ke halaman pertama
  };
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(); // Panggil fungsi fetchData untuk merefresh data
    setTimeout(() => setIsRefreshing(false), 1000); // Hentikan animasi setelah 1 detik
  };
  const getSelectedFarmer = () => {
    return farmers.find((farmer) => farmer.id === deleteFarmerId);
  };

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

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3 d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center">
            <i className="bi bi-people me-2"></i> Farmer Data
          </span>
          <button
            className="btn btn-outline-primary waves-effect waves-light"
            onClick={() => {
              clearFilters(); // Fungsi untuk menghapus semua filter
              handleRefresh(); // Fungsi untuk merefresh data
            }}
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
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {/* Filter by Join Date */}
          <div className="col-md-2 d-flex flex-column">
            <label className="form-label">Filter by Join Date</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-calendar-event"></i>
              </span>
              <ReactDatePicker
                selected={selectedJoinDate}
                onChange={(date) => {
                  setSelectedJoinDate(date);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-md-4 d-flex gap-2 justify-content-end">
            <button
              onClick={() => setModalType("create")}
              className="btn btn-info"
              {...disableIfSupervisor}

            >
              + Add Farmer
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
                    {currentItems.map((farmer, index) => (
                      <tr key={farmer.id}>
                        <th scope="row">{indexOfFirstItem + index + 1}</th>
                        <td>{farmer.email}</td>
                        <td>{farmer.first_name}</td>
                        <td>{farmer.last_name}</td>
                        <td>
                          {farmer.birth_date
                            ? format(
                                new Date(farmer.birth_date),
                                "dd MMMM yyyy",
                                { locale: id }
                              )
                            : "-"}
                        </td>
                        <td>{farmer.contact}</td>
                        <td>{farmer.religion}</td>
                        <td>{farmer.address}</td>
                        <td>{farmer.gender}</td>
                        <td>{farmer.total_cattle}</td>
                        <td>
                          {farmer.join_date
                            ? format(
                                new Date(farmer.join_date),
                                "dd MMMM yyyy",
                                { locale: id }
                              )
                            : "-"}
                        </td>
                        <td>
                          {farmer.status === "Active" ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Inactive</span>
                          )}
                        </td>
                        <td>
                        <button
  className="btn btn-warning me-2"
  onClick={() => {
    if (!isSupervisor) {
      setEditFarmerId(farmer.id);
      setModalType("edit");
    }
  }}
  {...disableIfSupervisor}
>
  <i className="ri-edit-line"></i>
</button>

                          <button
  onClick={() => {
    if (!isSupervisor) {
      setDeleteFarmerId(farmer.id);
      setModalType("delete");
    }
  }}
  className="btn btn-danger"
  {...disableIfSupervisor}
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
                    {Math.min(indexOfLastItem, filteredFarmers.length)} of{" "}
                    {filteredFarmers.length} Farmer
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
