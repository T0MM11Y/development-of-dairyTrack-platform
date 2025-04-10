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
    }
  }, []);

  const fetchMilkData = useCallback(
    async (cowId) => {
      setIsLoading(true);
      try {
        if (cowId === "all") {
          const allData = await Promise.all(
            cows.map((cow) => getDailyMilkTotalsByCowId(cow.id))
          );
          const mergedData = allData
            .flat()
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setMilkData(mergedData);
        } else {
          const selectedCowExists = cows.some(
            (cow) => cow.id === parseInt(cowId)
          );
          if (!selectedCowExists) {
            console.error(`Cow with ID ${cowId} does not exist.`);
            setMilkData([]);
            return;
          }
          const data = await getDailyMilkTotalsByCowId(cowId);
          setMilkData(data);
        }
      } catch (error) {
        console.error("Failed to fetch milk data:", error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [cows]
  );

  useEffect(() => {
    fetchCows();
  }, [fetchCows]);

  useEffect(() => {
    fetchMilkData(selectedCow);
  }, [selectedCow, fetchMilkData]);

  const chartData = {
    labels: milkData.map((entry) =>
      format(new Date(entry.date), "dd MMMM yyyy", { locale: id })
    ),
    datasets: [
      {
        label: "Milk Production (Liters)",
        data: milkData.map((entry) => entry.total_volume),
        borderColor: "rgba(75, 192, 192, 1)",
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
          gradient.addColorStop(0, "rgba(75, 192, 192, 0.5)");
          gradient.addColorStop(1, "rgba(75, 192, 192, 0)");
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
        pointHoverBorderColor: "#fff",
        tension: 0.4, // Smooth curve
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 30,
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
          text: "Date",
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
            const value = context.raw;
            return `Volume: ${value} Liters`;
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
      annotation: {
        annotations: {
          standard: {
            type: "line",
            yMin: 18,
            yMax: 18,
            borderColor: "orange",
            borderWidth: 2,
            label: {
              content: "Standard (18L)",
              enabled: true,
              position: "end",
            },
          },
          max: {
            type: "line",
            yMin: 25,
            yMax: 25,
            borderColor: "red",
            borderWidth: 2,
            label: {
              content: "Max (25L)",
              enabled: true,
              position: "end",
            },
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">
        <i className="bi bi-graph-up"></i> Milk Production Analysis
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
        ) : milkData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>No data available for the selected cow.</p>
        )}
      </div>

      {/* Table Section */}
      <div className="card p-3">
        <h5>Milk Production Analysis</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Volume (Liters)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {milkData.map((entry) => {
              const status =
                entry.total_volume < 18
                  ? "Decreasing"
                  : entry.total_volume > 25
                  ? "Increasing"
                  : "Stable";
              return (
                <tr key={entry.id}>
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
      </div>
    </div>
  );
};

export default MilkProductionAnalysis;
