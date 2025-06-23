import React, { useEffect, useState, useMemo } from "react";
import {
  deleteSymptom,
  getSymptoms,
} from "../../../../controllers/symptomController";
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { listCows } from "../../../../controllers/cowsController";
import SymptomCreatePage from "./CreateSymptom";
import SymptomEditPage from "./EditSymptom";
import SymptomViewPage from "./ViewSymptom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  Table,
  Spinner,
  InputGroup,
  FormControl,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";

const SymptomListPage = () => {
  const [data, setData] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [cows, setCows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | null
  const [editId, setEditId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentUser, setCurrentUser] = useState(null);
  const [userManagedCows, setUserManagedCows] = useState([]);
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userData);

    const fetchUserCows = async () => {
      if (!userData) return;

      try {
        const { success, cows } = await listCowsByUser(
          userData.user_id || userData.id
        );
        if (success) setUserManagedCows(cows || []);
      } catch (err) {
        console.error("Gagal memuat sapi user:", err);
      }
    };

    fetchUserCows();
  }, []);

const isAdmin = currentUser?.role_id === 1;
const isSupervisor = currentUser?.role_id === 2;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedSymptoms, hcs, cowsData] = await Promise.all([
        getSymptoms(),
        getHealthChecks(),
        listCows(),
      ]);

      const isAdmin = currentUser?.role_id === 1;
      const isSupervisor = currentUser.role_id === 2;

      const allCows = Array.isArray(cowsData) ? cowsData : cowsData.cows || [];

      setHealthChecks(hcs);
      setCows(allCows);
      setSymptoms(fetchedSymptoms); // ✅ Tambahkan ini

      let visibleSymptoms = fetchedSymptoms;

      if (!isAdmin && !isSupervisor && userManagedCows.length > 0) {
        const allowedCowIds = userManagedCows.map((cow) => cow.id);

        visibleSymptoms = fetchedSymptoms.filter((symptom) => {
          const relatedHC = hcs.find((h) => h.id === symptom.health_check);
          const cowId =
            typeof relatedHC?.cow === "object"
              ? relatedHC.cow.id
              : relatedHC?.cow;
          return relatedHC && allowedCowIds.includes(cowId);
        });
      }

      setData(visibleSymptoms);
      setError("");
    } catch (err) {
      console.error("Failed to fetch symptom data:", err.message);
setError("Failed to fetch symptom data. Please make sure the API server is running.");

    } finally {
      setLoading(false);
    }
  };

  const PAGE_SIZE = 7; // ⬅️ Mau 5/10/20 baris per halaman? Ubah ini saja

  const [currentPage, setCurrentPage] = useState(1);
  // 🔍 Filter data berdasarkan nama sapi
  const filteredData = data.filter((item) => {
    const hc = healthChecks.find((h) => h.id === item.health_check);
    const cow = cows.find((c) => c.id === hc?.cow || c.id === hc?.cow?.id);
    const cowName = cow ? `${cow.name} (${cow.breed})`.toLowerCase() : "";
    return cowName.includes(searchTerm.toLowerCase());
  });

  // ⏩ Data yang ditampilkan sesuai halaman
 const sortedFilteredData = [...filteredData].sort((a, b) => b.id - a.id); // atau pakai created_at jika ada
const paginatedData = sortedFilteredData.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
);


  // 🔢 Total halaman berdasarkan filteredData
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const getCowName = (hcId) => {
    const hc = healthChecks.find((h) => h.id === hcId);
    if (!hc) return "not found";

    const cowId = typeof hc.cow === "object" ? hc.cow.id : hc.cow;
    const cow = cows.find((c) => c.id === cowId);
    return cow ? `${cow.name} (${cow.breed})` : "not found";
  };

  const handleDelete = async (id) => {
  if (!id) return;
  setSubmitting(true);
  try {
    await deleteSymptom(id);
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Symptom data has been successfully deleted.",
      timer: 1500,
      showConfirmButton: false,
    });
    fetchData();
    setDeleteId(null);
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Failed to Delete",
      text: "An error occurred while deleting the data.",
    });
  } finally {
    setSubmitting(false);
  }
};

  const prepareExportData = () => {
    return data.map((s) => {
      const hc = healthChecks.find((h) => h.id === s.health_check) || {};
      const cowName = getCowName(s.health_check);
     return {
  "Cow Name": cowName,
  "Rectal Temperature": hc.rectal_temperature || "-",
  "Heart Rate": hc.heart_rate || "-",
  "Respiration Rate": hc.respiration_rate || "-",
  Rumination: hc.rumination || "-",
  "Eye Condition": s.eye_condition,
  "Mouth Condition": s.mouth_condition,
  "Nose Condition": s.nose_condition,
  "Anus Condition": s.anus_condition,
  "Leg Condition": s.leg_condition,
  "Skin Condition": s.skin_condition,
  Behavior: s.behavior,
  "Body Weight": s.weight_condition,
  "Reproductive Condition": s.reproductive_condition,
};

    });
  };
  const exportToExcel = () => {
    const exportData = prepareExportData();
    if (!exportData.length) return;

    const headers = Object.keys(exportData[0]);

    const dataWithTitle = [
["Cow Symptom Report"], 

      headers,
      ...exportData.map((row) => headers.map((key) => row[key])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataWithTitle);

    // Merge cell A1 sampai kolom terakhir
    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 },
      },
    ];

    // ✅ Tambahkan style rata tengah dan bold untuk judul (teks-nya)
    worksheet["A1"].s = {
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      font: {
        bold: true,
        sz: 14,
      },
    };

    // ✅ Tambahkan style bold dan center untuk header kolom
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIdx });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
        };
      }
    });

    // ✅ Set kolom auto width
    const colWidths = headers.map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportData.map((item) =>
          item[key] ? item[key].toString().length : 0
        )
      );
      return { wch: maxLen + 4 };
    });
    worksheet["!cols"] = colWidths;

    // Buat workbook & simpan
    const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cow_Symptom_Report");

