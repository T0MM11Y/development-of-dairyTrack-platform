import { useEffect, useState } from "react";
import { getCows } from "../../../../api/peternakan/cow";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getSymptoms } from "../../../../api/kesehatan/symptom";
import {
  getDiseaseHistories,
  deleteDiseaseHistory,
} from "../../../../api/kesehatan/diseaseHistory";
import DiseaseHistoryCreatePage from "./DiseaseHistoryCreatePage";
import DiseaseHistoryEditPage from "./DiseaseHistoryEditPage";

const DiseaseHistoryListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [checks, setChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const [cowList, historyList, checkList, symptomList] = await Promise.all([
        getCows(),
        getDiseaseHistories(),
        getHealthChecks(),
        getSymptoms(),
      ]);
      setCows(cowList);
      setData(historyList);
      setChecks(checkList);
      setSymptoms(symptomList);
      setError("");
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
      setError("Gagal memuat data. Pastikan server API berjalan.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resolveCheck = (hc) => (typeof hc === "object" ? hc.id : hc);
  const resolveCow = (c) => (typeof c === "object" ? c.id : c);

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteDiseaseHistory(deleteId);
      await fetchData();
      setDeleteId(null);
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Riwayat Penyakit</h2>
        <button className="btn btn-info" onClick={() => setModalType("create")}>
          + Tambah
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {data.length === 0 && !error ? (
        <p className="text-muted">Belum ada data riwayat penyakit.</p>
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
                  {data.map((item, idx) => {
                    const hcId = resolveCheck(item.health_check);
                    const check = checks.find((c) => c.id === hcId);
                    const symptom = symptoms.find(
                      (s) => resolveCheck(s.health_check) === hcId
                    );
                    const cowId = resolveCow(check?.cow);
                    const cow = cows.find((c) => c.id === cowId);

                    return (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                        <td>{item.disease_name}</td>

                        {/* ✅ Nama Sapi */}
                        <td>{cow ? `${cow.name} (${cow.breed})` : <em>-</em>}</td>

                        {/* ✅ Pemeriksaan */}
                        <td>
                          {check ? (
                            <>
                              <div><strong>Suhu:</strong> {check.rectal_temperature}°C</div>
                              <div><strong>Denyut Jantung:</strong> {check.heart_rate}</div>
                              <div><strong>Napas:</strong> {check.respiration_rate}</div>
                              <div><strong>Ruminasi:</strong> {check.rumination}</div>
                              <div><strong>Tgl Periksa:</strong> {new Date(check.checkup_date).toLocaleString("id-ID")}</div>
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        {/* ✅ Gejala */}
                        <td>
                          {symptom ? (
                            Object.entries(symptom)
                              .filter(([key]) => !["id", "health_check", "created_at"].includes(key))
                              .map(([key, val]) => (
                                <div key={key}>
                                  <strong>{key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</strong> {val || "-"}
                                </div>
                              ))
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        {/* ✅ Status */}
                        <td>
                          {check?.status === "handled" ? (
                            <span className="badge bg-success">Sudah Ditangani</span>
                          ) : (
                            <span className="badge bg-warning text-dark">Belum Ditangani</span>
                          )}
                        </td>

                        {/* ✅ Deskripsi */}
                        <td>{item.description || "-"}</td>

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
                <p>Yakin ingin menghapus riwayat penyakit ini?</p>
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

export default DiseaseHistoryListPage;
