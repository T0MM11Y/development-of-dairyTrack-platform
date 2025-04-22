import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getFinances } from "../../../../api/keuangan/finance";
import { getIncomes } from "../../../../api/keuangan/income";
import { getExpenses } from "../../../../api/keuangan/expense";
import { Link } from "react-router-dom";

const Finance = () => {
  const [financeData, setFinanceData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("last12months");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState({});
  const [expenseByCategory, setExpenseByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const financesResponse = await getFinances();
        const incomesResponse = await getIncomes();
        const expensesResponse = await getExpenses();

        setFinanceData(financesResponse);
        setIncomeData(incomesResponse);
        setExpenseData(
          Array.isArray(expensesResponse)
            ? expensesResponse
            : [expensesResponse]
        );

        // Calculate totals
        calculateTotals(
          incomesResponse,
          Array.isArray(expensesResponse)
            ? expensesResponse
            : [expensesResponse]
        );

        // Process monthly data for the chart
        processMonthlyData(
          incomesResponse,
          Array.isArray(expensesResponse)
            ? expensesResponse
            : [expensesResponse]
        );

        // Process category data for pie charts
        processCategoryData(
          incomesResponse,
          Array.isArray(expensesResponse)
            ? expensesResponse
            : [expensesResponse]
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotals = (incomes, expenses) => {
    const totalInc = incomes.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    const totalExp = expenses.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    setTotalIncome(totalInc);
    setTotalExpense(totalExp);
    setCurrentBalance(totalInc - totalExp);
  };

  const processMonthlyData = (incomes, expenses) => {
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

    // Process incomes
    incomes.forEach((income) => {
      const date = new Date(income.transaction_date);
      const monthIndex = date.getMonth();
      monthlyIncome[monthIndex] += parseFloat(income.amount);
    });

    // Process expenses
    expenses.forEach((expense) => {
      const date = new Date(expense.transaction_date);
      const monthIndex = date.getMonth();
      monthlyExpense[monthIndex] += parseFloat(expense.amount);
    });

    // Create data for charts
    const data = months.map((month, index) => ({
      month,
      income: monthlyIncome[index],
      expense: monthlyExpense[index],
    }));

    setMonthlyData(data);
  };

  const processCategoryData = (incomes, expenses) => {
    // Process income by category
    const incomeCategories = {};
    incomes.forEach((income) => {
      const category = income.income_type;
      if (!incomeCategories[category]) {
        incomeCategories[category] = 0;
      }
      incomeCategories[category] += parseFloat(income.amount);
    });
    setIncomeByCategory(incomeCategories);

    // Process expense by category
    const expenseCategories = {};
    expenses.forEach((expense) => {
      const category = expense.expense_type;
      if (!expenseCategories[category]) {
        expenseCategories[category] = 0;
      }
      expenseCategories[category] += parseFloat(expense.amount);
    });
    setExpenseByCategory(expenseCategories);
  };

  const formatCurrency = (amount) => {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Here you would filter data based on the selected period
    // This is a placeholder for the actual implementation
  };

  const getRecentTransactions = () => {
    // Combine income and expense transactions
    const allTransactions = [
      ...incomeData.map((item) => ({
        ...item,
        type: "income",
        formattedAmount: `+${formatCurrency(item.amount)}`,
      })),
      ...expenseData.map((item) => ({
        ...item,
        type: "expense",
        formattedAmount: `-${formatCurrency(item.amount)}`,
      })),
    ];

    // Sort by date, most recent first
    allTransactions.sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    // Return the most recent transactions (limited to 10)
    return allTransactions.slice(0, 10);
  };

  const renderTransactionIcon = (transaction) => {
    if (transaction.description?.toLowerCase().includes("milk")) {
      return "🥛";
    } else if (transaction.description?.toLowerCase().includes("cow")) {
      return "🐄";
    } else if (
      transaction.description?.toLowerCase().includes("vet") ||
      transaction.description?.toLowerCase().includes("doctor")
    ) {
      return "👨‍⚕️";
    } else if (transaction.description?.toLowerCase().includes("drug")) {
      return "💊";
    } else if (transaction.type === "income") {
      return "💰";
    } else {
      return "💸";
    }
  };

  // Monthly income and expense chart options
  const areaChartOptions = {
    series: [
      {
        name: "Income",
        data: monthlyData.map((item) => item.income),
      },
      {
        name: "Expense",
        data: monthlyData.map((item) => item.expense),
      },
    ],
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
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
    xaxis: {
      categories: monthlyData.map((item) => item.month),
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return formatCurrency(val);
        },
      },
    },
  };

  // Donut chart options for income categories
  const incomeDonutOptions = {
    series: Object.values(incomeByCategory),
    chart: {
      type: "donut",
      height: 300,
    },
    labels: Object.keys(incomeByCategory),
    colors: ["#4f46e5", "#60a5fa", "#34d399", "#a78bfa", "#f87171"],
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      },
    },
  };

  // Donut chart options for expense categories
  const expenseDonutOptions = {
    series: Object.values(expenseByCategory),
    chart: {
      type: "donut",
      height: 300,
    },
    labels: Object.keys(expenseByCategory),
    colors: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"],
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      },
    },
  };

  // Card component for summary metrics
  const Card = ({ title, value, percentage, icon, bgColor }) => {
    return (
      <div className="col-xl-4 col-md-6">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <p className="text-muted fw-medium mb-2">{title}</p>
                <h4 className="mb-0">{value}</h4>
                <div className="mt-2">
                  <span
                    className={`badge ${
                      percentage >= 0 ? "bg-success" : "bg-danger"
                    } fw-bold font-size-12 me-2`}
                  >
                    <i
                      className={`bx ${
                        percentage >= 0
                          ? "bx-up-arrow-alt"
                          : "bx-down-arrow-alt"
                      } me-1 align-middle`}
                    ></i>
                    {Math.abs(percentage)}%
                  </span>
                  <span className="text-muted font-size-12">
                    from previous period
                  </span>
                </div>
              </div>
              <div className={`avatar-sm rounded-circle ${bgColor} p-4 ms-3`}>
                <span className="avatar-title rounded-circle h4 mb-0">
                  {icon}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Finance</h2>
          <p className="text-muted">
            Catatan semua Finance keuangan peternakan ditampilkan di sini.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="d-flex gap-2">
            <Link to="addIncome" className="btn btn-primary">
              <i className="bx bx-plus me-1"></i> Income
            </Link>
            <Link to="addExpense" className="btn btn-danger">
              <i className="bx bx-plus me-1"></i> Expense
            </Link>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="d-flex justify-content-end gap-2">
            <button
              className={`btn ${
                selectedPeriod === "thisMonth" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => handlePeriodChange("thisMonth")}
            >
              This month
            </button>
            <button
              className={`btn ${
                selectedPeriod === "lastMonth" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => handlePeriodChange("lastMonth")}
            >
              Last month
            </button>
            <button
              className={`btn ${
                selectedPeriod === "thisYear" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => handlePeriodChange("thisYear")}
            >
              This year
            </button>
            <button
              className={`btn ${
                selectedPeriod === "last12months" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => handlePeriodChange("last12months")}
            >
              Last 12 months
            </button>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                id="periodDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                🗓️ Select period
              </button>
              <ul className="dropdown-menu" aria-labelledby="periodDropdown">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handlePeriodChange("custom")}
                  >
                    Custom range
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <Card
          title="Available Balance"
          value={formatCurrency(currentBalance)}
          percentage={20}
          icon="💰"
          bgColor="bg-primary bg-soft"
        />
        <Card
          title="Total Income"
          value={formatCurrency(totalIncome)}
          percentage={20}
          icon="📈"
          bgColor="bg-success bg-soft"
        />
        <Card
          title="Total Expense"
          value={formatCurrency(totalExpense)}
          percentage={5}
          icon="📉"
          bgColor="bg-danger bg-soft"
        />
      </div>

      {/* Charts Row */}
      <div className="row mb-4">
        {/* Line Chart */}
        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Income & Expense</h5>
              <div id="monthly-chart">
                <ReactApexChart
                  options={areaChartOptions}
                  series={areaChartOptions.series}
                  type="area"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Charts */}
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Income by Category</h5>
              <div id="income-category-chart">
                <ReactApexChart
                  options={incomeDonutOptions}
                  series={incomeDonutOptions.series}
                  type="donut"
                  height={200}
                />
              </div>
            </div>
          </div>
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Expense by Category</h5>
              <div id="expense-category-chart">
                <ReactApexChart
                  options={expenseDonutOptions}
                  series={expenseDonutOptions.series}
                  type="donut"
                  height={200}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Recent Transactions</h5>
                <Link
                  to="/finance/transactions"
                  className="btn btn-sm btn-primary"
                >
                  View All
                </Link>
              </div>

              <div className="table-responsive">
                <table className="table table-centered table-hover mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Description</th>
                      <th scope="col">Method</th>
                      <th scope="col">Date</th>
                      <th scope="col" className="text-end">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getRecentTransactions().map((transaction, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm me-3">
                              <span
                                className={`avatar-title rounded-circle ${
                                  transaction.type === "income"
                                    ? "bg-success-subtle text-success"
                                    : "bg-danger-subtle text-danger"
                                } font-size-20`}
                              >
                                {renderTransactionIcon(transaction)}
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">
                                {transaction.description}
                              </h6>
                              <p className="mb-0 text-muted">
                                {transaction.type === "income"
                                  ? "Income"
                                  : "Expense"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {transaction.payment_method ||
                            (transaction.type === "income"
                              ? "Bank account"
                              : "Credit card")}
                        </td>
                        <td>
                          {new Date(
                            transaction.transaction_date
                          ).toLocaleDateString("id-ID")}
                        </td>
                        <td
                          className={`text-end ${
                            transaction.type === "income"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {transaction.formattedAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
