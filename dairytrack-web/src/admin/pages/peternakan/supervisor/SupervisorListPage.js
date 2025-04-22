import { useEffect, useState } from "react";
import {
  getSupervisors,
  deleteSupervisor,
} from "../../../../api/peternakan/supervisor";
import SupervisorCreatePage from "./SupervisorCreatePage";
import SupervisorEditPage from "./SupervisorEditPage";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const SupervisorListPage = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "delete"
  const [editSupervisorId, setEditSupervisorId] = useState(null);
  const [deleteSupervisorId, setDeleteSupervisorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntryDate, setSelectedEntryDate] = useState(null);

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

  const handleDelete = async () => {
    if (!deleteSupervisorId) return;

    setSubmitting(true);
    try {
      await deleteSupervisor(deleteSupervisorId);
      fetchData();
      setModalType(null);
    } catch (error) {
      console.error("Failed to delete supervisor:", error.message);
      alert("Failed to delete supervisor: " + error.message);
    } finally {
      setSubmitting(false);
      setDeleteSupervisorId(null);
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(supervisors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supervisors");

    // AutoFit column width
    const columnWidths = Object.keys(supervisors[0] || {}).map((key) => ({
      wch: Math.max(10, key.length + 2),
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, "SupervisorsData.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 14;
    const startY = 25;
    let currentY = startY;

    // Judul dokumen
    doc.setFontSize(16);
    doc.text("Supervisors Data", marginLeft, currentY);
    currentY += 10;

    // Header tabel
    const tableColumn = ["#", "Email", "First Name", "Last Name", "Contact"];
    const columnWidths = [10, 50, 50, 50, 50];

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
    supervisors.forEach((supervisor, rowIndex) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = startY;
      }

      currentX = marginLeft;
      const rowData = [
        rowIndex + 1,
        supervisor.email,
        supervisor.first_name,
        supervisor.last_name,
        supervisor.contact,
      ];

      rowData.forEach((cell, cellIndex) => {
        const text = doc.splitTextToSize(String(cell), columnWidths[cellIndex]);
        doc.text(text, currentX, currentY);
        currentX += columnWidths[cellIndex];
      });

      currentY += 6;
    });

    // Simpan file PDF
    doc.save("SupervisorsData.pdf");
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

  const filteredSupervisors = supervisors.filter((supervisor) => {
    const searchLower = searchQuery.toLowerCase();
    const entryDateMatch =
      !selectedEntryDate ||
      new Date(supervisor.entry_date).toDateString() ===
        selectedEntryDate.toDateString();
    const searchMatch =
      supervisor.email?.toLowerCase().includes(searchLower) ||
      supervisor.first_name?.toLowerCase().includes(searchLower) ||
      supervisor.last_name?.toLowerCase().includes(searchLower) ||
      supervisor.contact?.toLowerCase().includes(searchLower);

    return entryDateMatch && searchMatch;
  });

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3">
          <i className="bi bi-person"></i> Supervisor Data
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
