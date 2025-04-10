import { useEffect, useState } from "react";
import { getHealthChecks } from "../../../api/kesehatan/healthCheck";
import { getDiseaseHistories } from "../../../api/kesehatan/diseaseHistory";
import { getSymptoms } from "../../../api/kesehatan/symptom";
import { getCows } from "../../../api/peternakan/cow";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#198754", "#dc3545", "#0d6efd", "#ffc107", "#6610f2"];

const DashboardKesehatanPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [treatmentPieData, setTreatmentPieData] = useState([]);
  const [topSickCows, setTopSickCows] = useState([]);
  const [gejalaDistribusi, setGejalaDistribusi] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hcs, symptoms, diseases, cows] = await Promise.all([
          getHealthChecks(),
          getSymptoms(),
          getDiseaseHistories(),
          getCows(),
        ]);

        // 1. Statistik bulanan
        const monthMap = {};
        const getMonth = (dateStr) => new Date(dateStr).toLocaleString("default", { month: "short", year: "numeric" });

        hcs.forEach((hc) => {
          const m = getMonth(hc.checkup_date);
          if (!monthMap[m]) monthMap[m] = { pemeriksaan: 0, gejala: 0, treated: 0, untreated: 0 };
          monthMap[m].pemeriksaan++;
        });

        symptoms.forEach((s) => {
          const m = getMonth(s.created_at || s.updated_at || new Date());
          if (!monthMap[m]) monthMap[m] = { pemeriksaan: 0, gejala: 0, treated: 0, untreated: 0 };
          monthMap[m].gejala++;
          if (s.treatment_status === "Treated") monthMap[m].treated++;
          else monthMap[m].untreated++;
        });

        const monthly = Object.entries(monthMap).map(([month, val]) => ({
          month,
          ...val,
        })).sort((a, b) => new Date("1 " + a.month) - new Date("1 " + b.month));

        setMonthlyStats(monthly);

        // 2. Pie Chart Penanganan
        const treated = symptoms.filter((s) => s.treatment_status === "Treated").length;
        const untreated = symptoms.length - treated;
        setTreatmentPieData([
          { name: "Sudah Ditangani", value: treated },
          { name: "Belum Ditangani", value: untreated },
        ]);

        // 3. Top 5 Sapi Sakit
        const cowCount = {};
        const cowMap = {};
        cows.forEach((c) => (cowMap[c.id] = c.name));
        symptoms.forEach((s) => {
          const cowId = hcs.find((h) => h.id === s.health_check)?.cow;
          if (!cowId) return;
          cowCount[cowId] = (cowCount[cowId] || 0) + 1;
        });
        diseases.forEach((d) => {
          cowCount[d.cow] = (cowCount[d.cow] || 0) + 1;
        });
        const top5 = Object.entries(cowCount)
          .map(([cowId, count]) => ({ name: cowMap[cowId] || `Sapi ${cowId}`, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopSickCows(top5);

        // 4. Distribusi Jenis Gejala
        const gejalaFields = [
          "eye_condition",
          "mouth_condition",
          "nose_condition",
          "anus_condition",
          "leg_condition",
          "skin_condition",
          "behavior",
          "weight_condition",
          "reproductive_condition",
        ];
        const gejalaStat = {};
        symptoms.forEach((s) => {
          gejalaFields.forEach((f) => {
            const val = s[f];
            if (val && val !== "Normal") {
              gejalaStat[val] = (gejalaStat[val] || 0) + 1;
            }
          });
        });
        setGejalaDistribusi(Object.entries(gejalaStat).map(([name, value]) => ({ name, value })));

        setSummary({
          pemeriksaan: hcs.length,
          gejala: symptoms.length,
          penyakit: diseases.length,
          reproduksi: 0,
        });
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Dashboard Kesehatan Peternakan</h3>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <>
          {/* Rangkuman */}
          <div className="row mb-4">
            {[
              { title: "Pemeriksaan", value: summary.pemeriksaan, color: "info" },
              { title: "Gejala", value: summary.gejala, color: "primary" },
              { title: "Riwayat Penyakit", value: summary.penyakit, color: "danger" },
            ].map((item, idx) => (
              <div className="col-md-4 mb-3" key={idx}>
                <div className={`card text-bg-${item.color}`}>
                  <div className="card-body text-center">
                    <h5>{item.title}</h5>
                    <h2 className="fw-bold">{item.value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Jumlah Bulanan */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Statistik Bulanan</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pemeriksaan" fill="#0d6efd" name="Pemeriksaan" />
                  <Bar dataKey="gejala" fill="#ffc107" name="Gejala" />
                  <Bar dataKey="treated" fill="#198754" name="Sudah Ditangani" />
                  <Bar dataKey="untreated" fill="#dc3545" name="Belum Ditangani" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Penanganan */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Persentase Penanganan Gejala</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={treatmentPieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {treatmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Sapi */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Top 5 Sapi Paling Sering Sakit</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSickCows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6610f2" name="Jumlah Gejala/Penyakit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribusi Jenis Gejala */}
          <div className="card mb-5">
            <div className="card-body">
              <h5 className="card-title">Distribusi Jenis Gejala</h5>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gejalaDistribusi} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={200} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0dcaf0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardKesehatanPage;
