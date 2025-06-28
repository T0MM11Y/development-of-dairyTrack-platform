import React, { useState, useEffect } from "react";
import { Card, Spinner, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import salesTransactionController from "../../../controllers/salesTransactionController.js";
import SalesTransactionStats from "./SalesTransactionStats.js";
import SalesTransactionFilters from "./SalesTransactionFilters.js";
import SalesTransactionCharts from "./SalesTransactionCharts.js";
import SalesTransactionTable from "./SalesTransactionTable.js";

// Debugging: Validate controller import
console.log("salesTransactionController:", salesTransactionController);
if (
  !salesTransactionController ||
  typeof salesTransactionController.getSalesTransactions !== "function"
) {
  console.error(
    "Error: salesTransactionController is not a valid module or missing getSalesTransactions"
  );
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load sales transaction controller. Please check the application configuration.",
  });
}

const {
  getSalesTransactions = () => {
    throw new Error("getSalesTransactions is not available");
  },
  getSalesTransactionsExportPdf = () => {
    throw new Error("getSalesTransactionsExportPdf is not available");
  },
  getSalesTransactionsExportExcel = () => {
    throw new Error("getSalesTransactionsExportExcel is not available");
  },
} = salesTransactionController || {};

const ListSalesTransactions = () => {
  // Format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Default date range: today and 1 month ago
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // State management
  const [salesTransactions, setSalesTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState({ pdf: false, excel: false });
  const transactionsPerPage = 8;

  // Fetch sales transactions
  useEffect(() => {
    const fetchSalesTransactions = async () => {
      setLoading(true);
      try {
        if (typeof getSalesTransactions !== "function") {
          throw new Error("getSalesTransactions is not a function");
        }

        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append("customer_name", searchTerm);
        if (selectedPaymentMethod)
          queryParams.append("payment_method", selectedPaymentMethod);
        if (startDate) queryParams.append("start_date", startDate);
        if (endDate) queryParams.append("end_date", endDate);

        const queryString = queryParams.toString();
        console.log("Fetching with query:", queryString);

        const response = await getSalesTransactions(queryString);
        if (response.success) {
          setSalesTransactions(response.salesTransactions || []);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch sales transactions.");
          setSalesTransactions([]);
        }
      } catch (err) {
        setError(
          "An unexpected error occurred while fetching sales transactions: " +
            err.message
        );
        console.error("Error fetching sales transactions:", err);
        setSalesTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesTransactions();
  }, [searchTerm, selectedPaymentMethod, startDate, endDate]);

  // Handle export PDF
  const handleExportPDF = async () => {
    if (isExporting.pdf) return;

    setIsExporting((prev) => ({ ...prev, pdf: true }));

    try {
      if (typeof getSalesTransactionsExportPdf !== "function") {
        throw new Error("getSalesTransactionsExportPdf is not a function");
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("customer_name", searchTerm);
      if (selectedPaymentMethod)
        queryParams.append("payment_method", selectedPaymentMethod);
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);

      console.log("Exporting PDF with query:", queryParams.toString());

      const response = await getSalesTransactionsExportPdf(
        queryParams.toString()
      );
      if (!response.success) {
        setError(response.message || "Failed to export PDF.");
      }
    } catch (error) {
      console.error("Error exporting sales transactions as PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "An unexpected error occurred while exporting to PDF: " +
          error.message,
      });
    } finally {
      setIsExporting((prev) => ({ ...prev, pdf: false }));
    }
  };

  // Handle export Excel
  const handleExportExcel = async () => {
    if (isExporting.excel) return;

    setIsExporting((prev) => ({ ...prev, excel: true }));

    try {
      if (typeof getSalesTransactionsExportExcel !== "function") {
        throw new Error("getSalesTransactionsExportExcel is not a function");
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("customer_name", searchTerm);
      if (selectedPaymentMethod)
        queryParams.append("payment_method", selectedPaymentMethod);
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);

      console.log("Exporting Excel with query:", queryParams.toString());

      const response = await getSalesTransactionsExportExcel(
        queryParams.toString()
      );
      if (!response.success) {
        setError(response.message || "Failed to export Excel.");
      }
    } catch (error) {
      console.error("Error exporting sales transactions as Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "An unexpected error occurred while exporting to Excel: " +
          error.message,
      });
    } finally {
      setIsExporting((prev) => ({ ...prev, excel: false }));
    }
  };

  // Format Rupiah
  const formatRupiah = (value) => {
    if (!value) return "Rp 0.00";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
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
            <i className="fas fa-shopping-cart me-2" /> Sales Transaction
            Management
          </h4>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-end mb-3 gap-2">
            <Button
              variant="primary"
              size="sm"
              className="shadow-sm"
              onClick={handleExportPDF}
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
              onClick={handleExportExcel}
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
          <SalesTransactionStats
            salesTransactions={salesTransactions}
            formatRupiah={formatRupiah}
          />
          <SalesTransactionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            salesTransactions={salesTransactions}
            setCurrentPage={setCurrentPage}
            formatDate={formatDate}
          />
          <SalesTransactionCharts salesTransactions={salesTransactions} />
          <SalesTransactionTable
            salesTransactions={salesTransactions}
            currentPage={currentPage}
            transactionsPerPage={transactionsPerPage}
            setCurrentPage={setCurrentPage}
            formatRupiah={formatRupiah}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListSalesTransactions;
