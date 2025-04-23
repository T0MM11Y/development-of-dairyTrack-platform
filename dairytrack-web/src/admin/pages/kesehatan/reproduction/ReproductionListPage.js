import { useEffect, useState } from "react";
import {
  deleteReproduction,
  getReproductions,
} from "../../../../api/kesehatan/reproduction";
import { getCows } from "../../../../api/peternakan/cow";
import ReproductionCreatePage from "./ReproductionCreatePage";
import ReproductionEditPage from "./ReproductionEditPage";
import Swal from "sweetalert2"; // pastikan ini ada di atas file
import { useTranslation } from "react-i18next";




const ReproductionListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isSupervisor = user?.type === "supervisor";
  
  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor tidak dapat mengedit data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};


  const fetchData = async () => {
    setLoading(true); // Mulai loading
    try {
      const res = await getReproductions();
      const cowList = await getCows();
      setData(res);
      setCows(cowList);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false); // Selesai loading
    }
  };
  

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
    } finally {
    }
  };

  const getCowName = (id) => {
    const cow = cows.find((c) => c.id === id || c.id === id?.id);
    return cow ? `${cow.name} (${cow.breed})` : "Tidak diketahui";
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{t('reproduction.title')}</h2>
        <button
  className="btn btn-info"
  onClick={() => {
    if (!isSupervisor) {
      setModalType("create");
    }
  }}
  {...disableIfSupervisor}
>
  + {t('reproduction.add')}
</button>

      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
  <div className="card">
    <div className="card-body text-center py-5">
      <div className="spinner-border text-info" role="status" />
      <p className="mt-3 text-muted">{t('reproduction.loading')}
      </p>
    </div>
  </div>
) : error ? (
  <div className="alert alert-danger">{error}</div>
) : data.length === 0 ? (
  <p className="text-muted">{t('reproduction.empty')}
</p>
) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-striped text-sm">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>{t('reproduction.cow')}
                    </th>
                    <th>{t('reproduction.calving_interval')}
                    </th>
                    <th>{t('reproduction.service_period')}
                    </th>
                    <th>{t('reproduction.conception_rate')}</th>
                    <th>{t('reproduction.recorded_at')}</th>
                    <th>{t('reproduction.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
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
                      <button
  className="btn btn-warning btn-sm me-2"
  onClick={() => {
    if (!isSupervisor) {
      Swal.fire({
        title: "Edit Data Reproduksi?",
        text: "Anda akan membuka form edit data reproduksi.",
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
    }
  }}
  {...disableIfSupervisor}
>
  <i className="ri-edit-line"></i>
</button>

<button
  className="btn btn-danger btn-sm"
  onClick={() => {
    if (!isSupervisor) {
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
    }
  }}
  {...disableIfSupervisor}
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
      )}

      {/* Modal Tambah */}
      {modalType === "create" && (
        <ReproductionCreatePage
          onClose={() => setModalType(null)}
          onSaved={() => {
            fetchData();
            setModalType(null);
          }}
        />
      )}

      {/* Modal Edit */}
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
