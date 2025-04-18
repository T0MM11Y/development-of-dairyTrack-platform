import { useEffect, useState } from "react";
import {
  deleteSymptom,
  getSymptoms,
} from "../../../../api/kesehatan/symptom";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getCows } from "../../../../api/peternakan/cow";
import SymptomCreatePage from "./SymptomCreatePage";
import SymptomEditPage from "./SymptomEditPage";
import SymptomViewPage from "./SymptomViewPage";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";



const SymptomListPage = () => {
  const [data, setData] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | null
  const [editId, setEditId] = useState(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [symptoms, hcs, cowsData] = await Promise.all([
        getSymptoms(),
        getHealthChecks(),
        getCows(),
      ]);
      setData(symptoms);
      setHealthChecks(hcs);
      setCows(cowsData);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data gejala:", err.message);
      setError("Gagal mengambil data gejala. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const getCowName = (hcId) => {
    const hc = healthChecks.find((h) => h.id === hcId);
    const cow = cows.find((c) => c.id === hc?.cow);
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
        "Ruminasi": hc.rumination || "-",
        "Kondisi Mata": s.eye_condition,
        "Kondisi Mulut": s.mouth_condition,
        "Kondisi Hidung": s.nose_condition,
        "Kondisi Anus": s.anus_condition,
        "Kondisi Kaki": s.leg_condition,
        "Kondisi Kulit": s.skin_condition,
        "Perilaku": s.behavior,
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
      headers,                 // Header Kolom
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
        ...exportData.map((item) => (item[key] ? item[key].toString().length : 0))
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
    doc.text("Laporan Data Gejala Sapi", doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });
  
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
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{t('symptoms.symptom_data')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setModalType("create")}
            className="btn btn-info"
            style={{ marginRight: "50px" }}
          >
            + Tambah Gejala
          </button>
          <button
            onClick={exportToExcel}
            className="btn btn-success"
            title="Export to Excel"
            style={{ marginRight: "10px" }}
          >
            <i className="ri-file-excel-2-line"></i> {t('symptoms.export_excel')}

          </button>
          <button
            onClick={exportToPDF}
            className="btn btn-secondary"
            title="Export to PDF"
          >
            <i className="ri-file-pdf-line"></i> {t('symptoms.export_pdf')}

          </button>
        </div>
      </div>
  
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">{t('symptoms.loading_symptoms')}
          ...</p>
        </div>
      ) : data.length === 0 ? (
        <p className="text-muted">{t('symptoms.empty')}
.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">{t('symptoms.symptom_table')}
            </h4>
            <div className="table-responsive">
              <table className="table table-striped">
              <thead>
  <tr>
    <th>#</th>
    <th>{t('symptoms.cow_name')}
    </th>
    <th>{t('symptoms.handling_status')}
    </th>
    <th>{t('symptoms.actions')}
    </th>
  </tr>
</thead>
<tbody>
  {data.map((item, index) => {
    const hc = healthChecks.find((h) => h.id === item.health_check);
    const cow = cows.find((c) => c.id === hc?.cow || c.id === hc?.cow?.id);
    const cowName = cow ? `${cow.name} (${cow.breed})` : "Sapi tidak ditemukan";

    const statusBadge = hc?.status === "handled"
      ? <span className="badge bg-success">Sudah Ditangani</span>
      : <span className="badge bg-warning text-dark">Belum Ditangani</span>;

    return (
      <tr key={item.id}>
        <td>{index + 1}</td>
        <td>{cowName}</td>
        <td>{statusBadge}</td>
        <td>
          <button
            className="btn btn-secondary btn-sm me-2"
            onClick={() => setViewId(item.id)}
          >
            <i className="ri-eye-line" />
          </button>
          <button
  className="btn btn-warning btn-sm me-2"
  onClick={() => {
    const hc = healthChecks.find((h) => h.id === item.health_check);

    if (hc?.status === "handled") {
      Swal.fire({
        icon: "info",
        title: "Tidak Bisa Diedit",
        text: "Pemeriksaan ini sudah ditangani, data gejala tidak dapat diubah.",
        confirmButtonText: "Mengerti",
      });
      return;
    }

    Swal.fire({
      title: "Edit Gejala?",
      text: "Anda akan membuka form edit data gejala.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, edit",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setEditId(item.id);
        setModalType("edit");
      }
    });
  }}
>
  <i className="ri-edit-line" />
</button>

<button
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
        setDeleteId(item.id); // ✅ set ID dulu
        handleDelete(item.id); // ✅ langsung panggil handleDelete
      }
    });
  }}
  className="btn btn-danger btn-sm"
>
  <i className="ri-delete-bin-6-line" />
</button>


        </td>
      </tr>
    );
  })}
</tbody>

              </table>
            </div>
          </div>
        </div>
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

      {/* Modal View */}
      {viewId && (
        <SymptomViewPage
          symptomId={viewId}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
};

export default SymptomListPage;
