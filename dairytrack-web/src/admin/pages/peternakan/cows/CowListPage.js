import { useEffect, useState } from "react";
import { getCows, deleteCow } from "../../../../api/peternakan/cow";
import CowCreatePage from "./CowCreatePage";
import CowEditPage from "./CowEditPage";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const CowListPage = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editCowId, setEditCowId] = useState(null);
  const [deleteCowId, setDeleteCowId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedEntryDate, setSelectedEntryDate] = useState(null);

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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(cows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cows");

    // AutoFit column width
    const columnWidths = Object.keys(cows[0] || {}).map((key) => ({
      wch: Math.max(10, key.length + 2),
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, "CowsData.xlsx");
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 14;
    const startY = 25;
    let currentY = startY;

    // Judul dokumen
    doc.setFontSize(16);
    doc.text("Cows Data", marginLeft, currentY);
    currentY += 10;

    // Header tabel
    const tableColumn = ["#", "Name", "Breed", "Gender", "Entry Date"];
    const columnWidths = [10, 50, 50, 30, 30];

    // Render header tabel
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    let currentX = marginLeft;
    tableColumn.forEach((col, index) => {
      doc.text(col, currentX, currentY);
      currentX += columnWidths[index];
    });
    currentY += 6;

    // Render data tabel
    doc.setFont("helvetica", "normal");
    cows.forEach((cow, rowIndex) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = startY;
      }

      currentX = marginLeft;
      const rowData = [
        rowIndex + 1,
        cow.name,
        cow.breed,
        cow.gender,
        cow.entry_date,
      ];

      rowData.forEach((cell, cellIndex) => {
        const text = doc.splitTextToSize(String(cell), columnWidths[cellIndex]);
        doc.text(text, currentX, currentY);
        currentX += columnWidths[cellIndex];
      });

      currentY += 6;
    });

    // Simpan file PDF
    doc.save("CowsData.pdf");
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

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3">
          <i className="bi bi-cow"></i> Cow Data
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
                    {filteredCows.map((cow, index) => (
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
