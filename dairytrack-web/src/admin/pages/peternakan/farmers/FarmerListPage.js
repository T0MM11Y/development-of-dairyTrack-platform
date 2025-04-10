import { useEffect, useState } from "react";
import { getFarmers, deleteFarmer } from "../../../../api/peternakan/farmer";
import FarmerCreatePage from "./FarmerCreatePage";
import FarmerEditPage from "./FarmerEditPage";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "jspdf-autotable";

const FarmerListPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editFarmerId, setEditFarmerId] = useState(null);
  const [deleteFarmerId, setDeleteFarmerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedJoinDate, setSelectedJoinDate] = useState(null);

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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(farmers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Farmers");

    // AutoFit column width
    const columnWidths = Object.keys(farmers[0] || {}).map((key) => ({
      wch: Math.max(10, key.length + 2),
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, "FarmersData.xlsx");
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 14;
    const startY = 25;
    let currentY = startY;

    // Judul dokumen
    doc.setFontSize(16);
    doc.text("Farmers Data", marginLeft, currentY);
    currentY += 10; // Tambah jarak setelah judul

    // Header tabel
    const tableColumn = [
      "#",
      "Full Name",
      "Birth Date",
      "Contact",
      "Gender",
      "Join Date",
    ];

    // Lebar kolom
    const columnWidths = [10, 60, 25, 30, 20, 30];

    // Render header tabel
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    let currentX = marginLeft;
    tableColumn.forEach((col, index) => {
      doc.text(col, currentX, currentY);
      currentX += columnWidths[index];
    });
    currentY += 6; // Tambah jarak setelah header

    // Render data tabel
    doc.setFont("helvetica", "normal");

    farmers.forEach((farmer, rowIndex) => {
      if (currentY > 270) {
        doc.addPage(); // Tambah halaman baru jika sudah penuh
        currentY = startY;
      }

      currentX = marginLeft;
      const rowData = [
        rowIndex + 1,
        `${farmer.first_name} ${farmer.last_name}`, // Gabungkan first_name dan last_name
        farmer.birth_date,
        farmer.contact,
        farmer.gender,
        farmer.join_date,
      ];

      rowData.forEach((cell, cellIndex) => {
        const text = doc.splitTextToSize(String(cell), columnWidths[cellIndex]); // Membungkus teks panjang
        doc.text(text, currentX, currentY);
        currentX += columnWidths[cellIndex];
      });

      currentY += 6; // Pindah ke baris berikutnya
    });

    // Simpan file PDF
    doc.save("FarmersData.pdf");
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

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3">
          <i className="bi bi-people"></i> Farmer Data
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
          {/* Filter by Join Date */}
          <div className="col-md-2 d-flex flex-column">
            <label className="form-label">Filter by Join Date</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-calendar-event"></i>
              </span>
              <ReactDatePicker
                selected={selectedJoinDate}
                onChange={(date) => setSelectedJoinDate(date)}
                placeholderText="Select Date"
                className="form-control"
                todayButton="Today" // Tambahkan tombol "Today"
                isClearable // Aktifkan tombol "Clear"
                dateFormat="yyyy-MM-dd" // Format tanggal
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
                    {filteredFarmers.map((farmer, index) => (
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
