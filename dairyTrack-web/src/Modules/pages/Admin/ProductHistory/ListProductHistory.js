import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spinner,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  FormControl,
  Badge,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import productHistoryController from "../../../controllers/productHistoryController.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Debugging: Log untuk memverifikasi impor
console.log("productHistoryController:", productHistoryController);

// Validasi impor
if (
  !productHistoryController ||
  typeof productHistoryController.getProductStockHistorys !== "function"
) {
  console.error(
    "Error: productHistoryController is not a valid module or missing getProductStockHistorys"
  );
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load product history controller. Please check the application configuration.",
  });
}

const {
  getProductStockHistorys = () => {
    throw new Error("getProductStockHistorys is not available");
  },
  getProductStockHistoryExportPdf = () => {
    throw new Error("getProductStockHistoryExportPdf is not available");
  },
  getProductStockHistoryExportExcel = () => {
    throw new Error("getProductStockHistoryExportExcel is not available");
  },
} = productHistoryController;

// Debugging: Log untuk memverifikasi fungsi
console.log("getProductStockHistorys:", getProductStockHistorys);

const ListProductHistory = () => {
  const [productHistory, setProductHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChangeType, setSelectedChangeType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const historyPerPage = 8;

  // Fetch product history
  useEffect(() => {
    const fetchProductHistory = async () => {
      setLoading(true);
      try {
        if (typeof getProductStockHistorys !== "function") {
          throw new Error("getProductStockHistorys is not a function");
        }

        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append("product_name", searchTerm);
        if (selectedChangeType)
          queryParams.append("change_type", selectedChangeType);
        if (startDate) queryParams.append("start_date", startDate);
        if (endDate) queryParams.append("end_date", endDate);
        const queryString = queryParams.toString();

        console.log("Fetching with query:", queryString); // Debugging

        const response = await getProductStockHistorys(queryString);
        if (response.success) {
          setProductHistory(response.productHistory || []);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch product history.");
          setProductHistory([]);
        }
      } catch (err) {
        setError(
          "An unexpected error occurred while fetching product history: " +
            err.message
        );
        console.error("Error fetching product history:", err);
        setProductHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProductHistory();
  }, [searchTerm, selectedChangeType, startDate, endDate]);

  // Calculate statistics
  const productHistoryStats = useMemo(() => {
    const totalHistory = productHistory.length;
    const expiredChanges = productHistory.filter(
      (ph) => ph.change_type === "expired"
    ).length;
    const soldOutChanges = productHistory.filter(
      (ph) => ph.change_type === "sold_out"
    ).length;
    return { totalHistory, expiredChanges, soldOutChanges };
  }, [productHistory]);

  // Calculate chart data for product names and change types
  const chartData = useMemo(() => {
    // Product Name Distribution
    const productNameCounts = productHistory.reduce((acc, ph) => {
      const name = ph.product_name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const productNameLabels = Object.keys(productNameCounts);
    const productNameValues = Object.values(productNameCounts);
    const productNamePercentages = productNameValues.map((value) =>
      ((value / productHistory.length) * 100).toFixed(1)
    );

    // Change Type Distribution
    const changeTypeCounts = productHistory.reduce((acc, ph) => {
      const type = ph.change_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const changeTypeLabels = Object.keys(changeTypeCounts);
    const changeTypeValues = Object.values(changeTypeCounts);
    const changeTypePercentages = changeTypeValues.map((value) =>
      ((value / productHistory.length) * 100).toFixed(1)
    );

    // Colors for charts
    const colors = [
      "#007bff",
      "#28a745",
      "#ffc107",
      "#dc3545",
      "#6f42c1",
      "#fd7e14",
      "#20c997",
    ];

    return {
      productName: {
        labels: productNameLabels,
        datasets: [
          {
            data: productNameValues,
            backgroundColor: colors.slice(0, productNameLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
        percentages: productNamePercentages,
      },
      changeType: {
        labels: changeTypeLabels,
        datasets: [
          {
            data: changeTypeValues,
            backgroundColor: colors.slice(0, changeTypeLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
        percentages: changeTypePercentages,
      },
    };
  }, [productHistory]);

  // Filter, sort, and paginate product history
  const filteredAndPaginatedProductHistory = useMemo(() => {
    let filtered = productHistory.filter((ph) => {
      const matchesSearch = ph.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesChangeType = selectedChangeType
        ? ph.change_type === selectedChangeType
        : true;
      return matchesSearch && matchesChangeType;
    });

    filtered = [...filtered].sort(
      (a, b) => new Date(b.change_date) - new Date(a.change_date)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / historyPerPage);
    const startIndex = (currentPage - 1) * historyPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + historyPerPage
    );

    return {
      filteredProductHistory: filtered,
      currentProductHistory: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [
    productHistory,
    searchTerm,
    selectedChangeType,
    currentPage,
    historyPerPage,
  ]);

  // Handle export PDF
  const handleExportPdf = async () => {
    try {
      if (typeof getProductStockHistoryExportPdf !== "function") {
        throw new Error("getProductStockHistoryExportPdf is not a function");
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("product_name", searchTerm);
      if (selectedChangeType)
        queryParams.append("change_type", selectedChangeType);
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      const queryString = queryParams.toString();

      console.log("Exporting PDF with query:", queryString); // Debugging

      const response = await getProductStockHistoryExportPdf(queryString);
      if (!response.success) {
        setError(response.message || "Failed to export PDF.");
      }
    } catch (error) {
      console.error("Error exporting product history as PDF:", error);
      setError(
        "An unexpected error occurred while exporting to PDF: " + error.message
      );
    }
  };

  // Handle export Excel
  const handleExportExcel = async () => {
    try {
      if (typeof getProductStockHistoryExportExcel !== "function") {
        throw new Error("getProductStockHistoryExportExcel is not a function");
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("product_name", searchTerm);
      if (selectedChangeType)
        queryParams.append("change_type", selectedChangeType);
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      const queryString = queryParams.toString();

      console.log("Exporting Excel with query:", queryString); // Debugging

      const response = await getProductStockHistoryExportExcel(queryString);
      if (!response.success) {
        setError(response.message || "Failed to export Excel.");
      }
    } catch (error) {
      console.error("Error exporting product history as Excel:", error);
      setError(
        "An unexpected error occurred while exporting to Excel: " +
          error.message
      );
    }
  };

  // Format Rupiah
  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-sm border-0 rounded">
        <Card.Header className="bg-primary text-white py-3">
          <h4
            className="mb-0"
            style={{
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "0.5px",
              fontWeight: "600",
            }}
          >
            <i className="fas fa-history me-2" /> Product History Management
          </h4>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-end mb-3 gap-2">
            <Button
              variant="primary"
              size="sm"
              className="shadow-sm"
              onClick={handleExportPdf}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              <i className="fas fa-file-pdf me-2" /> Export PDF
            </Button>
            <Button
              variant="success"
              size="sm"
              className="shadow-sm"
              onClick={handleExportExcel}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              <i className="fas fa-file-excel me-2" /> Export Excel
            </Button>
          </div>
          <ProductHistoryStats stats={productHistoryStats} />
          <ProductHistoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedChangeType={selectedChangeType}
            setSelectedChangeType={setSelectedChangeType}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            productHistory={productHistory}
            setCurrentPage={setCurrentPage}
          />
          <ProductHistoryCharts chartData={chartData} />
          <ProductHistoryTable
            productHistory={
              filteredAndPaginatedProductHistory.currentProductHistory
            }
            currentPage={currentPage}
            historyPerPage={historyPerPage}
            setCurrentPage={setCurrentPage}
            totalItems={filteredAndPaginatedProductHistory.totalItems}
            totalPages={filteredAndPaginatedProductHistory.totalPages}
            formatRupiah={formatRupiah}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

// Product History Stats Component
const ProductHistoryStats = ({ stats }) => {
  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total History Records</h6>
                <h2 className="mt-2 mb-0">{stats.totalHistory}</h2>
              </div>
              <div>
                <i className="fas fa-history fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-success text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Expired Changes</h6>
                <h2 className="mt-2 mb-0">{stats.expiredChanges}</h2>
              </div>
              <div>
                <i className="fas fa-exclamation-triangle fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-warning text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Sold Out Changes</h6>
                <h2 className="mt-2 mb-0">{stats.soldOutChanges}</h2>
              </div>
              <div>
                <i className="fas fa-check-circle fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Product History Charts Component
const ProductHistoryCharts = ({ chartData }) => {
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "'Nunito', sans-serif",
            size: 14,
            weight: "500",
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const percentage = context.dataset.data[context.dataIndex]
              ? (
                  (context.dataset.data[context.dataIndex] /
                    context.dataset.data.reduce((a, b) => a + b, 0)) *
                  100
                ).toFixed(1)
              : 0;
            return `${label}: ${percentage}%`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "'Nunito', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Nunito', sans-serif",
          size: 12,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Row className="mb-4">
      <Col md={6}>
        <Card className="shadow-sm border-0 rounded">
          <Card.Body>
            <h5
              className="card-title text-center mb-4"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: "600",
                color: "#444",
              }}
            >
              Product Name Distribution
            </h5>
            {chartData.productName.labels.length > 0 ? (
              <div style={{ height: "250px" }}>
                <Doughnut data={chartData.productName} options={chartOptions} />
              </div>
            ) : (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No product name data available.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="shadow-sm border-0 rounded">
          <Card.Body>
            <h5
              className="card-title text-center mb-4"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: "600",
                color: "#444",
              }}
            >
              Change Type Distribution
            </h5>
            {chartData.changeType.labels.length > 0 ? (
              <div style={{ height: "250px" }}>
                <Doughnut data={chartData.changeType} options={chartOptions} />
              </div>
            ) : (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No change type data available.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Product History Filters Component
const ProductHistoryFilters = ({
  searchTerm,
  setSearchTerm,
  selectedChangeType,
  setSelectedChangeType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  productHistory,
  setCurrentPage,
}) => {
  const uniqueChangeTypes = [
    ...new Set(productHistory.map((ph) => ph.change_type)),
  ];

  return (
    <Row className="mb-4">
      <Col md={6} lg={3}>
        <InputGroup className="shadow-sm mb-3">
          <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              <i className="bi bi-x-lg" />
            </Button>
          )}
        </InputGroup>
      </Col>
      <Col md={6} lg={3}>
        <Form.Group className="mb-3">
          <Form.Select
            value={selectedChangeType}
            onChange={(e) => {
              setSelectedChangeType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by Change Type</option>
            {uniqueChangeTypes.map((changeType) => (
              <option key={changeType} value={changeType}>
                {changeType.charAt(0).toUpperCase() + changeType.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Button
          variant="outline-primary"
          size="sm"
          className="mt-2 w-100"
          onClick={() => {
            setSearchTerm("");
            setSelectedChangeType("");
            setStartDate("");
            setEndDate("");
            setCurrentPage(1);
          }}
          style={{ letterSpacing: "0.5px" }}
        >
          <i className="fas fa-sync-alt me-2"></i> Reset Filters
        </Button>
      </Col>
    </Row>
  );
};

// Product History Table Component
const ProductHistoryTable = ({
  productHistory,
  currentPage,
  historyPerPage,
  setCurrentPage,
  totalItems,
  totalPages,
  formatRupiah,
}) => {
  return (
    <>
      <div className="table-responsive">
        <table
          className="table table-hover border rounded shadow-sm"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <thead className="bg-gradient-light">
            <tr
              style={{
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: "0.4px",
              }}
            >
              <th
                className="py-3 text-center"
                style={{
                  width: "5%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                #
              </th>
              <th
                className="py-3"
                style={{
                  width: "20%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Product Name
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Change Type
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Quantity Change
              </th>
              <th
                className="py-3"
                style={{
                  width: "10%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Unit
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Total Price
              </th>
              <th
                className="py-3"
                style={{
                  width: "20%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Change Date
              </th>
            </tr>
          </thead>
          <tbody>
            {productHistory.map((ph, index) => (
              <tr
                key={ph.product_stock + "-" + index}
                className="align-middle"
                style={{ transition: "all 0.2s" }}
              >
                <td className="fw-bold text-center">
                  {(currentPage - 1) * historyPerPage + index + 1}
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {ph.product_name || "N/A"}
                  </span>
                </td>
                <td>
                  <Badge
                    bg={
                      ph.change_type === "expired"
                        ? "danger"
                        : ph.change_type === "sold_out"
                        ? "success"
                        : "warning"
                    }
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {ph.change_type.charAt(0).toUpperCase() +
                      ph.change_type.slice(1)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {ph.quantity_change}
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {ph.unit}
                </td>
                <td>
                  <Badge
                    bg="success"
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {formatRupiah(ph.total_price)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {new Date(ph.change_date).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No product history found matching your criteria.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * historyPerPage + 1} to{" "}
            {Math.min(currentPage * historyPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(1)}>
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {[...Array(totalPages).keys()].map((page) => {
                const pageNumber = page + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <li
                      key={pageNumber}
                      className={`page-item ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <li key={pageNumber} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              })}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default ListProductHistory;
