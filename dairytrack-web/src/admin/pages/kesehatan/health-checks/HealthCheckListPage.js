import { useEffect, useState } from "react";
import { deleteHealthCheck, getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getCows } from "../../../../api/peternakan/cow";
import HealthCheckCreatePage from "./HealthCheckCreatePage";
import HealthCheckEditPage from "./HealthCheckEditPage";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";


const HealthCheckListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();


  const fetchData = async () => {
    setLoading(true); // Mulai loading
    try {
      const res = await getHealthChecks();
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
  const getCowName = (cow) => {
    if (!cow) return "Tidak diketahui";
    if (typeof cow === "object") return cow.name || "Tidak diketahui";
  
    const found = cows.find((c) => String(c.id) === String(cow));
    return found ? found.name : "Tidak diketahui";
  };
  
  

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteHealthCheck(deleteId);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
      setDeleteId(null);
      fetchData();
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
  

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl fw-bold text-dark">{t('healthcheck.data')}
        </h2>
        <button className="btn btn-info" onClick={() => setModalType("create")}>
          + Tambah
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
  <div className="card">
    <div className="card-body text-center py-5">
      <div className="spinner-border text-info" role="status" />
      <p className="mt-3 text-muted">{t('healthcheck.loading_healthchecks')}
      ...</p>
    </div>
  </div>
) : error ? (
  <div className="alert alert-danger">{error}</div>
) : data.length === 0 ? (
  <p className="text-muted">{t('healthcheck.empty')}
.</p>
) : (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{t('healthcheck.table_title')}
            </h5>
            <div className="table-responsive">
              <table className="table table-striped text-sm mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>{t('healthcheck.date')}
                    </th>
                    <th>{t('healthcheck.cow')}
                    </th>
                    <th>{t('healthcheck.rectal_temperature')}
                    </th>
                    <th>{t('healthcheck.heart_rate')}
                    </th>
                    <th>{t('healthcheck.respiration_rate')}
                    </th>
                    <th>{t('healthcheck.rumination')}
                    </th>
                    <th>{t('healthcheck.status')}
                    </th>
                    <th>{t('healthcheck.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
  {data.map((item, idx) => (
    <tr key={item.id}>
      <td>{idx + 1}</td>
      <td>{new Date(item.checkup_date).toLocaleDateString("id-ID")}</td>
      <td>{getCowName(item.cow)}</td>
      <td>{item.rectal_temperature}°C</td>
      <td>{item.heart_rate} {t('healthcheck.bpm')}
      </td>
      <td>{item.respiration_rate} {t('healthcheck.bpm')}
      </td>
      <td>{item.rumination} {t('healthcheck.contraction')}
      </td>
      <td>
  <span
    className={`badge fw-semibold ${
      item.needs_attention === false
        ? "bg-primary"
        : item.status === "handled"
        ? "bg-success"
        : "bg-warning text-dark"
    }`}
  >
    {item.needs_attention === false
      ? "Sehat"
      : item.status === "handled"
      ? "Sudah ditangani"
      : "Belum ditangani"}
  </span>
</td>

      <td>
      <button
  className="btn btn-warning btn-sm me-2"
  onClick={() => {
    if (item.needs_attention === false) {
      Swal.fire({
        icon: "info",
        title: "Tidak Bisa Diedit",
        text: "Data ini menunjukkan kondisi sehat dan tidak perlu diedit.",
        confirmButtonText: "Mengerti",
      });
    } else if (item.status === "handled") {
      Swal.fire({
        icon: "info",
        title: "Tidak Bisa Diedit",
        text: "Data ini sudah ditangani dan tidak bisa diedit.",
        confirmButtonText: "Mengerti",
      });
    } else {
      Swal.fire({
        title: "Edit Pemeriksaan?",
        text: "Anda akan membuka form edit data pemeriksaan.",
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
>
  <i className="ri-edit-line"></i>
</button>


        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteId(item.id)}
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

      {/* Modal Create */}
      {modalType === "create" && (
        <HealthCheckCreatePage
          onClose={() => setModalType(null)}
          onSaved={() => {
            fetchData();
            setModalType(null);
          }}
        />
      )}

      {/* Modal Edit */}
      {modalType === "edit" && editId && (
        <HealthCheckEditPage
          healthCheckId={editId}
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


{/* Modal Konfirmasi Hapus */}
{deleteId && (
  <div
    className="modal fade show d-block"
    style={{
      background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
    }}
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-danger">{t('healthcheck.confirm_delete_title')}
          </h5>
          <button
            className="btn-close"
            onClick={() => setDeleteId(null)}
            disabled={submitting}
          ></button>
        </div>
        <div className="modal-body">
          <p>
          {t('healthcheck.confirm_delete')}
          ?
            <br />
            {t('healthcheck.confirm_delete_text')}
.
          </p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setDeleteId(null)}
            disabled={submitting}
          >
            Batal
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              Swal.fire({
                title: "Yakin ingin menghapus?",
                text: "Data yang dihapus tidak dapat dikembalikan.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Ya, hapus!",
                cancelButtonText: "Batal",
              }).then((result) => {
                if (result.isConfirmed) {
                  handleDelete();
                }
              });
            }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                {t('healthcheck.deleting')}
                ...
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

export default HealthCheckListPage;
