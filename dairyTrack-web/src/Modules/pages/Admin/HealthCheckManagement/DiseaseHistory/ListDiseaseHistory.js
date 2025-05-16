import { useEffect, useState } from "react";
import { listCows } from "../../../../controllers/cowsController";
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { getSymptoms } from "../../../../controllers/symptomController";
import {
  getDiseaseHistories,
  deleteDiseaseHistory,
} from "../../../../controllers/diseaseHistoryController";
import DiseaseHistoryCreatePage from "./CreateDiseaseHistory";
import DiseaseHistoryEditPage from "./EditDiseaseHistory";
import Swal from "sweetalert2"; // pastikan di bagian atas file
import { Table, Button, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";




const DiseaseHistoryListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [checks, setChecks] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const isSupervisor = user?.type === "supervisor";
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 3; // Pindahkan ini ke sini duluan ✅
  const [currentUser, setCurrentUser] = useState(null);
  const [userManagedCows, setUserManagedCows] = useState([]);
  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor tidak dapat mengedit data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};
  useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user"));
  setCurrentUser(userData);

  const fetchUserCows = async () => {
    if (!userData) return;

    try {
      const { success, cows } = await listCowsByUser(userData.user_id || userData.id);
      if (success) setUserManagedCows(cows || []);
    } catch (err) {
      console.error("Gagal mengambil sapi user:", err);
    }
  };

  fetchUserCows();
}, []);


 const fetchData = async () => {
  setLoading(true);
  try {
    const [cowList, historyList, checkList, symptomList] = await Promise.all([
      listCows(),
      getDiseaseHistories(),
      getHealthChecks(),
      getSymptoms(),
    ]);

    const allCows = Array.isArray(cowList) ? cowList : Array.isArray(cowList?.cows) ? cowList.cows : [];
    const allChecks = Array.isArray(checkList) ? checkList : [];

    setCows(allCows);
    setChecks(allChecks);
    setHealthChecks(allChecks);
    setSymptoms(Array.isArray(symptomList) ? symptomList : []);

    const isAdmin = currentUser?.role_id === 1;
    let filteredHistories = historyList;

    if (!isAdmin && userManagedCows.length > 0) {
  const allowedCowIds = userManagedCows.map((cow) => cow.id);

  filteredHistories = historyList.filter((history) => {
    const hcId = typeof history.health_check === "object" ? history.health_check.id : history.health_check;
    const hc = allChecks.find((c) => c.id === hcId);
    const cowId = typeof hc?.cow === "object" ? hc.cow.id : hc?.cow;
    return hc && allowedCowIds.includes(cowId);
  });
}


    setData(filteredHistories || []);
    setError("");
  } catch (err) {
    console.error("Gagal memuat data:", err.message);
    setError("Gagal memuat data. Pastikan server API berjalan.");
  } finally {
    setLoading(false);
  }
};


const safeData = Array.isArray(data) ? data : [];
const totalPages = Math.ceil(safeData.length / PAGE_SIZE);
const paginatedData = safeData.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
);

useEffect(() => {
  if (!currentUser) return;

const isAdmin = currentUser?.username === "admin001"; // bisa diganti sesuai username admin kamu

  if (isAdmin) {
    fetchData(); // Admin langsung fetch
  } else if (userManagedCows.length > 0) {
    fetchData(); // Non-admin tunggu sapi user tersedia
  }
}, [userManagedCows, currentUser]);


  const resolveCheck = (hc) => (typeof hc === "object" ? hc.id : hc);
  const resolveCow = (c) => (typeof c === "object" ? c.id : c);

  const handleDelete = async (id) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await deleteDiseaseHistory(id);
      await fetchData();
      setDeleteId(null);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Riwayat penyakit berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
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

 return (
  <div className="p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">Riwayat Penyakit</h2>
     <button
  className="btn btn-info"
  onClick={() => {
    if (isSupervisor) return;

    const noAvailableCheck = healthChecks.filter((check) => {
      const status = (check.status || "").toLowerCase();
      const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
      const isOwned = userManagedCows.some((cow) => cow.id === cowId);
      return status !== "handled" && status !== "healthy" && isOwned;
    }).length === 0;

    if (noAvailableCheck) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Bisa Menambahkan Riwayat Penyakit",
        text: "Tidak ada pemeriksaan yang tersedia. Semua pemeriksaan mungkin telah ditangani, sehat, atau bukan milik sapi Anda.",
      });
      return;
    }

    setModalType("create");
  }}
  {...disableIfSupervisor}
