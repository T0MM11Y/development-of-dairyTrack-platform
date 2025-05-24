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
  const isSupervisor = currentUser?.role_id === 2;
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

  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor tidak dapat mengedit data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

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
      console.error("Gagal mengambil data gejala:", err.message);
      setError("Gagal mengambil data gejala. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const PAGE_SIZE = 3; // ⬅️ Mau 5/10/20 baris per halaman? Ubah ini saja

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
    if (!hc) return "Tidak ditemukan";

    const cowId = typeof hc.cow === "object" ? hc.cow.id : hc.cow;
    const cow = cows.find((c) => c.id === cowId);
    return cow ? `${cow.name} (${cow.breed})` : "Tidak ditemukan";
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await deleteSymptom(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data gejala berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
      setDeleteId(null);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: "Terjadi kesalahan saat menghapus data.",
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
        "Nama Sapi": cowName,
        "Suhu Rektal": hc.rectal_temperature || "-",
        "Denyut Jantung": hc.heart_rate || "-",
        "Laju Pernapasan": hc.respiration_rate || "-",
        Ruminasi: hc.rumination || "-",
        "Kondisi Mata": s.eye_condition,
        "Kondisi Mulut": s.mouth_condition,
        "Kondisi Hidung": s.nose_condition,
        "Kondisi Anus": s.anus_condition,
        "Kondisi Kaki": s.leg_condition,
        "Kondisi Kulit": s.skin_condition,
        Perilaku: s.behavior,
        "Berat Badan": s.weight_condition,
        "Kondisi Kelamin": s.reproductive_condition,
      };
    });
  };
  const exportToExcel = () => {
    const exportData = prepareExportData();
    if (!exportData.length) return;

    const headers = Object.keys(exportData[0]);

    // Baris 1: judul (cell A1), Baris 2: header, Baris 3+: data
    const dataWithTitle = [
      ["Laporan Gejala Sapi"], // Judul
      headers, // Header Kolom
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_Gejala_Sapi");

    XLSX.writeFile(workbook, "Laporan_Gejala_Sapi.xlsx");
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
      "Laporan Data Gejala Sapi",
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

    doc.save("Laporan_Data_Gejala.pdf");
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
            <i className="fas fa-notes-medical me-2" /> Manajemen Gejala
            Pemeriksaan
          </h4>
        </Card.Header>

        <Card.Body>
          {/* Tombol Aksi */}
          <div className="d-flex justify-content-between mb-3">
            <InputGroup style={{ maxWidth: "300px" }}>
              <FormControl
                placeholder="Cari nama sapi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset ke halaman awal
                }}
              />
            </InputGroup>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  if (isSupervisor) return;

                  if (filteredHealthChecks.length === 0) {
                    Swal.fire({
                      icon: "warning",
                      title: "Tidak Bisa Menambahkan Gejala",
                      text: "Tidak ada data pemeriksaan yang tersedia. Mungkin semua pemeriksaan telah ditangani, sudah memiliki gejala, atau tidak termasuk dalam daftar sapi yang Anda kelola.",
                    });
                    return;
                  }

                  setModalType("create");
                }}
                disabled={isSupervisor}
                title={
                  isSupervisor
                    ? "Supervisor tidak dapat menambahkan data gejala"
                    : ""
                }
              >
                <i className="ri-add-line me-1" />
                Tambah Gejala
              </Button>
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
              <p className="mt-3 text-muted">Memuat data gejala...</p>
            </div>
          ) : data.length === 0 ? (
            <p className="text-muted">Belum ada data gejala.</p>
          ) : (
            <>
              {/* Tabel Gejala */}
              <div className="table-responsive">
                <Table bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Nama Sapi</th>
                      <th>Status Penanganan</th>
                      <th>Aksi</th>
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
                        : "Sapi tidak ditemukan";

                      return (
                        <tr key={item.id}>
                          <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                          <td>{cowName}</td>
                          <td>
                            <Badge
                              bg={
                                hc?.status === "handled" ? "success" : "warning"
                              }
                            >
                              {hc?.status === "handled"
                                ? "Sudah Ditangani"
                                : "Belum Ditangani"}
                            </Badge>
                          </td>
                          <td>
                            <OverlayTrigger
                              overlay={<Tooltip>Lihat Detail</Tooltip>}
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
                              overlay={<Tooltip>Edit Gejala</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-2"
                                disabled={isSupervisor}
                                onClick={() => {
                                  if (isSupervisor) return;
                                  if (hc?.status === "handled") {
                                    Swal.fire({
                                      icon: "info",
                                      title: "Tidak Bisa Diedit",
                                      text: "Pemeriksaan ini sudah ditangani, data gejala tidak dapat diubah.",
                                      confirmButtonText: "Mengerti",
                                    });
                                    return;
                                  }
                                  setEditId(item.id);
                                  setModalType("edit");
                                }}
                              >
                                <i className="fas fa-edit" />
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              overlay={<Tooltip>Hapus Gejala</Tooltip>}
                            >
                              <Button
                                variant="outline-danger"
                                size="sm"
                                disabled={isSupervisor}
                                onClick={() => {
                                  Swal.fire({
                                    title: "Yakin ingin menghapus?",
                                    text: "Data gejala ini tidak dapat dikembalikan.",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#6c757d",
                                    confirmButtonText: "Ya, hapus!",
                                    cancelButtonText: "Batal",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      setDeleteId(item.id);
                                      handleDelete(item.id);
                                    }
                                  });
                                }}
                              >
                                <i className="fas fa-trash" />
                              </Button>
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
                    Halaman {currentPage} dari {totalPages}
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
