import { useEffect, useState } from "react";
import { deleteHealthCheck, getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getCows } from "../../../../api/peternakan/cow";
import HealthCheckCreatePage from "./HealthCheckCreatePage";
import HealthCheckEditPage from "./HealthCheckEditPage";

const HealthCheckListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getHealthChecks();
      const cowList = await getCows();
      setData(res);
      setCows(cowList);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
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
      setDeleteId(null);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
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
        <h2 className="text-xl fw-bold text-dark">Data Pemeriksaan Kesehatan</h2>
        <button className="btn btn-info" onClick={() => setModalType("create")}>
          + Tambah
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {data.length === 0 && !error ? (
        <p className="text-muted">Belum ada data pemeriksaan.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Tabel Pemeriksaan</h5>
            <div className="table-responsive">
              <table className="table table-striped text-sm mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>Sapi</th>
                    <th>Suhu</th>
                    <th>Jantung</th>
                    <th>Napas</th>
                    <th>Ruminasi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{new Date(item.checkup_date).toLocaleDateString("id-ID")}</td>
                      <td>{getCowName(item.cow)}</td>
                      <td>{item.rectal_temperature}°C</td>
                      <td>{item.heart_rate} bpm</td>
                      <td>{item.respiration_rate} x/menit</td>
                      <td>{item.rumination} jam</td>
                      <td>
                        <span
                          className={`badge fw-semibold ${
                            item.status === "handled" ? "bg-success" : "bg-warning text-dark"
                          }`}
                        >
                          {item.status === "handled" ? "Sudah Ditangani" : "Belum Ditangani"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => {
                            setEditId(item.id);
                            setModalType("edit");
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
                <h5 className="modal-title text-danger">Konfirmasi Hapus</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Apakah Anda yakin ingin menghapus data pemeriksaan ini?
                  <br />
                  Data yang dihapus tidak dapat dikembalikan.
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
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
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

export default HealthCheckListPage;
