import React, { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { getAllRawMilksWithExpiredStatus } from "../../../../api/produktivitas/rawMilk";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import "chart.js/auto";

const FreshnessOfMilk = () => {
  const [rawMilkData, setRawMilkData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all"); // Tambahkan state untuk filter status

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Fetch raw milk data with expired status
  const fetchRawMilkData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllRawMilksWithExpiredStatus();
      setRawMilkData(data);
    } catch (error) {
      console.error("Failed to fetch raw milk data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRawMilkData();
  }, [fetchRawMilkData]);

  // Filter data based on search query and status filter
  const filteredData = useCallback(() => {
    let data = rawMilkData;

    if (statusFilter !== "all") {
      const isExpired = statusFilter === "expired";
      data = data.filter((entry) => entry.is_expired === isExpired);
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      data = data.filter((entry) => {
        const cowId = entry.cow_id?.toString() || "";
        const productionTime = format(
          new Date(entry.production_time),
          "dd MMMM yyyy",
          { locale: id }
        ).toLowerCase();
        const expirationTime = format(
          new Date(entry.expiration_time),
          "dd MMMM yyyy",
          { locale: id }
        ).toLowerCase();
        const status = entry.is_expired ? "expired" : "fresh";

        return (
          cowId.includes(searchLower) ||
          productionTime.includes(searchLower) ||
          expirationTime.includes(searchLower) ||
          status.includes(searchLower)
        );
      });
    }

    return data;
  }, [rawMilkData, searchQuery, statusFilter]);

  const currentData = filteredData().slice(indexOfFirstItem, indexOfLastItem);

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
    labels: rawMilkData.map((entry) =>
      format(new Date(entry.production_time), "dd MMM yyyy", { locale: id })
    ),
    datasets: [
      {
        label: "Fresh Milk (Liters)",
        data: rawMilkData
          .filter((entry) => !entry.is_expired)
          .map((entry) => entry.volume_liters),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expired Milk (Liters)",
        data: rawMilkData
          .filter((entry) => entry.is_expired)
          .map((entry) => entry.volume_liters),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 3,
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
        title: {
          display: true,
          text: "Volume (Liters)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Production Date",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">
        <i className="bi bi-graph-up"></i> Freshness of Milk Analysis
      </h2>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="col-md-2">
          <label className="form-label">Filter by Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="fresh">Fresh</option>
            <option value="expired">Expired</option>
          </select>
        </div>
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
        ) : rawMilkData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <p className="text-muted">No data available.</p>
          </div>
        )}
      </div>
      <div className="card p-3">
        <h5>Milk Freshness Details</h5>
        {filteredData().length === 0 ? (
          <p className="text-muted">No data available for selected filters.</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Production Date</th>
                    <th>Expiration Date</th>
                    <th>Volume (Liters)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((entry, index) => {
                    const productionTime = format(
                      new Date(entry.production_time),
                      "dd MMM yyyy HH:mm",
                      { locale: id }
                    );
                    const expirationTime = format(
                      new Date(entry.expiration_time),
                      "dd MMM yyyy HH:mm",
                      { locale: id }
                    );

                    const now = new Date();
                    const expirationDate = new Date(entry.expiration_time);
                    const hoursUntilExpired = Math.max(
                      0,
                      Math.ceil((expirationDate - now) / (1000 * 60 * 60))
                    );

                    // Fungsi untuk menentukan badge sesi
                    const sessionBadge = (session) => {
                      switch (session) {
                        case 1:
                          return (
                            <span
                              className="badge bg-primary ms-2"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Sesi 1
                            </span>
                          );
                        case 2:
                          return (
                            <span
                              className="badge bg-success ms-2"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Sesi 2
                            </span>
                          );
                        case 3:
                          return (
                            <span
                              className="badge bg-warning ms-2"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Sesi 3
                            </span>
                          );
                        default:
                          return (
                            <span
                              className="badge bg-secondary ms-2"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Sesi Tidak Diketahui
                            </span>
                          );
                      }
                    };

                    return (
                      <tr key={entry.id}>
                        <td>
                          <div>
                            {indexOfFirstItem + index + 1}
                            {entry.session && sessionBadge(entry.session)}
                          </div>
                        </td>
                        <td>{entry.cow_name}</td>
                        <td>{productionTime}</td>
                        <td>{expirationTime}</td>
                        <td>{entry.volume_liters}</td>
                        <td>
                          {entry.is_expired ? (
                            <span className="badge bg-danger">Expired</span>
                          ) : (
                            <span className="badge bg-success">
                              Fresh ({hoursUntilExpired} hours left)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

export default FreshnessOfMilk;
