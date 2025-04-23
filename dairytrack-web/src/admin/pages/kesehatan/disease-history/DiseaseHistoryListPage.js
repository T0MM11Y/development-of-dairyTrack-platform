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
import Swal from "sweetalert2"; // pastikan di bagian atas file
import { useTranslation } from "react-i18next";



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
    setLoading(true); // ✅ mulai loading
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
    }finally{    
    setLoading(false); // ✅ selesai loading
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <h2 className="text-xl font-bold text-gray-800">{t('disease_history.title')}
        </h2>
        <button
  className="btn btn-info"
  onClick={() => {
    if (!isSupervisor) {
      setModalType("create");
    }
  }}
  {...disableIfSupervisor}
>
  + {t('disease_history.add')}
</button>

      </div>

      {loading ? (
  <div className="text-center py-5">
    <div className="spinner-border text-info" role="status" />
    <p className="mt-2 text-muted">{t('disease_history.loading')}
    ...</p>
  </div>
) : error ? (
  <div className="alert alert-danger">{error}</div>
) : data.length === 0 ? (
  <p className="text-muted">{t('disease_history.empty')}
.</p>
) : (
  <div className="card">
    <div className="card-body">
      <h4 className="card-title">{t('disease_history.data')}
      </h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped text-sm">
          <thead className="bg-light">
            <tr>
              <th>#</th>
              <th>{t('disease_history.date')}
              </th>
              <th>{t('disease_history.disease')}
              </th>
              <th>{t('disease_history.cow')}
              </th>
              <th>{t('disease_history.health_check_detail')}
              </th>
              <th>{t('disease_history.symptom')}
              </th>
              <th>{t('disease_history.status')}
              </th>
              <th>{t('disease_history.description')}
              </th>
              <th>{t('disease_history.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const hcId = resolveCheck(item.health_check);
              const check = checks.find((c) => c.id === hcId);
              const symptom = symptoms.find((s) => resolveCheck(s.health_check) === hcId);
              const cowId = resolveCow(check?.cow);
              const cow = cows.find((c) => c.id === cowId);

              return (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                  <td>{item.disease_name}</td>
                  <td>{cow ? `${cow.name} (${cow.breed})` : <em>-</em>}</td>
                  <td>
                    {check ? (
                      <>
                        <div><strong>{t('disease_history.temperature')}
                        :</strong> {check.rectal_temperature}°C</div>
                        <div><strong>{t('disease_history.heart_rate')}
                        :</strong> {check.heart_rate}</div>
                        <div><strong>{t('disease_history.respiration')}
                        :</strong> {check.respiration_rate}</div>
                        <div><strong>{t('disease_history.rumination')}
                        :</strong> {check.rumination}</div>
                        <div><strong>{t('disease_history.checkup_date')}
                        :</strong> {new Date(check.checkup_date).toLocaleString("id-ID")}</div>
                      </>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
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
                  <td>
                    {check?.status === "handled" ? (
                      <span className="badge bg-success">{t('disease_history.treated')}
</span>
                    ) : (
                      <span className="badge bg-warning text-dark">{t('disease_history.untreated')}
</span>
                    )}
                  </td>
                  <td>{item.description || "-"}</td>
                  <td>
                  <button
  className="btn btn-warning btn-sm me-2"
  onClick={() => {
    if (!isSupervisor) {
      setEditId(item.id);
      setModalType("edit");
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
    }
  }}
  {...disableIfSupervisor}
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
