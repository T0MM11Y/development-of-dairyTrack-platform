import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spinner,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ReactApexChart from "react-apexcharts";
import financeController from "../../../controllers/financeController.js";
import { format } from "date-fns";
import usePermissions from "../Permission/usePermission";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Validate import
if (
  !financeController ||
  typeof financeController.getIncomes !== "function" ||
  typeof financeController.getExpenses !== "function" ||
  typeof financeController.getIncomeTypes !== "function" ||
  typeof financeController.getExpenseTypes !== "function"
) {
  console.error(
    "Error: financeController is not a valid module or missing required functions"
  );
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load finance controller. Please check the application configuration.",
  });
}

const FinancePage = () => {
  // Rupiah formatting with decimals (for summary cards, charts, and modal display)
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(parseFloat(value)))
      return "Rp 0,00";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  // Rupiah formatting without decimals (for transaction table)
  const formatRupiahNoDecimals = (value) => {
    if (value === null || value === undefined || isNaN(parseFloat(value)))
      return "Rp 0";
    const number = Math.round(parseFloat(value));
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [financeType, setFinanceType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 8;

  // Use the permissions hook
  const {
    currentUser,
    isSupervisor,
    disableIfSupervisor,
    restrictSupervisorAction,
    error: userError,
  } = usePermissions();

  // Fetch data
  const fetchData = async (filters = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.finance_type && filters.finance_type !== "all")
        queryParams.append("finance_type", filters.finance_type);
      const queryString = queryParams.toString();

      // Fetch incomes, expenses, and types
      const [
        incomeResponse,
        expenseResponse,
        incomeTypesResponse,
        expenseTypesResponse,
      ] = await Promise.all([
        financeController.getIncomes(queryString),
        financeController.getExpenses(queryString),
        financeController.getIncomeTypes(),
        financeController.getExpenseTypes(),
      ]);

      if (!incomeResponse.success) throw new Error(incomeResponse.message);
      if (!expenseResponse.success) throw new Error(expenseResponse.message);
      if (!incomeTypesResponse.success)
        throw new Error(incomeTypesResponse.message);
      if (!expenseTypesResponse.success)
        throw new Error(expenseTypesResponse.message);

      // Normalize data
      const incomes = (incomeResponse.incomes || []).map((item) => ({
        ...item,
        income_type: item.income_type_detail || { name: "Unknown" },
        created_by: item.created_by
          ? {
              ...item.created_by,
              id: item.created_by.id ? parseInt(item.created_by.id) : null,
            }
          : null,
      }));
      const expenses = (expenseResponse.expenses || []).map((item) => ({
        ...item,
        expense_type: item.expense_type_detail || { name: "Unknown" },
        created_by: item.created_by
          ? {
              ...item.created_by,
              id: item.created_by.id ? parseInt(item.created_by.id) : null,
            }
          : null,
      }));

      setIncomeData(incomes);
      setExpenseData(expenses);
      setIncomeTypes(incomeTypesResponse.incomeTypes || []);
      setExpenseTypes(expenseTypesResponse.expenseTypes || []);

      calculateTotals(incomes, expenses);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch finance data. Please ensure the API server is active.",
      });
      setIncomeData([]);
      setExpenseData([]);
      setIncomeTypes([]);
      setExpenseTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const today = new Date();
    const formatDate = (date) => format(date, "yyyy-MM-dd");
    let newFilters = {};

    switch (period) {
      case "thisMonth":
        newFilters = {
          start_date: formatDate(
            new Date(today.getFullYear(), today.getMonth(), 1)
          ),
          end_date: formatDate(today),
          finance_type: financeType,
        };
        break;
      case "lastMonth":
        newFilters = {
          start_date: formatDate(
            new Date(today.getFullYear(), today.getMonth() - 1, 1)
          ),
          end_date: formatDate(
            new Date(today.getFullYear(), today.getMonth(), 0)
          ),
          finance_type: financeType,
        };
        break;
      case "thisYear":
        newFilters = {
          start_date: formatDate(new Date(today.getFullYear(), 0, 1)),
          end_date: formatDate(today),
          finance_type: financeType,
        };
        break;
      case "last12months":
        newFilters = {
          start_date: formatDate(
            new Date(
              today.getFullYear(),
              today.getMonth() - 12,
              today.getDate()
            )
          ),
          end_date: formatDate(today),
          finance_type: financeType,
        };
        break;
      default:
        newFilters = { finance_type: financeType };
    }

    setStartDate(newFilters.start_date || "");
    setEndDate(newFilters.end_date || "");
    fetchData(newFilters);
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      start_date: startDate,
      end_date: endDate,
      finance_type: financeType,
    };
    setSelectedPeriod("");
    fetchData(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFinanceType("");
    setSelectedPeriod("");
    fetchData({});
  };

  // Handle export PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const response = await financeController.getFinanceExportPdf(
        startDate,
        endDate
      );
      if (!response.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to export PDF.",
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "An unexpected error occurred while exporting to PDF: " +
          error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle export Excel
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await financeController.getFinanceExportExcel(
        startDate,
        endDate
      );
      if (!response.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to export Excel.",
        });
      }
    } catch (error) {
      console.error("Error exporting Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "An unexpected error occurred while exporting to Excel: " +
          error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = (incomes, expenses) => {
    const totalInc = incomes.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    const totalExp = expenses.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    setTotalIncome(totalInc);
    setTotalExpense(totalExp);
    setCurrentBalance(totalInc - totalExp);
  };

  // Chart data
  const chartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    incomeData.forEach((income) => {
      const monthIndex = new Date(income.transaction_date).getMonth();
      monthlyIncome[monthIndex] += parseFloat(income.amount || 0);
    });

    expenseData.forEach((expense) => {
      const monthIndex = new Date(expense.transaction_date).getMonth();
      monthlyExpense[monthIndex] += parseFloat(expense.amount || 0);
    });

    const incomeByCategory = incomeData.reduce((acc, income) => {
      const category = income.income_type?.name || "Unknown";
      acc[category] = (acc[category] || 0) + parseFloat(income.amount || 0);
      return acc;
    }, {});
    const incomeCategoryLabels = Object.keys(incomeByCategory);
    const incomeCategoryValues = Object.values(incomeByCategory);

    const expenseByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.expense_type?.name || "Unknown";
      acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
      return acc;
    }, {});
    const expenseCategoryLabels = Object.keys(expenseByCategory);
    const expenseCategoryValues = Object.values(expenseByCategory);

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
      monthly: {
        income: monthlyIncome,
        expense: monthlyExpense,
        months,
      },
      incomeCategory: {
        labels: incomeCategoryLabels,
        datasets: [
          {
            data: incomeCategoryValues,
            backgroundColor: colors.slice(0, incomeCategoryLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
      },
      expenseCategory: {
        labels: expenseCategoryLabels,
        datasets: [
          {
            data: expenseCategoryValues,
            backgroundColor: colors.slice(0, expenseCategoryLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
      },
    };
  }, [incomeData, expenseData]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const transactions = [
      ...incomeData.map((item) => ({
        ...item,
        type: "income",
        formattedAmount: `+${formatRupiahNoDecimals(item.amount)}`,
      })),
      ...expenseData.map((item) => ({
        ...item,
        type: "expense",
        formattedAmount: `-${formatRupiahNoDecimals(item.amount)}`,
      })),
    ].sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const paginatedItems = transactions.slice(
      startIndex,
      startIndex + transactionsPerPage
    );

    return { transactions: paginatedItems, totalItems, totalPages };
  }, [incomeData, expenseData, currentPage]);

  // Initial fetch
  useEffect(() => {
    fetchData({});
  }, []);

  if (loading && !incomeData.length && !expenseData.length) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (userError && !incomeData.length && !expenseData.length) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{userError}</div>
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
            <i className="fas fa-wallet me-2" /> Finance Management
          </h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col lg={6}>
              <h5
                className="card-title mb-4"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: "600",
                  color: "#444",
                }}
              >
                Finance Filtering & Export
              </h5>
            </Col>
            <Col lg={6}>
              <div className="d-flex justify-content-end gap-2">
                {["thisMonth", "lastMonth", "thisYear", "last12months"].map(
                  (period) => (
                    <Button
                      key={period}
                      variant={
                        selectedPeriod === period
                          ? "primary"
                          : "outline-primary"
                      }
                      size="sm"
                      className="shadow-sm"
                      onClick={() => handlePeriodChange(period)}
                      disabled={loading}
                      style={{
                        letterSpacing: "0.5px",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                      }}
                    >
                      {period.replace(/([A-Z])/g, " $1").trim()}
                    </Button>
                  )
                )}
              </div>
            </Col>
          </Row>

          <FilterExportPanel
            startDate={startDate}
            endDate={endDate}
            financeType={financeType}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setFinanceType={setFinanceType}
            handleFilterSubmit={handleFilterSubmit}
            resetFilters={resetFilters}
            handleExportExcel={handleExportExcel}
            handleExportPdf={handleExportPdf}
            loading={loading}
          />

          <FinanceSummaryCards
            currentBalance={currentBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            loading={loading}
            formatRupiah={formatRupiah}
          />

          <FinanceCharts chartData={chartData} loading={loading} />

          <RecentTransactions
            transactions={paginatedTransactions.transactions}
            currentPage={currentPage}
            transactionsPerPage={transactionsPerPage}
            setCurrentPage={setCurrentPage}
            totalItems={paginatedTransactions.totalItems}
            totalPages={paginatedTransactions.totalPages}
            formatRupiah={formatRupiahNoDecimals}
            loading={loading}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

// Finance Summary Cards Component
const FinanceSummaryCards = ({
  currentBalance,
  totalIncome,
  totalExpense,
  loading,
  formatRupiah,
}) => {
  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Available Balance</h6>
                <h2 className="mt-2 mb-0">
                  {loading ? "Loading..." : formatRupiah(currentBalance)}
                </h2>
              </div>
              <div>
                <i className="fas fa-wallet fa-3x opacity-50"></i>
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
                <h6 className="card-title mb-0">Total Income</h6>
                <h2 className="mt-2 mb-0">
                  {loading ? "Loading..." : formatRupiah(totalIncome)}
                </h2>
              </div>
              <div>
                <i className="fas fa-arrow-up fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-danger text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Expense</h6>
                <h2 className="mt-2 mb-0">
                  {loading ? "Loading..." : formatRupiah(totalExpense)}
                </h2>
              </div>
              <div>
                <i className="fas fa-arrow-down fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Filter and Export Panel Component
const FilterExportPanel = ({
  startDate,
  endDate,
  financeType,
  setStartDate,
  setEndDate,
  setFinanceType,
  handleFilterSubmit,
  resetFilters,
  handleExportExcel,
  handleExportPdf,
  loading,
}) => {
  return (
    <Card className="shadow-sm border-0 rounded mb-4">
      <Card.Body>
        <Form onSubmit={handleFilterSubmit}>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Transaction Type</Form.Label>
                <Form.Select
                  value={financeType}
                  onChange={(e) => setFinanceType(e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Transactions</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <div className="d-flex gap-2 w-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="shadow-sm"
                  disabled={loading}
                  style={{
                    letterSpacing: "0.5px",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="bx bx-filter-alt me-1" /> Apply Filters
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="shadow-sm"
                  onClick={resetFilters}
                  disabled={loading}
                  style={{
                    letterSpacing: "0.5px",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="bx bx-reset me-1" /> Clear Filters
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
        <Row className="mt-3">
          <Col className="text-end">
            <Button
              variant="success"
              size="sm"
              className="shadow-sm me-2"
              onClick={handleExportExcel}
              disabled={loading}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              <i className="bx bxs-file-excel me-1" /> Export to Excel
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="shadow-sm"
              onClick={handleExportPdf}
              disabled={loading}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              <i className="bx bxs-file-pdf me-1" /> Export to PDF
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Finance Charts Component
const FinanceCharts = ({ chartData, loading }) => {
  const areaChartOptions = {
    series: [
      { name: "Income", data: chartData.monthly.income },
      { name: "Expense", data: chartData.monthly.expense },
    ],
    chart: { height: 350, type: "area", toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#4f46e5", "#ef4444"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: { categories: chartData.monthly.months },
    tooltip: {
      y: {
        formatter: (val) => {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(val);
        },
      },
      x: {
        formatter: (val, { dataPointIndex }) => {
          return chartData.monthly.months[dataPointIndex];
        },
      },
    },
  };

  const donutChartOptions = {
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
        titleFont: { family: "'Nunito', sans-serif", size: 14 },
        bodyFont: { family: "'Nunito', sans-serif", size: 12 },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Row className="mb-4">
      <Col xl={8}>
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
              Income vs Expense Chart
            </h5>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "350px" }}
              >
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <ReactApexChart
                options={areaChartOptions}
                series={areaChartOptions.series}
                type="area"
                height={350}
              />
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col xl={4}>
        <Card className="shadow-sm border-0 rounded mb-4">
          <Card.Body>
            <h5
              className="card-title text-center mb-4"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: "600",
                color: "#444",
              }}
            >
              Income by Category
            </h5>
            {loading || chartData.incomeCategory.labels.length === 0 ? (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No income category data available.</p>
              </div>
            ) : (
              <div style={{ height: "200px" }}>
                <Doughnut
                  data={chartData.incomeCategory}
                  options={donutChartOptions}
                />
              </div>
            )}
          </Card.Body>
        </Card>
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
              Expense by Category
            </h5>
            {loading || chartData.expenseCategory.labels.length === 0 ? (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No expense category data available.</p>
              </div>
            ) : (
              <div style={{ height: "200px" }}>
                <Doughnut
                  data={chartData.expenseCategory}
                  options={donutChartOptions}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Recent Transactions Component
const RecentTransactions = ({
  transactions,
  currentPage,
  transactionsPerPage,
  setCurrentPage,
  totalItems,
  totalPages,
  formatRupiah,
  loading,
}) => {
  const renderTransactionIcon = (transaction) => {
    const desc = transaction.description?.toLowerCase();
    if (desc?.includes("milk")) return "🥃";
    if (desc?.includes("cow")) return "🐄";
    if (desc?.includes("vet") || desc?.includes("doctor")) return "👨‍⚕️";
    if (desc?.includes("drug")) return "💊";
    return transaction.type === "income" ? "💰" : "💸";
  };

  return (
    <Card className="shadow-sm border-0 rounded">
      <Card.Body>
        <h5
          className="card-title mb-4"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: "600",
            color: "#444",
          }}
        >
          Recent Transactions
        </h5>
        {loading && transactions.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
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
                        width: "30%",
                        fontWeight: "550",
                        fontSize: "0.95rem",
                        color: "#444",
                      }}
                    >
                      Description
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
                      Category
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
                      Type
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
                      Amount
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
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr
                      key={transaction.id || `${transaction.type}-${index}`}
                      className="align-middle"
                      style={{ transition: "all 0.2s" }}
                    >
                      <td className="fw-bold text-center">
                        {(currentPage - 1) * transactionsPerPage + index + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span
                            className={`me-3 rounded-circle ${
                              transaction.type === "income"
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            } d-flex justify-content-center align-items-center`}
                            style={{
                              width: "32px",
                              height: "32px",
                              fontSize: "1.2rem",
                            }}
                          >
                            {renderTransactionIcon(transaction)}
                          </span>
                          <span
                            className="fw-medium"
                            style={{ letterSpacing: "0.3px" }}
                          >
                            {transaction.description || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                        {transaction.type === "income"
                          ? transaction.income_type?.name || "Unknown"
                          : transaction.expense_type?.amount || "Unknown"}
                      </td>
                      <td>
                        <Badge
                          bg={
                            transaction.type === "income" ? "success" : "danger"
                          }
                          className="px-2 py-3 text-white shadow-sm opacity-75"
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            letterSpacing: "0.8px",
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          {transaction.type.charAt(0).toUpperCase() +
                            transaction.type.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={
                            transaction.type === "income" ? "success" : "danger"
                          }
                          className="px-2 py-2 text-white shadow-sm"
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            letterSpacing: "0.8px",
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          {transaction.formattedAmount}
                        </Badge>
                      </td>
                      <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                        {new Date(transaction.transaction_date).toLocaleString(
                          "id-ID",
                          {
                            dateStyle: "short",
                            timeStyle: "short",
                          }
                        )}
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
                  No transactions found matching your criteria.
                </p>
              </div>
            )}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {(currentPage - 1) * transactionsPerPage + 1} to{" "}
                  {Math.min(currentPage * transactionsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(1)}
                      >
                        <i className="bi bi-chevron-double-left"></i>
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
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
        )}
      </Card.Body>
    </Card>
  );
};

export default FinancePage;