XLSX.writeFile(workbook, "Cow_Symptom_Report.xlsx");

  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    const exportData = prepareExportData();
    if (!exportData.length) return;

    const headers = Object.keys(exportData[0]);
    const body = exportData.map((row) => headers.map((h) => row[h]));

    // Judul
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(
      "Cow Symptom Data Report",
      doc.internal.pageSize.getWidth() / 2,
      20,
      {
        align: "center",
      }
    );

    // Tabel
    autoTable(doc, {
      head: [headers],
      body,
      startY: 40,
      theme: "grid", // ✅ Tambah garis grid
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [60, 60, 60], // ✅ Abu gelap
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: 20,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // ✅ Row warna selang-seling
      },
      columnStyles: {
        default: { cellWidth: "wrap" },
      },
      margin: { top: 30, bottom: 30, left: 20, right: 20 },
      pageBreak: "auto",
    });

    doc.save("Cow_Symptom_Data_Report.pdf");
  };

  useEffect(() => {
    if (!currentUser) return;

    const isAdmin = currentUser.role_id === 1;
    const isSupervisor = currentUser.role_id === 2;

    if (isAdmin || isSupervisor) {
      fetchData(); // Admin dan Supervisor langsung fetch
    } else if (userManagedCows.length > 0) {
      fetchData(); // Peternak tunggu sapi tersedia
    }
  }, [userManagedCows, currentUser]);

  const rawCows = currentUser?.role_id === 1 ? cows : userManagedCows;

  const filteredHealthChecks = useMemo(() => {
    return healthChecks.filter((hc) => {
      const sudahAdaSymptom = symptoms.some((symptom) => {
        return String(symptom.health_check) === String(hc.id);
      });

      const isCowAccessible = rawCows.some((cow) => cow.id === hc.cow.id);

      return (
        hc.needs_attention &&
        hc.status !== "handled" &&
        !sudahAdaSymptom &&
        isCowAccessible
      );
    });
  }, [healthChecks, symptoms, rawCows]);

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4 className="mb-0 text-primary fw-bold">
  <i className="fas fa-notes-medical me-2" /> Health Check Symptom Management
          </h4>
        </Card.Header>

        <Card.Body>
          {/* Tombol Aksi */}
          <div className="d-flex justify-content-between mb-3">
            <InputGroup style={{ maxWidth: "300px" }}>
              <FormControl
placeholder="Search cow name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset ke halaman awal
                }}
              />
            </InputGroup>
            <div className="d-flex gap-2">
            <OverlayTrigger
  placement="top"
  overlay={
    <Tooltip id="tooltip-gejala">
      {(isAdmin || isSupervisor)
        ? (isAdmin
               ? "Admin cannot add symptom data"
        : "Supervisor cannot add symptom data")
    : "Add Symptom"}
    </Tooltip>
  }
>
  <span className="d-inline-block">
    <Button
      variant="primary"
      onClick={() => {
        if (isAdmin || isSupervisor) return;

        if (filteredHealthChecks.length === 0) {
          Swal.fire({
            icon: "warning",
           title: "Cannot Add Symptom",
    text: "No health check data available. All checks may have been handled, already have symptoms, or do not belong to the cows you manage.",
  });
          return;
        }

        setModalType("create");
      }}
      disabled={isAdmin || isSupervisor}
      style={{
        pointerEvents: (isAdmin || isSupervisor) ? "none" : "auto",
      }}
    >
      <i className="ri-add-line me-1" />
      Add Data
    </Button>
  </span>
