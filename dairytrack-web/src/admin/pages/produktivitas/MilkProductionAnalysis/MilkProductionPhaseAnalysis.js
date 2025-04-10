import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { getDailyMilkTotalsByCowId } from "../../../../api/produktivitas/dailyMilkTotal";
import { getCows } from "../../../../api/peternakan/cow";
import "chart.js/auto";

const MilkProductionPhaseAnalysis = () => {
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [milkData, setMilkData] = useState([]);
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data sapi dan produksi susu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cowData, milkRecords] = await Promise.all([
        getCows(),
        Promise.all(
          (await getCows()).map((cow) => getDailyMilkTotalsByCowId(cow.id))
        ),
      ]);

      setCows(cowData);
      setMilkData(
        milkRecords.flat().sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data berdasarkan fase laktasi yang dipilih
  const filteredMilkData = useMemo(() => {
    if (selectedPhase === "all") return milkData;
    return milkData.filter(
      (entry) =>
        (entry.cow?.lactation_phase || "unknown").toLowerCase() ===
        selectedPhase
    );
  }, [milkData, selectedPhase]);

  // Data untuk grafik (di-memoize untuk optimasi)
  const { chartData, pieChartData } = useMemo(() => {
    // Hitung total produksi per fase untuk grafik batang
    const phaseProduction = filteredMilkData.reduce((acc, entry) => {
      const phase = (entry.cow?.lactation_phase || "Unknown").toLowerCase();
      acc[phase] = (acc[phase] || 0) + entry.total_volume;
      return acc;
    }, {});

    // Hitung distribusi sapi unik per fase untuk grafik pie
    const cowPhaseMap = cows.reduce((acc, cow) => {
      const phase = (cow.lactation_phase || "Unknown").toLowerCase();
      if (selectedPhase === "all" || phase === selectedPhase) {
        acc[phase] = (acc[phase] || 0) + 1;
      }
      return acc;
    }, {});

    // Warna konsisten untuk kedua grafik
    const getColor = (phase) => {
      switch (phase) {
        case "early":
          return ["rgba(75, 192, 192, 0.6)", "rgba(75, 192, 192, 1)"];
        case "dry":
          return ["rgba(255, 99, 132, 0.6)", "rgba(255, 99, 132, 1)"];
        case "late":
          return ["rgba(54, 162, 235, 0.6)", "rgba(54, 162, 235, 1)"];
        case "mid":
          return ["rgba(255, 206, 86, 0.6)", "rgba(255, 206, 86, 1)"];
        default:
          return ["rgba(153, 102, 255, 0.6)", "rgba(153, 102, 255, 1)"];
      }
    };

    const phases = Object.keys(phaseProduction);
    const piePhases = Object.keys(cowPhaseMap);

    return {
      chartData: {
        labels: phases,
        datasets: [
          {
            label: "Milk Production by Lactation Phase (Liters)",
            data: phases.map((phase) => phaseProduction[phase]),
            backgroundColor: phases.map((phase) => getColor(phase)[0]),
            borderColor: phases.map((phase) => getColor(phase)[1]),
            borderWidth: 1,
          },
        ],
      },
      pieChartData: {
        labels: piePhases,
        datasets: [
          {
            label: "Cow Distribution by Lactation Phase",
            data: piePhases.map((phase) => cowPhaseMap[phase]),
            backgroundColor: piePhases.map((phase) => getColor(phase)[0]),
            borderColor: piePhases.map((phase) => getColor(phase)[1]),
            borderWidth: 1,
          },
        ],
      },
    };
  }, [filteredMilkData, cows, selectedPhase]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
        title: {
          display: true,
          text: "Volume (Liters)",
          font: { size: 14 },
        },
      },
      x: {
        title: {
          display: true,
          text: "Lactation Phase",
          font: { size: 14 },
        },
      },
    },
    plugins: {
      legend: { display: true, position: "top" },
    },
  };

  // Komponen untuk status laktasi
  const LactationStatusBadge = ({ status }) => (
    <span className={`badge ${status ? "bg-success" : "bg-secondary"}`}>
      {status ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="container py-4">
      <h2 className="text-primary">
        <i className="bi bi-graph-up"></i> Milk Production Phase Analysis
      </h2>

      {/* Filter fase laktasi */}
      <div className="mb-4">
        <label className="form-label">Select Lactation Phase</label>
        <select
          className="form-select"
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
        >
          <option value="all">All Phases</option>
          <option value="early">Early</option>
          <option value="dry">Dry</option>
          <option value="late">Late</option>
          <option value="mid">Mid</option>
        </select>
      </div>

      {/* Grafik */}
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3 mb-4" style={{ height: "400px" }}>
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : milkData.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="text-center my-auto">
                No milk production data available.
              </p>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 mb-4" style={{ height: "400px" }}>
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : cows.length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <p className="text-center my-auto">No cow data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="card p-3">
        <h5>Milk Production Analysis</h5>
        {filteredMilkData.length === 0 ? (
          <p className="text-center py-3">
            No data available for selected phase.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cow Name</th>
                  <th>Date</th>
                  <th>Volume (Liters)</th>
                  <th>Status</th>
                  <th>Lactation Phase</th>
                  <th>Lactation Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMilkData.map((entry, index) => {
                  const status =
                    entry.total_volume < 18
                      ? "Decreasing"
                      : entry.total_volume > 25
                      ? "Increasing"
                      : "Stable";

                  const statusClass =
                    status === "Decreasing"
                      ? "text-danger"
                      : status === "Increasing"
                      ? "text-success"
                      : "text-warning";

                  return (
                    <tr key={`${entry.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{entry.cow?.name || "Unknown"}</td>
                      <td>
                        {new Date(entry.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>{entry.total_volume}</td>
                      <td className={statusClass}>{status}</td>
                      <td>{entry.cow?.lactation_phase || "N/A"}</td>
                      <td>
                        <LactationStatusBadge
                          status={entry.cow?.lactation_status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilkProductionPhaseAnalysis;
