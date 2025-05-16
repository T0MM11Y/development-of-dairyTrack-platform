import { useEffect, useState } from "react";
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { getDiseaseHistories } from "../../../../controllers/diseaseHistoryController";
import { getSymptoms } from "../../../../controllers/symptomController";
import { listCows } from "../../../../controllers/cowsController";
import { getReproductions } from "../../../../controllers/reproductionController";
import { Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid,BarChart, Bar
  ,LabelList
 } from "recharts";
 import Swal from "sweetalert2";

const DashboardKesehatanPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState({ pemeriksaan: 0, gejala: 0, penyakit: 0, reproduksi: 0 });
  const [chartDiseaseData, setChartDiseaseData] = useState([]);
  const [chartHealthData, setChartHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
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
        listCows(),
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
      const sakit = filteredHealth.filter(item => item.needs_attention && item.status !== 'handled').length;
      
      const chartData = [];
      
      if (sehat > 0) {
        chartData.push({ name: "Sehat", value: sehat });
      }
      if (sakit > 0) {
        chartData.push({ name: "Butuh Perhatian", value: sakit });
      }
      
      setChartHealthData(chartData);
      
  
      // ✅ Alert diletakkan setelah data berhasil diolah
      if (isFilter) {
        const total = filteredHealth.length + filteredDisease.length + filteredSymptom.length + filteredRepro.length;
        if (total === 0) {
          await Swal.fire({
            icon: "info",
            title: "Tidak Ada Data",
            text: "Tidak ditemukan data dalam rentang tanggal tersebut.",
          });
        } else {
          await Swal.fire({
            icon: "success",
            title: "Filter Berhasil",
            text: "Data berhasil difilter sesuai tanggal.",
          });
        }
      } else {
        await Swal.fire({
          icon: "success",
          title: "Data Dimuat",
          text: "Seluruh data kesehatan sapi berhasil dimuat.",
          confirmButtonText: "OK"
        });
      }
  
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Gagal Mengambil Data",
        text: "Terjadi kesalahan saat mengambil data.",
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleFilter = () => {
    if (!startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Tanggal Kosong",
        text: "Silakan isi Tanggal Mulai dan Tanggal Berakhir terlebih dahulu.",
      });
      return;
    }
  
    fetchStats(true);
  };
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setResetTrigger(true); // ⬅️ aktifkan trigger reset
  };
  
  
  useEffect(() => {
    if (firstLoad || resetTrigger) {
      fetchStats();
      setFirstLoad(false);
      setResetTrigger(false);
    }
  }, [firstLoad, resetTrigger]);
  
  

  return (
    <div className="container py-4 px-3 bg-light rounded shadow-sm">
      <h3 className="mb-4 text-center fw-bold text-primary">Dashboard Kesehatan Sapi</h3>

      {/* Filter Tanggal */}
      <div className="row mb-4 p-3 border rounded bg-white shadow-sm">
        <div className="col-md-5">
          <label className="form-label fw-semibold">Tanggal Mulai</label>
          <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="col-md-5">
          <label className="form-label fw-semibold">Tanggal Berakhir</label>
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

    

      <div className="row mb-4">
  {[
    { title: "Pemeriksaan", value: summary.pemeriksaan, color: "info", icon: "bi-clipboard2-check" },
    { title: "Gejala", value: summary.gejala, color: "primary", icon: "bi-emoji-dizzy" },
    { title: "Riwayat Penyakit", value: summary.penyakit, color: "danger", icon: "bi-file-medical" },
    { title: "Riwayat Reproduksi", value: summary.reproduksi, color: "warning", icon: "bi-gender-ambiguous" },
  ].map((item, idx) => (
    <div className="col-md-6 col-xl-3 mb-4" key={idx}>
      <div className={`card text-white bg-${item.color} bg-opacity-75 border-0 shadow-sm rounded-4`}>
        <div className="card-body text-center py-4">
          <i className={`bi ${item.icon} fs-1 mb-2`}></i>
          <h6 className="text-uppercase mb-1 fw-semibold">{item.title}</h6>
          <h2 className="fw-bold mb-0">{item.value}</h2>
        </div>
      </div>
    </div>
  ))}
</div>
     {/* Grafik */}
<div className="row">
  {/* Grafik Statistik Penyakit */}
  <div className="col-md-6">
    <div className="card shadow border-0 mb-4 rounded-4">
      <div className="card-body">
        <h5 className="text-center text-dark mb-3">
          <i className="bi bi-virus2 me-2 text-danger"></i>
          Statistik Penyakit Terkonfirmasi
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartDiseaseData}
            margin={{ top: 10, right: 30, bottom: 50, left: 10 }}
          >
            <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              angle={-30}
              textAnchor="end"
              interval={0}
              height={70}
              tick={{ fill: "#6c757d", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6c757d", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#f8f9fa", borderRadius: 10 }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />
            <Legend verticalAlign="top" height={30} />
            <Bar
              dataKey="value"
              fill="url(#colorDisease)"
              radius={[8, 8, 0, 0]}
              barSize={40}
            >
              <LabelList dataKey="value" position="top" fill="#000" />
            </Bar>
            <defs>
              <linearGradient id="colorDisease" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ffa8a8" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  {/* Grafik Kesehatan Ternak */}
  <div className="col-md-6">
    <div className="card shadow border-0 mb-4 rounded-4">
      <div className="card-body">
        <h5 className="text-center text-dark mb-3">
          <i className="bi bi-heart-pulse-fill me-2 text-primary"></i>
          Kondisi Kesehatan Ternak
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartHealthData}
            margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#dee2e6" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6c757d", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6c757d", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#f8f9fa", borderRadius: 10 }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />
            <Legend verticalAlign="top" height={30} />
            <Bar
              dataKey="value"
              fill="url(#colorHealth)"
              radius={[8, 8, 0, 0]}
              barSize={60}
            >
              <LabelList dataKey="value" position="top" fill="#000" />
            </Bar>
            <defs>
              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#339af0" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#74c0fc" stopOpacity={0.7} />
              </linearGradient>
            </defs>
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

export default DashboardKesehatanPage;
