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
  const [modalType, setModalType] = useState(null); // 'create' | 'edit'
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

  const getCowName = (id) => {
    const cow = cows.find((c) => c.id === id);
    return cow ? cow.name : "Tidak diketahui";
  };

  const getCheckTemperature = (id) => {
    const check = checks.find((c) => c.id === id);
    return check ? `${check.rectal_temperature} °C` : "-";
  };

  const getSymptomSummary = (id) => {
    const symptom = symptoms.find((s) => s.id === id);
    if (!symptom) return "-";

    const excludeNormal = (value) =>
      value && typeof value === "string" && value.toLowerCase() !== "normal";

    const fields = Object.entries(symptom).filter(
      ([key, value]) =>
        key !== "id" &&
        key !== "health_check" &&
        key !== "treatment_status" &&
        excludeNormal(value)
    );

    if (fields.length === 0) return "Semua kondisi normal";

    return fields
      .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
      .join(", ");
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <p className="text-gray-500">Belum ada data riwayat penyakit.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Data Riwayat Penyakit</h4>
            <div className="table-responsive">
              <table className="table table-striped mb-0 text-sm">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>Nama Penyakit</th>
                    <th>Keterangan</th>
                    <th>Sapi</th>
                    <th>Suhu Rektal</th>
                    <th>Gejala</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.created_at}</td>
                      <td>{item.disease_name}</td>
                      <td>{item.description}</td>
                      <td>{getCowName(item.cow)}</td>
                      <td>{getCheckTemperature(item.health_check)}</td>
                      <td>{getSymptomSummary(item.symptom)}</td>
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
                  Apakah Anda yakin ingin menghapus riwayat penyakit ini? Data
                  yang sudah dihapus tidak dapat dikembalikan.
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
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
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

export default DiseaseHistoryListPage;
