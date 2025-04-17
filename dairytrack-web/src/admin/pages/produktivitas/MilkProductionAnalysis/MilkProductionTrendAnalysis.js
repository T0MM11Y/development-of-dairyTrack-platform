import React, { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { getDailyMilkTotalsByCowId } from "../../../../api/produktivitas/dailyMilkTotal";
import { getCows } from "../../../../api/peternakan/cow";
import { format, subDays, subMonths, subYears } from "date-fns";

import { id } from "date-fns/locale";
import "chart.js/auto";

const MilkProductionAnalysis = () => {
  const [cows, setCows] = useState([]);
  const [selectedCow, setSelectedCow] = useState("all");
  const [milkData, setMilkData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all"); // Tambahkan state untuk status
  const [selectedTimeRange, setSelectedTimeRange] = useState("all"); // Tambahkan state untuk filter waktu

  const [originalMilkData, setOriginalMilkData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data based on selected cow, date, status, and time range
  const filteredData = useCallback(() => {
    let data = originalMilkData;

    if (selectedCow !== "all") {
      data = data.filter((entry) => entry.cow?.id === parseInt(selectedCow));
    }

    if (selectedDate) {
      data = data.filter(
        (entry) => format(new Date(entry.date), "yyyy-MM-dd") === selectedDate
      );
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

    if (selectedTimeRange !== "all") {
      const now = new Date();
      if (selectedTimeRange === "last7days") {
        data = data.filter((entry) => new Date(entry.date) >= subDays(now, 7));
      } else if (selectedTimeRange === "lastMonth") {
        data = data.filter(
          (entry) => new Date(entry.date) >= subMonths(now, 1)
        );
      } else if (selectedTimeRange === "lastYear") {
        data = data.filter((entry) => new Date(entry.date) >= subYears(now, 1));
      }
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      data = data.filter((entry) => {
        const cowName = entry.cow?.name?.toLowerCase() || "";
        const date = format(new Date(entry.date), "dd MMMM yyyy", {
          locale: id,
        }).toLowerCase();
        const volume = entry.total_volume.toString().toLowerCase();

        return (
          cowName.includes(searchLower) ||
          date.includes(searchLower) ||
          volume.includes(searchLower)
        );
      });
    }

    return data;
  }, [
    originalMilkData,
    selectedCow,
    selectedDate,
    selectedStatus,
    selectedTimeRange,
    searchQuery,
  ]);

  const currentData = filteredData().slice(indexOfFirstItem, indexOfLastItem);

  const fetchCows = useCallback(async () => {
    try {
      const cowData = await getCows();
      setCows(cowData);
    } catch (error) {
      console.error("Failed to fetch cows:", error.message);
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
      setOriginalMilkData(mergedData);
      setMilkData(mergedData);
    } catch (error) {
      console.error("Failed to fetch milk data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [cows]);

  useEffect(() => {
    fetchCows();
  }, [fetchCows]);

  useEffect(() => {
    if (cows.length > 0) {
      fetchMilkData();
    }
  }, [cows, fetchMilkData]);

  const handleCowChange = (e) => {
    const cowId = e.target.value;
    setSelectedCow(cowId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };
  const handleTimeRangeChange = (e) => {
    const timeRange = e.target.value;
    console.log("Time Range Changed:", timeRange); // Debugging
    setSelectedTimeRange(timeRange);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredData().length / itemsPerPage);
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

  const chartData = {
    labels: filteredData().map(
      (entry) =>
        `${entry.cow?.name || "Unknown"} - ${format(
          new Date(entry.date),
          "dd MMMM yyyy",
          { locale: id }
        )}`
    ),
    datasets: [
      {
        type: "line",
        label: "Milk Production (Liters)",
        data: filteredData().map((entry) => entry.total_volume),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
        pointHoverBorderColor: "#fff",
        tension: 0.4,
        fill: true,
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
            const entry = filteredData()[context.dataIndex];
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
      easing: "easeInOutBounce",
    },
  };

  const getStatusClass = (volume) => {
    if (volume < 18) return "text-danger";
    if (volume > 25) return "text-success";
    return "text-warning";
  };

  const getStatusText = (volume) => {
    if (volume < 18) return "Decreasing";
    if (volume > 25) return "Increasing";
    return "Stable";
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">
        <i className="bi bi-graph-up"></i> Milk Production Trend Analysis
      </h2>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{ width: "270px" }}>
          <label className="form-label">Select Cow</label>
          <select
            className="form-select"
            value={selectedCow}
            onChange={handleCowChange}
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
            onChange={handleDateChange}
          />
        </div>
        <div style={{ width: "140px" }}>
          <label className="form-label">Select Status</label>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="all">All Status</option>
            <option value="increasing">Increasing</option>
            <option value="decreasing">Decreasing</option>
            <option value="stable">Stable</option>
          </select>
        </div>
        <div style={{ width: "140px" }}>
          <label className="form-label">Select Time Range</label>
          <select
            className="form-select"
            value={selectedTimeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="all">All Time</option>
            <option value="last7days">Last 7 Days</option>
            <option value="lastMonth">Last Month</option>
            <option value="lastYear">Last Year</option>
          </select>
        </div>

        {/* Search moved to the end */}
        <div className="col-md-3 d-flex flex-column ms-auto">
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
      <div className="card p-3 mb-4" style={{ height: "400px" }}>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredData().length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <p className="text-muted">
              No data available for selected filters.
            </p>
          </div>
        )}
      </div>
      <div className="card p-3">
        <h5>Milk Production Analysis</h5>
        {filteredData().length === 0 ? (
          <p className="text-muted">No data available for selected filters.</p>
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((entry, index) => (
                    <tr key={`${entry.id}-${index}`}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{entry.cow?.name || "Unknown"}</td>
                      <td>
                        {format(new Date(entry.date), "dd MMMM yyyy", {
                          locale: id,
                        })}
                      </td>
                      <td>{entry.total_volume}</td>
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
                {Math.min(indexOfLastItem, filteredData().length)} of{" "}
                {filteredData().length} entries
              </p>
              <nav>{renderPagination()}</nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MilkProductionAnalysis;