</OverlayTrigger>

              <Button variant="success" onClick={exportToExcel}>
                <i className="ri-file-excel-2-line me-1" />
                Export Excel
              </Button>
              <Button variant="danger" onClick={exportToPDF}>
                <i className="ri-file-pdf-line me-1" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Notifikasi Error */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Loader */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
  <p className="mt-3 text-muted">Loading symptom data...</p>
            </div>
          ) : data.length === 0 ? (
  <p className="text-muted">No symptom data available yet.</p>
          ) : (
            <>
              {/* Tabel Gejala */}
              <div className="table-responsive">
                <Table bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Date</th>
            <th>Cow Name</th>
            <th>Recorded By</th>
            <th>Handling Status</th>
            <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => {
                      const hc = healthChecks.find(
                        (h) => h.id === item.health_check
                      );
                      const cow = cows.find(
                        (c) => c.id === hc?.cow || c.id === hc?.cow?.id
                      );
                      const cowName = cow
                        ? `${cow.name} (${cow.breed})`
                        : "Cow not found";

                      return (
                        <tr key={item.id}>
                           <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                          <td>{new Date(item.created_at).toLocaleDateString("id-ID")}</td>

  <td>{cowName}</td>
    <td>{item.created_by?.name || "Uknown"}</td>   

  <td>
    <Badge
      bg={
        hc?.status === "handled"
          ? "success"
          : hc?.status === "healthy"
          ? "primary"
          : "warning"
      }
    >
      {hc?.status === "handled"
        ? "Handled"
        : hc?.status === "healthy"
        ? "Healthy"
        : "Not Handled"}
    </Badge>
  </td>

                          <td>
                            <OverlayTrigger
                              overlay={<Tooltip>View Detail</Tooltip>}
                            >
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="me-2"
                                onClick={() => setViewId(item.id)}
                              >
                                <i className="fas fa-eye" />
                              </Button>
                            </OverlayTrigger>

                <OverlayTrigger
  placement="top"
  overlay={
    <Tooltip id="tooltip-edit-gejala">
      {(isAdmin || isSupervisor)
        ? (isAdmin
         ? "Admin cannot edit symptom data"
        : "Supervisor cannot edit symptom data")
    : "Edit Symptom"}
    </Tooltip>
  }
>
  <span className="d-inline-block">
    <Button
      variant="outline-warning"
      size="sm"
      className="me-2"
      onClick={() => {
        if (isAdmin || isSupervisor) return;

        if (hc?.status === "handled") {
          Swal.fire({
            icon: "info",
          title: "Cannot Be Edited",
        text: "This health check has already been handled; symptom data cannot be modified.",
        confirmButtonText: "Understood",
      });
          return;
        }

        if (hc?.status === "healthy") {
          Swal.fire({
            icon: "info",
             title: "No Need to Edit",
        text: "This health check indicates a healthy condition and does not need to be edited.",
        confirmButtonText: "Understood",
      });
          return;
        }

        setEditId(item.id);
        setModalType("edit");
      }}
      disabled={isAdmin || isSupervisor} // 🔒 Tombol hanya nonaktif utk admin/supervisor
    >
      <i className="fas fa-edit" />
    </Button>
  </span>
</OverlayTrigger>



                            <OverlayTrigger
  placement="top"
  overlay={
    <Tooltip id="tooltip-hapus-gejala">
      {(isAdmin || isSupervisor)
        ? (isAdmin
             ? "Admin cannot delete symptom data"
        : "Supervisor cannot delete symptom data")
    : "Delete Symptom"}
    </Tooltip>
  }
>
  <span className="d-inline-block">
    <Button
      variant="outline-danger"
      size="sm"
      onClick={() => {
        if (isAdmin || isSupervisor) return;

        Swal.fire({
           title: "Are you sure you want to delete?",
  text: "This symptom data cannot be recovered.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
  confirmButtonText: "Yes, delete it!",
  cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            setDeleteId(item.id);
            handleDelete(item.id);
          }
        });
      }}
      disabled={isAdmin || isSupervisor}
      style={{
        pointerEvents: (isAdmin || isSupervisor) ? "none" : "auto",
      }}
    >
      <i className="fas fa-trash" />
    </Button>
  </span>
</OverlayTrigger>

                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <span className="fw-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="ms-2"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Modal Tambah */}
          {modalType === "create" && (
            <SymptomCreatePage
              onClose={() => setModalType(null)}
              onSaved={() => {
                fetchData();
                setModalType(null);
              }}
            />
          )}

          {/* Modal Edit */}
          {modalType === "edit" && editId && (
            <SymptomEditPage
              symptomId={editId}
              onClose={() => {
                setEditId(null);
                setModalType(null);
              }}
              onSaved={() => {
                fetchData();
                setEditId(null);
                setModalType(null);
              }}
            />
          )}

          {/* Modal Lihat */}
          {viewId && (
            <SymptomViewPage
              symptomId={viewId}
              onClose={() => setViewId(null)}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SymptomListPage;
