import { useEffect, useState } from "react";
import {
  getFinances,
  getFinanceExportPdf,
  getFinanceExportExcel,
} from "../../../../api/keuangan/finance";
import FinanceSummaryCards from "./components/FinanceSummaryCards";
import FinanceCharts from "./components/FinanceCharts";
import RecentTransactions from "./components/RecentTransactions";
import FilterExportPanel from "./components/FilterExportPanel";
import AddExpenseModal from "./AddExpensePage";
import AddIncomeModal from "./AddIncomePage";
import { useTranslation } from "react-i18next";


const Finance = () => {
  // State for data
  const [financeData, setFinanceData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  // State for filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [financeType, setFinanceType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [filters, setFilters] = useState({});

  // State for modals
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);

  // State for summary data
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState({});
  const [expenseByCategory, setExpenseByCategory] = useState({});

  const fetchData = async (filterParams = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filterParams.start_date)
        queryParams.append("start_date", filterParams.start_date);
      if (filterParams.end_date)
        queryParams.append("end_date", filterParams.end_date);
      if (filterParams.finance_type && filterParams.finance_type !== "all")
        queryParams.append("finance_type", filterParams.finance_type);

      const queryString = queryParams.toString();
      console.log("Fetching data with params:", queryString);

      const financesResponse = await getFinances(queryString);

      const incomes = financesResponse.filter(
        (item) => item.transaction_type === "income"
      );
      const expenses = financesResponse.filter(
        (item) => item.transaction_type === "expense"
      );

      setFinanceData(financesResponse);
      setIncomeData(incomes);
      setExpenseData(expenses);

      calculateTotals(incomes, expenses);
      processMonthlyData(incomes, expenses);
      processCategoryData(incomes, expenses);
      setError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        "Failed to fetch finance data. Please ensure the API server is active."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    let newFilters = {};

    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

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
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      start_date: startDate,
      end_date: endDate,
      finance_type: financeType,
    };
    setFilters(newFilters);
    setSelectedPeriod("");
    fetchData(newFilters);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFinanceType("");
    setSelectedPeriod("");
    const reset = {};
    setFilters(reset);
    fetchData(reset);
  };

  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.finance_type && filters.finance_type !== "all")
        queryParams.append("finance_type", filters.finance_type);

      const queryString = queryParams.toString();
      console.log("Exporting PDF with params:", queryString);

      const response = await getFinanceExportPdf(queryString);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("Failed to export PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.finance_type && filters.finance_type !== "all")
        queryParams.append("finance_type", filters.finance_type);

      const queryString = queryParams.toString();
      console.log("Exporting Excel with params:", queryString);

      const response = await getFinanceExportExcel(queryString);
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance_data_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      setError("Failed to export Excel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

    incomes.forEach((income) => {
      const monthIndex = new Date(income.transaction_date).getMonth();
      monthlyIncome[monthIndex] += parseFloat(income.amount || 0);
    });

    expenses.forEach((expense) => {
      const monthIndex = new Date(expense.transaction_date).getMonth();
      monthlyExpense[monthIndex] += parseFloat(expense.amount || 0);
    });

    setMonthlyData(
      months.map((month, index) => ({
        month,
        income: monthlyIncome[index],
        expense: monthlyExpense[index],
      }))
    );
  };

  const processCategoryData = (incomes, expenses) => {
    setIncomeByCategory(
      incomes.reduce((acc, income) => {
        const category =
          income.category ||
          income.income_type ||
          income.transaction_type ||
          "unknown";
        acc[category] = (acc[category] || 0) + parseFloat(income.amount || 0);
        return acc;
      }, {})
    );

    setExpenseByCategory(
      expenses.reduce((acc, expense) => {
        const category =
          expense.category ||
          expense.expense_type ||
          expense.transaction_type ||
          "unknown";
        acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
        return acc;
      }, {})
    );
  };

  const handleIncomeSaved = (newIncome) => {
    const updatedIncomeData = [...incomeData, newIncome];
    const updatedFinanceData = [...financeData, newIncome];

    setIncomeData(updatedIncomeData);
    setFinanceData(updatedFinanceData);

    calculateTotals(updatedIncomeData, expenseData);
    processMonthlyData(updatedIncomeData, expenseData);
    processCategoryData(updatedIncomeData, expenseData);
  };

  const handleExpenseSaved = (newExpense) => {
    const updatedExpenseData = [...expenseData, newExpense];
    const updatedFinanceData = [...financeData, newExpense];

    setExpenseData(updatedExpenseData);
    setFinanceData(updatedFinanceData);

    calculateTotals(incomeData, updatedExpenseData);
    processMonthlyData(incomeData, updatedExpenseData);
    processCategoryData(incomeData, updatedExpenseData);
  };

  useEffect(() => {
    fetchData({});
  }, []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">{t('finance.finance_title')}
          </h2>
          <p className="text-muted">
          {t('finance.finance_description')}.
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              data-bs-toggle="tooltip"
              title="Digunakan untuk menambahkan pemasukan"
              onClick={() => setShowAddIncomeModal(true)}
            >
              <i className="bx bx-plus me-1"></i> + {t('finance.add_income')}

            </button>

            <button
              className="btn btn-danger"
              data-bs-toggle="tooltip"
              title="Digunakan untuk menambahkan pengeluaran"
              onClick={() => setShowAddExpenseModal(true)}
            >
              <i className="bx bx-plus me-1"></i> + {t('finance.add_expense')}
            </button>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="d-flex justify-content-end gap-2">
            {["thisMonth", "lastMonth", "thisYear", "last12months"].map(
              (period) => (
                <button
                  key={period}
                  className={`btn ${
                    selectedPeriod === period ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => handlePeriodChange(period)}
                  disabled={loading}
                >
                  {period.replace(/([A-Z])/g, " $1").trim()}
                </button>
              )
            )}
          </div>
        </div>
      </div>

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
        error={error}
        loading={loading}
      />

      <FinanceSummaryCards
        currentBalance={currentBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        loading={loading}
      />

      <FinanceCharts
        monthlyData={monthlyData}
        incomeByCategory={incomeByCategory}
        expenseByCategory={expenseByCategory}
        loading={loading}
      />

      <RecentTransactions
        incomeData={incomeData}
        expenseData={expenseData}
        loading={loading}
      />

      {showAddIncomeModal && (
        <AddIncomeModal
          onClose={() => setShowAddIncomeModal(false)}
          onSaved={handleIncomeSaved}
        />
      )}
      {showAddExpenseModal && (
        <AddExpenseModal
          onClose={() => setShowAddExpenseModal(false)}
          onSaved={handleExpenseSaved}
        />
      )}
    </div>
  );
};

export default Finance;
