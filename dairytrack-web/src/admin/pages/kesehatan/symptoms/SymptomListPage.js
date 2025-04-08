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

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteSymptom(deleteId);
      fetchData();
      setDeleteId(null);
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
        <h2 className="text-xl font-bold text-gray-800">Data Gejala</h2>
        <button className="btn btn-info" onClick={() => setModalType("create")}>
          + Tambah Gejala
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Memuat data gejala...</p>
        </div>
      ) : data.length === 0 ? (
        <p className="text-muted">Belum ada data gejala.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Tabel Gejala</h4>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Sapi</th>
                    <th>Status Penanganan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{getCowName(item.health_check)}</td>
                      <td>{item.treatment_status}</td>
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
                            setEditId(item.id);
                            setModalType("edit");
                          }}
                        >
                          <i className="ri-edit-line" /> 
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <i className="ri-delete-bin-6-line" />
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

      {/* Modal Hapus */}
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
                <p>Yakin ingin menghapus data gejala ini? Tindakan ini tidak bisa dibatalkan.</p>
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

export default SymptomListPage;
