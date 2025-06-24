// DashboardKesehatanPage.js (versi lengkap dengan pagination untuk 2 tabel)

import { useEffect, useState } from "react";
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { getDiseaseHistories } from "../../../../controllers/diseaseHistoryController";
import { getSymptoms } from "../../../../controllers/symptomController";
import { listCows } from "../../../../controllers/cowsController";
import { getReproductions } from "../../../../controllers/reproductionController";
import { Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList } from "recharts";
import Swal from "sweetalert2";

const PAGE_SIZE = 5;

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
  const [diseasePage, setDiseasePage] = useState(1);
  const [healthPage, setHealthPage] = useState(1);

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
        getHealthChecks(), getDiseaseHistories(), getSymptoms(), listCows(), getReproductions()
      ]);

      const filteredHealth = filterByDate(healthChecks);
      const filteredDisease = filterByDate(diseaseHistories);
      const filteredSymptom = filterByDate(symptoms);
      const filteredRepro = filterByDate(reproductions, "recorded_at");

      setTableDiseaseData(filteredDisease.map(item => ({
        cowName: item.health_check?.cow?.name || "-",
        diseaseName: item.disease_name || "-",
        description: item.description || "-",
      })));

      setTableHealthData(filteredHealth.map(item => ({
        cowName: item.cow?.name || "-",
        temperature: item.rectal_temperature,
        heartRate: item.heart_rate,
        respirationRate: item.respiration_rate,
        rumination: item.rumination,
        status: item.status,
      })));

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

      const sehat = filteredHealth.filter(i => !i.needs_attention).length;
      const sakit = filteredHealth.filter(i => i.needs_attention && i.status !== 'handled').length;
      const sudahditangani = filteredHealth.filter(i => i.needs_attention && i.status === 'handled').length;

      const chartData = [];
      if (sehat > 0) chartData.push({ name: "Healthy", value: sehat });
      if (sakit > 0) chartData.push({ name: "Needs Attention", value: sakit });
      if (sudahditangani > 0) chartData.push({ name: "Handled", value: sudahditangani });
      setChartHealthData(chartData);

      if (isFilter) {
        const total = filteredHealth.length + filteredDisease.length + filteredSymptom.length + filteredRepro.length;
        await Swal.fire({
    icon: total === 0 ? "info" : "success",
    title: total === 0 ? "No Data Found" : "Filter Applied",
    text: total === 0
      ? "No data found within the selected date range."
      : "Data successfully filtered by date."
  });

     } else {
  await Swal.fire({
    icon: "success",
    title: "Data Loaded",
    text: "All cow health data has been successfully loaded."
  });
}

   } catch (err) {
  console.error(err);
  await Swal.fire({
    icon: "error",
    title: "Failed to Fetch Data",
    text: "An error occurred while retrieving the data."
  });
} finally {
  setLoading(false);
}
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
Swal.fire({
  icon: "warning",
  title: "Empty Date",
  text: "Please fill in both Start Date and End Date first."
});
      return;
    }
    fetchStats(true);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setResetTrigger(true);
  };

  useEffect(() => {
    if (firstLoad || resetTrigger) {
      fetchStats();
      setFirstLoad(false);
      setResetTrigger(false);
    }
  }, [firstLoad, resetTrigger]);

  const paginatedDisease = tableDiseaseData.slice((diseasePage - 1) * PAGE_SIZE, diseasePage * PAGE_SIZE);
  const paginatedHealth = tableHealthData.slice((healthPage - 1) * PAGE_SIZE, healthPage * PAGE_SIZE);
  

  return (
    <div className="container py-4 px-3 bg-light rounded shadow-sm">
      <h3 className="mb-4 text-center fw-bold text-primary">Cow Health Dashboard</h3>
      {/* Filter Tanggal */}
      <div className="row mb-4 p-3 border rounded bg-white shadow-sm">
        <div className="col-md-5">
          <label className="form-label fw-semibold">Start Date</label>
          <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="col-md-5">
          <label className="form-label fw-semibold">End Date</label>
          <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      <div className="col-12 col-md-2">
  <div className="d-flex flex-column flex-md-row gap-2">
    <button className="btn btn-info w-100 fw-semibold" onClick={handleFilter}>
      <i className="bi bi-funnel-fill me-2"></i> Filter
    </button>
    <button className="btn btn-secondary w-100 fw-semibold" onClick={handleReset}>
      <i className="bi bi-arrow-clockwise me-2"></i> Reset
    </button>
  </div>
</div>

      </div>
          <div className="row mb-4">
  {[
    { title: "Health Checks", value: summary.pemeriksaan, color: "info", icon: "bi-clipboard2-check" },
    { title: "Symptoms", value: summary.gejala, color: "primary", icon: "bi-emoji-dizzy" },
    { title: "Disease History", value: summary.penyakit, color: "danger", icon: "bi-file-medical" },
    { title: "Reproduction History", value: summary.reproduksi, color: "warning", icon: "bi-gender-ambiguous" },
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
Confirmed Disease Statistics
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartDiseaseData} margin={{ top: 10, right: 30, bottom: 50, left: 10 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={70} tick={{ fill: "#6c757d", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#6c757d", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#f8f9fa", borderRadius: 10 }} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Legend verticalAlign="top" height={30} />
            <Bar dataKey="value" fill="url(#colorDisease)" radius={[8, 8, 0, 0]} barSize={40}>
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
Livestock Health Condition
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartHealthData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#dee2e6" />
            <XAxis dataKey="name" tick={{ fill: "#6c757d", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#6c757d", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#f8f9fa", borderRadius: 10 }} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Legend verticalAlign="top" height={30} />
            <Bar dataKey="value" fill="url(#colorHealth)" radius={[8, 8, 0, 0]} barSize={60}>
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
</div>

{/* 🔬 Tabel Statistik Penyakit */}
<section className="mb-5">
  <h5 className="mt-5 mb-3 fw-semibold text-secondary fs-5 d-flex align-items-center">
    <i className="bi bi-activity text-danger me-2 fs-4"></i> Confirmed Disease Statistics
  </h5>
  <div className="table-responsive shadow-sm rounded-3 border bg-white">
    <table className="table table-bordered mb-0">
 <thead className="table-light">
  <tr className="text-center align-middle">
    <th style={{ width: "5%" }}>#</th>
    <th>Cow Name</th>
<th>Disease Name</th>
<th>Description</th>
  </tr>
</thead>


      <tbody>
        {paginatedDisease.length > 0 ? (
          paginatedDisease.map((item, idx) => (
            <tr key={idx}>
              <td className="text-center">{(diseasePage - 1) * PAGE_SIZE + idx + 1}</td>
              <td>{item.cowName}</td>
              <td>{item.diseaseName}</td>
              <td>{item.description}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center text-muted py-3">
              <i className="bi bi-info-circle me-1"></i> No disease data found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light rounded-bottom">
      <button
        className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
        disabled={diseasePage === 1}
        onClick={() => setDiseasePage(diseasePage - 1)}
      >
        <i className="bi bi-chevron-left"></i> Previous
      </button>
      <span className="text-muted fw-semibold">Page  {diseasePage}</span>
      <button
        className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
        disabled={diseasePage >= Math.ceil(tableDiseaseData.length / PAGE_SIZE)}
        onClick={() => setDiseasePage(diseasePage + 1)}
      >
        Next  <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</section>

{/* ❤️‍🩹 Tabel Kesehatan Ternak */}
<section>
  <h5 className="mt-5 mb-3 fw-semibold text-secondary fs-5 d-flex align-items-center">
    <i className="bi bi-heart-pulse-fill text-primary me-2 fs-4"></i> Cow Health Condition
  </h5>
  <div className="table-responsive shadow-sm rounded-3 border bg-white">
    <table className="table table-bordered mb-0">
   <thead className="table-light">
  <tr className="text-center align-middle">
    <th style={{ width: "5%" }}>#</th>
    <th>Cow Name</th>
        <th>Rectal Temperature (°C)</th>
        <th>Heart Rate</th>
        <th>Respiration Rate</th>
        <th>Rumination</th>
        <th>Status</th>
  </tr>
</thead>


      <tbody>
        {paginatedHealth.length > 0 ? (
          paginatedHealth.map((item, idx) => (
            <tr key={idx}>
              <td className="text-center">{(healthPage - 1) * PAGE_SIZE + idx + 1}</td>
              <td>{item.cowName}</td>
              <td>{item.temperature}</td>
              <td>{item.heartRate}</td>
              <td>{item.respirationRate}</td>
              <td>{item.rumination}</td>
              <td>{item.status}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center text-muted py-3">
              <i className="bi bi-info-circle me-1"></i>  No health check data found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light rounded-bottom">
      <button
        className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
        disabled={healthPage === 1}
        onClick={() => setHealthPage(healthPage - 1)}
      >
        <i className="bi bi-chevron-left"></i> Previous
      </button>
      <span className="text-muted fw-semibold">Page {healthPage}</span>
      <button
        className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
        disabled={healthPage >= Math.ceil(tableHealthData.length / PAGE_SIZE)}
        onClick={() => setHealthPage(healthPage + 1)}
      >
        Next <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</section>
      </div>
  );
};

export default DashboardKesehatanPage;
