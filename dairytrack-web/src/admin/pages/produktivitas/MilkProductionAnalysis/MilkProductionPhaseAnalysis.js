import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { getDailyMilkTotalsByCowId } from "../../../../api/produktivitas/dailyMilkTotal";
import { getCows } from "../../../../api/peternakan/cow";
import "chart.js/auto";

const MilkProductionPhaseAnalysis = () => {
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [selectedCow, setSelectedCow] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [milkData, setMilkData] = useState([]);
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const [chartPage, setChartPage] = useState(1);
  const chartItemsPerPage = 20; // Batasi jumlah data per halaman grafik
  const [selectedStatus, setSelectedStatus] = useState("all");
  const chartIndexOfLastItem = chartPage * chartItemsPerPage;
  const chartIndexOfFirstItem = chartIndexOfLastItem - chartItemsPerPage;

  const filteredMilkData = useMemo(() => {
    let data = milkData;

    if (selectedPhase !== "all") {
      data = data.filter(
        (entry) =>
          (entry.cow?.lactation_phase || "unknown").toLowerCase() ===
          selectedPhase
      );
    }

    if (selectedCow !== "all") {
      data = data.filter((entry) => entry.cow?.id === parseInt(selectedCow));
    }

    if (selectedDate) {
      data = data.filter(
        (entry) =>
          new Date(entry.date).toISOString().split("T")[0] === selectedDate
      );
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      data = data.filter((entry) => {
        const cowName = entry.cow?.name?.toLowerCase() || "";
        const date = new Date(entry.date)
          .toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
          .toLowerCase();
        const volume = entry.total_volume.toString().toLowerCase();
        const lactationPhase = entry.cow?.lactation_phase?.toLowerCase() || "";

        return (
          cowName.includes(searchLower) ||
          date.includes(searchLower) ||
          volume.includes(searchLower) ||
          lactationPhase.includes(searchLower)
        );
      });
    }
    if (selectedStatus !== "all") {
      data = data.filter((entry) => {
        if (selectedStatus === "increasing") return entry.total_volume > 25;
        if (selectedStatus === "decreasing") return entry.total_volume < 18;
        if (selectedStatus === "stable")
          return entry.total_volume >= 18 && entry.total_volume <= 25;
        return true;
      });
    }

    return data;
  }, [milkData, selectedPhase, selectedCow, selectedDate, selectedStatus]);
  const paginatedChartData = useMemo(() => {
    return filteredMilkData.slice(chartIndexOfFirstItem, chartIndexOfLastItem);
  }, [filteredMilkData, chartIndexOfFirstItem, chartIndexOfLastItem]);

  const chartPagination = () => {
    const totalChartPages = Math.ceil(
      filteredMilkData.length / chartItemsPerPage
    );
    const chartPages = [];

    for (let i = 1; i <= totalChartPages; i++) {
      chartPages.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${
            chartPage === i ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setChartPage(i)}
        >
          {i}
        </button>
      );
    }

    return chartPages;
  };
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

  // Data untuk grafik batang
  const chartData = {
    labels: filteredMilkData.map(
      (entry) =>
        `${entry.cow?.name || "Unknown"} - ${new Date(
          entry.date
        ).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`
    ),
    datasets: [
      {
        label: "Milk Production (Liters)",
        data: filteredMilkData.map((entry) => entry.total_volume),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
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
        title: {
          display: true,
          text: "Volume (Liters)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Cow Name - Date",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const entry = filteredMilkData[context.dataIndex];
            const lactationPhase = entry.cow?.lactation_phase || "N/A";
            return `Volume: ${context.raw} Liters (Phase: ${lactationPhase})`;
          },
        },
      },
    },
  };

  // Data untuk grafik pie
  const pieChartData = {
    labels: ["Early", "Mid", "Late", "Dry"],
    datasets: [
      {
        label: "Lactation Phase Distribution",
        data: ["early", "mid", "late", "dry"].map(
          (phase) =>
            filteredMilkData.filter(
              (entry) =>
                (entry.cow?.lactation_phase || "unknown").toLowerCase() ===
                phase
            ).length
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const currentData = filteredMilkData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredMilkData.length / itemsPerPage);
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(1)}
        >
          First
        </button>
      );
      pages.push(
        <button
          key="prev"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(currentPage - 1)}
        >
          Previous
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <span key="start-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${
            currentPage === i ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => paginate(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <span key="end-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(currentPage + 1)}
        >
          Next
        </button>
      );
      pages.push(
        <button
          key="last"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(totalPages)}
        >
          Last
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">
        <i className="bi bi-graph-up"></i> Milk Production Phase Analysis
      </h2>

      {/* Filter */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{ width: "220px" }}>
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

        <div style={{ width: "220px" }}>
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
        <div>
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div style={{ width: "140px" }}>
          <label className="form-label">Select Status</label>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="increasing">Increasing</option>
            <option value="decreasing">Decreasing</option>
            <option value="stable">Stable</option>
          </select>
        </div>
        <div className="col-md-4 ms-auto">
          <label className="form-label">Search</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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
            No data available for selected filters.
          </p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cow Name</th>
                    <th>Date</th>
                    <th>Volume (Liters)</th>
                    <th>Lactation Phase</th>

                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((entry, index) => (
                    <tr key={`${entry.id}-${index}`}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{entry.cow?.name || "Unknown"}</td>
                      <td>
                        {new Date(entry.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>{entry.total_volume}</td>
                      <td>{entry.cow?.lactation_phase || "N/A"}</td>
                      <td>
                        {entry.total_volume < 18 ? (
                          <>
                            <i className="fas fa-arrow-down text-danger me-1"></i>{" "}
                            Decreasing
                          </>
                        ) : entry.total_volume > 25 ? (
                          <>
                            <i className="fas fa-arrow-up text-success me-1"></i>{" "}
                            Increasing
                          </>
                        ) : (
                          <>
                            <i className="fas fa-minus text-warning me-1"></i>{" "}
                            Stable
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="mb-0">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredMilkData.length)} of{" "}
                {filteredMilkData.length} entries
              </p>
              <nav>{renderPagination()}</nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MilkProductionPhaseAnalysis;
