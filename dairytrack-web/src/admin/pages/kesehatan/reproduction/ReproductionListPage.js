import { useEffect, useState } from "react";
import {
  deleteReproduction,
  getReproductions,
} from "../../../../api/kesehatan/reproduction";
import { getCows } from "../../../../api/peternakan/cow";
import ReproductionCreatePage from "./ReproductionCreatePage";
import ReproductionEditPage from "./ReproductionEditPage";

const ReproductionListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getReproductions();
      const cowList = await getCows();
      setData(res);
      setCows(cowList);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteReproduction(deleteId);
      fetchData();
      setDeleteId(null);
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setSubmitting(false);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Data Reproduksi Sapi</h2>
        <button className="btn btn-info" onClick={() => setModalType("create")}>
          + Tambah
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {data.length === 0 && !error ? (
        <p className="text-muted">Belum ada data reproduksi.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-striped text-sm">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Sapi</th>
                    <th>Interval Kelahiran (hari)</th>
                    <th>Masa Layanan (hari)</th>
                    <th>Tingkat Konsepsi (%)</th>
                    <th>Tanggal Pencatatan</th>
                    <th>Aksi</th>
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

      {/* Modal Konfirmasi Hapus */}
      {deleteId && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
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
                  Yakin ingin menghapus data reproduksi ini?
                  <br />
                  Tindakan ini tidak dapat dibatalkan.
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
                  {submitting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReproductionListPage;
