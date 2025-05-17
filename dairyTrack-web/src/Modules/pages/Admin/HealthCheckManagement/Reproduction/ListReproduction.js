import { useEffect, useState } from "react";
import {
  deleteReproduction,
  getReproductions,
} from "../../../../controllers/reproductionController";
import { listCows } from "../../../../controllers/cowsController";
import ReproductionCreatePage from "./CreateReproduction";
import ReproductionEditPage from "./EditReproduction";
import Swal from "sweetalert2";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";



const ReproductionListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 3;

  const user = JSON.parse(localStorage.getItem("user"));
  const [currentUser, setCurrentUser] = useState(null);
   const isSupervisor =
  currentUser?.role_id === 2;
  const [userManagedCows, setUserManagedCows] = useState([]);
   const disableIfSupervisor = isSupervisor
  ? {
      disabled: true,
      title: "Supervisor tidak dapat mengedit data",
      style: { opacity: 0.5, cursor: "not-allowed" },
    }
  : {};

  const fetchData = async () => {
  setLoading(true);
  try {
    const res = await getReproductions();
    const cowList = await listCows();
    const parsedCows = Array.isArray(cowList) ? cowList : cowList?.cows || [];
    setCows(parsedCows);

    const isAdmin = currentUser?.role_id === 1;
    const isSupervisor = currentUser.role_id === 2;

    let filtered = Array.isArray(res) ? res : [];

    console.log("📦 Data reproductions:", res);
    console.log("👤 currentUser:", currentUser);
    console.log("🔓 isAdmin:", isAdmin);
    console.log("🐄 userManagedCows:", userManagedCows);
    console.log("🆔 allowedCowIds:", userManagedCows.map((c) => c.id));

    if (!isAdmin && !isSupervisor && userManagedCows.length > 0) {
      filtered = filtered.filter((item, index) => {
        const cow = item.cow;
        const cowId = typeof cow === "object" ? cow?.id : cow;

        const match = userManagedCows.some((c) => String(c.id) === String(cowId));

        // Detail log untuk setiap item
        console.log(`🔍 [${index}] Reproduction ID: ${item.id}`);
        console.log("    - item.cow:", cow);
        console.log("    - cowId:", cowId);
        console.log("    - match with userManagedCows:", match);

        return match;
      });
    }

    console.log("✅ Final filtered reproductions:", filtered);

    setData(filtered);
    setError("");
  } catch (err) {
    console.error("❌ Gagal mengambil data:", err.message);
    setError("Gagal mengambil data. Pastikan server API aktif.");
  } finally {
    setLoading(false);
  }
};



  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await deleteReproduction(id);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data reproduksi berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: "Terjadi kesalahan saat menghapus data.",
      });
    }
  };

  const getCowName = (id) => {
    const cowArray = Array.isArray(cows) ? cows : [];
    const cow = cowArray.find((c) => c.id === id || c.id === id?.id);
    return cow ? `${cow.name} (${cow.breed})` : "Tidak diketahui";
  };
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


 useEffect(() => {
  if (!currentUser) return;

  const isAdmin = currentUser.role_id === 1;
  const isSupervisor = currentUser.role_id === 2;


  if (isAdmin || isSupervisor) {
    fetchData(); // Admin langsung fetch
  } else if (userManagedCows.length > 0) {
    fetchData(); // Non-admin tunggu sapi user tersedia
  }
}, [userManagedCows, currentUser]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Data Reproduksi</h2>
      <button
  className="btn btn-info"
  onClick={() => {
    if (isSupervisor) return;

    const femaleCows =
      Array.isArray(userManagedCows) &&
      userManagedCows.filter((cow) => cow.gender?.toLowerCase() === "female");

    if (!femaleCows || femaleCows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Sapi Betina",
        text: "Tidak dapat menambahkan reproduksi karena tidak ada sapi betina yang tersedia.",
        confirmButtonText: "Tutup",
      });
      return; // ⛔ Cegah buka modal
    }

    // ✅ Buka modal hanya jika ada sapi betina
    setModalType("create");
  }}
  {...disableIfSupervisor}
>
  + Tambah Reproduksi
</button>

      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-info" role="status" />
            <p className="mt-3 text-muted">Memuat data reproduksi...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <p className="text-muted">Belum ada data reproduksi.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-striped text-sm">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Nama Sapi</th>
                    <th>Calving Interval</th>
                    <th>Service Period</th>
                    <th>Conception Rate</th>
                    <th>Tanggal Dicatat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
  {paginatedData.map((item, idx) => (
    <tr key={item.id}>
      <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
      <td>{getCowName(item.cow)}</td>
      <td>{item.calving_interval || "-"}</td>
      <td>{item.service_period || "-"}</td>
      <td>{item.conception_rate != null ? item.conception_rate + " %" : "-"}</td>
      <td>
        {item.recorded_at
          ? new Date(item.recorded_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </td>
      <td>
        <OverlayTrigger overlay={<Tooltip>Edit Data Reproduksi</Tooltip>}>
          <Button
            variant="outline-warning"
            size="sm"
            className="me-2"
            onClick={() => {
              if (!isSupervisor) {
                setEditId(item.id);
                setModalType("edit");
              }
            }}
            disabled={isSupervisor}
          >
            <i className="fas fa-edit" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Hapus Data Reproduksi</Tooltip>}>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              if (isSupervisor) return;
              Swal.fire({
                title: "Yakin ingin menghapus?",
                text: "Data reproduksi ini tidak dapat dikembalikan.",
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
            disabled={isSupervisor}
          >
            <i className="fas fa-trash" />
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  ))}
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
                    Page {currentPage} of {totalPages}
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

      {modalType === "create" && (
        <ReproductionCreatePage
          onClose={() => setModalType(null)}
          onSaved={() => {
            fetchData();
            setModalType(null);
          }}
        />
      )}

      {modalType === "edit" && editId && (
        <ReproductionEditPage
          reproductionId={editId}
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

export default ReproductionListPage;
