import React, { useState, useEffect } from "react";
import { Card, Spinner, Button } from "react-bootstrap"; // Tambahkan Button import
import Swal from "sweetalert2";
import productHistoryController from "../../../controllers/productHistoryController.js";
import ProductHistoryStats from "./ProductHistoryStats";
import ProductHistoryFilters from "./ProductHistoryFilters";
import ProductHistoryCharts from "./ProductHistoryCharts";
import ProductHistoryTable from "./ProductHistoryTable";

// Debugging: Validate controller import
console.log("productHistoryController:", productHistoryController);
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
} = productHistoryController || {};

console.log("getProductStockHistorys:", getProductStockHistorys);

const ListProductHistory = () => {
  // Format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Default date range: today and 1 month ago
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // State management
  const [productHistory, setProductHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChangeType, setSelectedChangeType] = useState("");
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState({ pdf: false, excel: false }); // Loading state for exports
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
        console.log("Fetching with query:", queryString);

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

  // Handle export PDF
  const handleExportPdf = async () => {
    if (isExporting.pdf) return; // Prevent double request

    setIsExporting((prev) => ({ ...prev, pdf: true })); // Perbaikan setIsExporting

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

      console.log("Exporting PDF with query:", queryParams.toString());

      const response = await getProductStockHistoryExportPdf(
        queryParams.toString()
      );
      if (!response.success) {
        setError(response.message || "Failed to export PDF.");
      }
    } catch (error) {
      console.error("Error exporting product history as PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "An unexpected error occurred while exporting to PDF: " +
          error.message,
      });
    } finally {
      setIsExporting((prev) => ({ ...prev, pdf: false })); // Perbaikan setIsExporting
    }
  };

  // Handle export Excel - Nama fungsi diperbaiki
  const handleExportExcel = async () => {
    if (isExporting.excel) return; // Prevent double request

    setIsExporting((prev) => ({ ...prev, excel: true })); // Perbaikan setIsExporting

    try {
      if (typeof getProductStockHistoryExportExcel !== "function") {
        // Perbaikan kondisi if
        throw new Error("getProductStockHistoryExportExcel is not a function");
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("product_name", searchTerm);
      if (selectedChangeType)
        queryParams.append("change_type", selectedChangeType); // Perbaikan syntax
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate); // Perbaikan syntax

      console.log("Exporting Excel with query:", queryParams.toString());

      const response = await getProductStockHistoryExportExcel(
        queryParams.toString()
      );
      if (!response.success) {
        setError(response.message || "Failed to export Excel.");
      }
    } catch (error) {
      console.error("Error exporting product history as Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "An unexpected error occurred while exporting to Excel: " +
          error.message,
      });
    } finally {
      setIsExporting((prev) => ({ ...prev, excel: false })); // Perbaikan setIsExporting
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
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4
            className="mb-0"
            style={{
              color: "#3D90D7",
              fontSize: "25px",
              fontFamily: "Roboto, Monospace",
              letterSpacing: "1.4px",
            }}
          >
            <i className="fas fa-boxes me-2" /> Product History Management
          </h4>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-end mb-3 gap-2">
            <Button
              variant="primary"
              size="sm"
              className="shadow-sm"
              onClick={handleExportPdf}
              disabled={isExporting.pdf}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              {isExporting.pdf ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-file-pdf me-2" /> Export PDF
                </>
              )}
            </Button>
            <Button
              variant="success"
              size="sm"
              className="shadow-sm"
              onClick={handleExportExcel} // Sekarang fungsi sudah ada
              disabled={isExporting.excel}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              {isExporting.excel ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-file-excel me-2" /> Export Excel
                </>
              )}
            </Button>
          </div>
          <ProductHistoryStats productHistory={productHistory} />
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
            formatDate={formatDate}
          />
          <ProductHistoryCharts productHistory={productHistory} />
          <ProductHistoryTable
            productHistory={productHistory}
            currentPage={currentPage}
            historyPerPage={historyPerPage}
            setCurrentPage={setCurrentPage}
            formatRupiah={formatRupiah}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListProductHistory;
