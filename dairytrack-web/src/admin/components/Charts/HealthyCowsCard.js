import React from "react";
import Card from "../card";
import { useEffect, useState } from "react";
import { getHealthChecks } from "../../../api/kesehatan/healthCheck";
import { getDiseaseHistories } from "../../../api/kesehatan/diseaseHistory";
import { getSymptoms } from "../../../api/kesehatan/symptom";
import { getCows } from "../../../api/peternakan/cow";
import { getReproductions } from "../../../api/kesehatan/reproduction";
import { Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid,BarChart, Bar
  ,LabelList
 } from "recharts";

const HealthyCowsCard = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState({ pemeriksaan: 0, gejala: 0, penyakit: 0, reproduksi: 0 });
    const [chartDiseaseData, setChartDiseaseData] = useState([]);
    const [chartHealthData, setChartHealthData] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
  
    const [tableDiseaseData, setTableDiseaseData] = useState([]);
    const [tableHealthData, setTableHealthData] = useState([]);
  
    const filterByDate = (data, field = "created_at") => {
      if (!startDate || !endDate) return data;
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return data.filter(item => {
        const date = new Date(item[field]);
        return date >= start && date <= end;
      });
    };
  
    const fetchStats = async (isFilter = false) => {
      setLoading(true);
      try {
        const [healthChecks, diseaseHistories, symptoms, cows, reproductions] = await Promise.all([
          getHealthChecks(),
          getDiseaseHistories(),
          getSymptoms(),
          getCows(),
          getReproductions(),
        ]);
  
        const filteredHealth = filterByDate(healthChecks, "created_at");
        const filteredDisease = filterByDate(diseaseHistories, "created_at");
        const filteredSymptom = filterByDate(symptoms, "created_at");
        const filteredRepro = filterByDate(reproductions, "recorded_at");
        setTableDiseaseData(
          filteredDisease.map((item) => ({
            cowName: item.health_check?.cow?.name || "-",
            diseaseName: item.disease_name || "-",
            description: item.description || "-",
          }))
        );      
        
        setTableHealthData(
          filteredHealth.map((item) => ({
            cowName: item.cow?.name || "-",
            temperature: item.rectal_temperature,
            heartRate: item.heart_rate,
            respirationRate: item.respiration_rate,
            rumination: item.rumination,
          }))
        );
        
        setSummary({
          pemeriksaan: filteredHealth.length,
          gejala: filteredSymptom.length,
          penyakit: filteredDisease.length,
          reproduksi: filteredRepro.length,
        });
  
        const grouped = filteredDisease.reduce((acc, curr) => {
          const key = curr.disease_name || "Tidak Diketahui";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setChartDiseaseData(Object.entries(grouped).map(([name, value]) => ({ name, value })));
  
        const sehat = filteredHealth.filter(item => !item.needs_attention).length;
        const sakit = filteredHealth.filter(item => item.needs_attention).length;
        setChartHealthData([
          { name: "Sehat", value: sehat },
          { name: "Butuh Perhatian", value: sakit },
        ]);
  
        if (isFilter) {
          const total = filteredHealth.length + filteredDisease.length + filteredSymptom.length + filteredRepro.length;
          if (total === 0) {
            setModalMessage("🔍 Tidak ditemukan data dalam rentang tanggal tersebut.");
          } else {
            setModalMessage("✅ Data berhasil difilter sesuai tanggal.");
          }
          setShowModal(true);
        }
      } catch (err) {
        console.error(err);
        setModalMessage("❌ Terjadi kesalahan saat mengambil data.");
        setShowModal(true);
      } finally {
        setLoading(false);
        setModalLoading(false);
      }    
    };
  
    const handleFilter = () => {
      if (!startDate || !endDate) {
        setModalMessage("📌 Silakan isi Tanggal Mulai dan Tanggal Berakhir terlebih dahulu.");
        setModalLoading(false);
        setShowModal(true);
        return;
      }
      setModalLoading(true);
      setShowModal(true);
      fetchStats(true);
    };
    const handleReset = () => {
      setStartDate("");
      setEndDate("");
      setResetTrigger(true); // ⬅️ aktifkan trigger reset
    };
    
    
    useEffect(() => {
      if (firstLoad || resetTrigger) {
        setModalMessage("📊 Menampilkan seluruh data kesehatan sapi.");
        setModalLoading(true);
        setShowModal(true);
        fetchStats();
        setFirstLoad(false);
        setResetTrigger(false);
    
        // ⏱️ Auto close modal setelah 3 detik
        setTimeout(() => {
          setShowModal(false);
          setModalMessage("");
        }, 3000);
      }
    }, [firstLoad, resetTrigger]);
    
    
  
    return (
      <div className="container py-4 px-3 bg-light rounded shadow-sm">
        <h3 className="mb-4 text-center fw-bold text-primary">📈 Dashboard Kesehatan Sapi</h3>
  
        {/* Filter Tanggal */}
        <div className="row mb-4 p-3 border rounded bg-white shadow-sm">
          <div className="col-md-5">
            <label className="form-label fw-semibold">📅 Tanggal Mulai</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-5">
            <label className="form-label fw-semibold">📅 Tanggal Berakhir</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-end gap-2">
    <button 
      className="btn btn-info w-100 fw-semibold" 
      onClick={handleFilter}
    >
      🔍 Filter
    </button>
    <button 
      className="btn btn-secondary w-100 fw-semibold" 
      onClick={handleReset}
    >
      🔄 Reset
    </button>
  </div>
  
        </div>
  
        {/* Modal Alert */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content rounded shadow-sm">
                <div className="modal-header">
                  <h5 className="modal-title text-info">Informasi</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} disabled={modalLoading}></button>
                </div>
                <div className="modal-body text-center">
                  {modalLoading ? (
                    <>
                      <div className="spinner-border text-info mb-3" role="status" />
                      <p>🔄 Sedang memuat data...</p>
                    </>
                  ) : (
                    <p>{modalMessage}</p>
                  )}
                </div>
                {!modalLoading && (
                  <div className="modal-footer">
                    <button type="button" className="btn btn-info" onClick={() => setShowModal(false)}>Tutup</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
  
        {/* Rangkuman */}
        <div className="row mb-4">
          {[
            { title: "Pemeriksaan", value: summary.pemeriksaan, color: "info", icon: "🩺" },
            { title: "Gejala", value: summary.gejala, color: "primary", icon: "🦠" },
            { title: "Riwayat Penyakit", value: summary.penyakit, color: "danger", icon: "📋" },
            { title: "Riwayat Reproduksi", value: summary.reproduksi, color: "warning", icon: "🐄" },
          ].map((item, idx) => (
            <div className="col-md-3 mb-3" key={idx}>
              <div className={`card text-bg-${item.color} shadow-sm`}>
                <div className="card-body text-center">
                  <div className="fs-2">{item.icon}</div>
                  <h6 className="mt-2">{item.title}</h6>
                  <h3 className="fw-bold">{item.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Grafik */}
        <div className="row">
    {/* PieChart - Statistik Penyakit */}
    <div className="col-md-6">
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h5 className="text-center mb-3 text-secondary">🦠 Statistik Penyakit Terkonfirmasi</h5>
          <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartDiseaseData} margin={{ top: 10, right: 20, bottom: 50, left: 10 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={60} />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="value" fill="#00BFFF" radius={[4, 4, 0, 0]}>
        <LabelList dataKey="value" position="top" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
  
        </div>
      </div>
    </div>
  
    {/* BarChart - Grafik Kesehatan Sapi */}
    <div className="col-md-6">
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h5 className="text-center mb-3 text-secondary">🐄❤️ Kondisi Kesehatan Ternak</h5>
          <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartHealthData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#0d6efd">
        <LabelList dataKey="value" position="top" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
  
        </div>
      </div>
    </div>
    {/* Informasi Detail Penyakit */}
  <h5 className="mt-5 mb-3 fw-semibold text-secondary">🦠 Informasi Statistik Penyakit</h5>
  <div className="table-responsive mb-4">
    <table className="table table-bordered table-striped">
      <thead className="table-light">
        <tr>
          <th>No</th>
          <th>Nama Sapi</th>
          <th>Nama Penyakit</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        {tableDiseaseData.length > 0 ? (
          tableDiseaseData.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.cowName}</td>
              <td>{item.diseaseName}</td>
              <td>{item.description}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center text-muted">Tidak ada data penyakit</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  
  {/* Informasi Detail Kesehatan */}
  <h5 className="mb-3 fw-semibold text-secondary">🐄 Informasi Grafik Kesehatan Sapi</h5>
  <div className="table-responsive mb-5">
    <table className="table table-bordered table-striped">
      <thead className="table-light">
        <tr>
          <th>No</th>
          <th>Nama Sapi</th>
          <th>Suhu Rektal (°C)</th>
          <th>Denyut Jantung</th>
          <th>Laju Pernapasan</th>
          <th>Ruminasi</th>
        </tr>
      </thead>
      <tbody>
        {tableHealthData.length > 0 ? (
          tableHealthData.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.cowName}</td>
              <td>{item.temperature}</td>
              <td>{item.heartRate}</td>
              <td>{item.respirationRate}</td>
              <td>{item.rumination}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center text-muted">Tidak ada data pemeriksaan</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  
  </div>
  
      </div>
    );
  };
  
export default HealthyCowsCard;