>
  + Tambah Riwayat
</button>

    </div>

    {loading ? (
      <div className="text-center py-5">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-2 text-muted">Memuat data riwayat penyakit...</p>
      </div>
    ) : error ? (
      <div className="alert alert-danger">{error}</div>
    ) : data.length === 0 ? (
      <p className="text-muted">Tidak ada data riwayat penyakit.</p>
    ) : (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Data Riwayat Penyakit</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-sm">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Tanggal</th>
                  <th>Penyakit</th>
                  <th>Sapi</th>
                  <th>Detail Pemeriksaan</th>
                  <th>Gejala</th>
                  <th>Status</th>
                  <th>Deskripsi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
             <tbody>
  {paginatedData.length === 0 ? (
    <tr>
      <td colSpan={9} className="text-center text-muted">
        Tidak ada data ditemukan.
      </td>
    </tr>
  ) : (
    paginatedData.map((item, idx) => {
      const hcId = resolveCheck(item.health_check);
      const check = checks.find((c) => c.id === hcId);
      const symptom = symptoms.find((s) => resolveCheck(s.health_check) === hcId);
      const cowId = resolveCow(check?.cow);
      const cow = cows.find((c) => c.id === cowId);

      return (
        <tr key={item.id}>
          <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
          <td>{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
          <td>{item.disease_name}</td>
          <td>{cow ? `${cow.name} (${cow.breed})` : check?.cow ? `ID: ${resolveCow(check?.cow)} (tidak ditemukan)` : "-"}</td>
          <td>
            {check ? (
              <>
                <div><strong>Suhu:</strong> {check.rectal_temperature}°C</div>
                <div><strong>Denyut Jantung:</strong> {check.heart_rate}</div>
                <div><strong>Pernapasan:</strong> {check.respiration_rate}</div>
                <div><strong>Ruminasi:</strong> {check.rumination}</div>
                <div><strong>Tanggal Periksa:</strong> {new Date(check.checkup_date).toLocaleString("id-ID")}</div>
              </>
            ) : (
              <span className="text-muted">-</span>
            )}
          </td>
          <td>
            {symptom ? (
              Object.entries(symptom)
                .filter(([key]) => !["id", "health_check", "created_at", "created_by", "edited_by"].includes(key))
                .map(([key, val]) => (
                  <div key={key}>
                    <strong>{key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</strong> {val || "-"}
                  </div>
                ))
            ) : (
              <span className="text-muted">-</span>
            )}
          </td>
          <td>
            {check?.status === "handled" ? (
              <span className="badge bg-success">Sudah Ditangani</span>
            ) : (
              <span className="badge bg-warning text-dark">Belum Ditangani</span>
            )}
          </td>
          <td>{item.description || "-"}</td>
          <td>
            <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
              <Button
                variant="outline-warning"
                size="sm"
                className="me-2"
                onClick={() => {
                  if (isSupervisor) return;
                  setEditId(item.id);
                  setModalType("edit");
                }}
                {...disableIfSupervisor}
              >
                <i className="fas fa-edit" />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Hapus</Tooltip>}>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  if (isSupervisor) return;
                  Swal.fire({
                    title: "Yakin ingin menghapus?",
                    text: "Riwayat penyakit ini tidak dapat dikembalikan.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Ya, hapus!",
                    cancelButtonText: "Batal",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleDelete(item.id);
                    }
                  });
                }}
                {...disableIfSupervisor}
              >
                <i className="fas fa-trash" />
              </Button>
            </OverlayTrigger>
          </td>
        </tr>
      );
    })
  )}
</tbody>
            </table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-3">
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </button>
                <span className="fw-semibold">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  className="btn btn-outline-primary btn-sm ms-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Modal Tambah */}
    {modalType === "create" && (
      <DiseaseHistoryCreatePage
        onClose={() => setModalType(null)}
        onSaved={() => {
          fetchData();
          setModalType(null);
        }}
      />
    )}

    {/* Modal Edit */}
    {modalType === "edit" && editId && (
      <DiseaseHistoryEditPage
        historyId={editId}
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
  </div>
);

};

export default DiseaseHistoryListPage;
