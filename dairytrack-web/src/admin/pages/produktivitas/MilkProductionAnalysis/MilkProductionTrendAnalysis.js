import React, { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { getDailyMilkTotalsByCowId } from "../../../../api/produktivitas/dailyMilkTotal";
import { getCows } from "../../../../api/peternakan/cow";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import "chart.js/auto";

const MilkProductionAnalysis = () => {
  const [cows, setCows] = useState([]);
  const [selectedCow, setSelectedCow] = useState("all");
  const [milkData, setMilkData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCows = useCallback(async () => {
    try {
      const cowData = await getCows();
      setCows(cowData);
    } catch (error) {
      console.error("Failed to fetch cows:", error.message);
      // Tambahkan penanganan error yang lebih baik, seperti menampilkan notifikasi ke user
    }
  }, []);

  const fetchMilkData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allData = await Promise.all(
        cows.map((cow) => getDailyMilkTotalsByCowId(cow.id))
      );
      const mergedData = allData
        .flat()
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setMilkData(mergedData);
    } catch (error) {
      console.error("Failed to fetch milk data:", error.message);
      // Tambahkan penanganan error yang lebih baik
    } finally {
      setIsLoading(false);
    }
  }, [cows]); // Tambahkan cows sebagai dependency

  useEffect(() => {
    fetchCows();
  }, [fetchCows]);

  useEffect(() => {
    if (cows.length > 0) {
      fetchMilkData();
    }
  }, [cows, fetchMilkData]); // Jalankan fetchMilkData hanya setelah cows terload

  // Filter data untuk tabel DAN grafik berdasarkan sapi yang dipilih
  const filteredData =
    selectedCow === "all"
      ? milkData
      : milkData.filter((entry) => entry.cow?.id === parseInt(selectedCow));

  const chartData = {
    labels: filteredData.map(
      (entry) =>
        `${entry.cow?.name || "Unknown"} - ${format(
          new Date(entry.date),
          "dd MMMM yyyy",
          { locale: id }
        )}`
    ),
    datasets: [
      {
        type: "line", // Grafik garis
        label: "Milk Production (Liters)",
        data: filteredData.map((entry) => entry.total_volume),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
        pointHoverBorderColor: "#fff",
        tension: 0.4, // Smooth curve
        fill: true,
      },
      {
        type: "bar", // Grafik batang
        label: "Milk Production (Bar)",
        data: filteredData.map((entry) => entry.total_volume),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(54, 162, 235, 0.8)");
          gradient.addColorStop(1, "rgba(54, 162, 235, 0.2)");
          return gradient;
        },
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
        title: {
          display: true,
          text: "Volume (Liters)",
          color: "#666",
          font: {
            size: 14,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Cow Name - Date",
          color: "#666",
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const entry = filteredData[context.dataIndex];
            const cowName = entry.cow?.name || "Unknown";
            const volume = context.raw;
            return `Cow: ${cowName}, Volume: ${volume} Liters`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 12,
          },
        },
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutBounce", // Animasi lebih menarik
    },
  };
  // Perbaikan penanganan status laktasi
  const getLactationStatusBadge = (status) => {
    return status ? (
      <span className="badge bg-success">Active</span>
    ) : (
      <span className="badge bg-secondary">Inactive</span>
    );
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">
        <i className="bi bi-graph-up"></i> Milk Production Trend Analysis
      </h2>

      {/* Dropdown for Cow Selection */}
      <div className="mb-4">
        <label className="form-label">Select Cow</label>
        <select
          className="form-select"
          value={selectedCow}
          onChange={(e) => setSelectedCow(e.target.value)}
        >
          <option value="all">All Cows</option>
          {cows.map((cow) => (
            <option key={cow.id} value={cow.id}>
              {cow.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chart Section */}
      <div className="card p-3 mb-4" style={{ height: "400px" }}>
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>No data available.</p>
        )}
      </div>

      {/* Table Section */}
      <div className="card p-3">
        <h5>Milk Production Analysis</h5>
        {filteredData.length === 0 ? (
          <p>No data available for selected cow.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Cow Name</th>
                <th>Date</th>
                <th>Volume (Liters)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => {
                const status =
                  entry.total_volume < 18
                    ? "Decreasing"
                    : entry.total_volume > 25
                    ? "Increasing"
                    : "Stable";

                return (
                  <tr key={`${entry.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{entry.cow?.name || "Unknown"}</td>
                    <td>
                      {format(new Date(entry.date), "dd MMMM yyyy", {
                        locale: id,
                      })}
                    </td>
                    <td>{entry.total_volume}</td>
                    <td
                      className={
                        status === "Decreasing"
                          ? "text-danger"
                          : status === "Increasing"
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MilkProductionAnalysis;
