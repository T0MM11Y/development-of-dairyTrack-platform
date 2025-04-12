import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getFinances } from "../../../../api/keuangan/finance";
import { getIncomes } from "../../../../api/keuangan/income";
import { getExpenses } from "../../../../api/keuangan/expense";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [financesResponse, incomesResponse, expensesResponse] = await Promise.all([
          getFinances(),
          getIncomes(),
          getExpenses()
        ]);

        setFinanceData(financesResponse);
        setIncomeData(incomesResponse);
        setExpenseData(Array.isArray(expensesResponse) ? expensesResponse : [expensesResponse]);

        calculateTotals(incomesResponse, expensesResponse);
        processMonthlyData(incomesResponse, expensesResponse);
        processCategoryData(incomesResponse, expensesResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotals = (incomes, expenses) => {
    const totalInc = incomes.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalExp = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    setTotalIncome(totalInc);
    setTotalExpense(totalExp);
    setCurrentBalance(totalInc - totalExp);
  };

  const processMonthlyData = (incomes, expenses) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    incomes.forEach((income) => {
      const monthIndex = new Date(income.transaction_date).getMonth();
      monthlyIncome[monthIndex] += parseFloat(income.amount);
    });

    expenses.forEach((expense) => {
      const monthIndex = new Date(expense.transaction_date).getMonth();
      monthlyExpense[monthIndex] += parseFloat(expense.amount);
    });

    setMonthlyData(months.map((month, index) => ({
      month,
      income: monthlyIncome[index],
      expense: monthlyExpense[index],
    })));
  };

  const processCategoryData = (incomes, expenses) => {
    setIncomeByCategory(incomes.reduce((acc, income) => {
      const category = income.income_type;
      acc[category] = (acc[category] || 0) + parseFloat(income.amount);
      return acc;
    }, {}));

    setExpenseByCategory(expenses.reduce((acc, expense) => {
      const category = expense.expense_type;
      acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {}));
  };

  const formatCurrency = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const renderTransactionIcon = (transaction) => {
    const desc = transaction.description?.toLowerCase();
    if (desc?.includes("milk")) return "🥛";
    if (desc?.includes("cow")) return "🐄";
    if (desc?.includes("vet") || desc?.includes("doctor")) return "👨‍⚕️";
    if (desc?.includes("drug")) return "💊";
    return transaction.type === "income" ? "💰" : "💸";
  };

  // DataTable columns
  const columns = [
    {
      name: "Description",
      selector: row => row.description,
      cell: row => (
        <div className="d-flex align-items-center">
          <div className="avatar-sm me-3">
            <span className={`avatar-title rounded-circle ${
              row.type === "income" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
            } font-size-20`}>
              {renderTransactionIcon(row)}
            </span>
          </div>
          <div>
            <h6 className="mb-1">{row.description}</h6>
            <p className="mb-0 text-muted">{row.type === "income" ? "Income" : "Expense"}</p>
          </div>
        </div>
      ),
      grow: 2
    },
    {
      name: "Method",
      selector: row => row.payment_method || (row.type === "income" ? "Bank account" : "Credit card"),
    },
    {
      name: "Date",
      selector: row => new Date(row.transaction_date).toLocaleDateString("id-ID"),
      sortable: true
    },
    {
      name: "Amount",
      selector: row => row.formattedAmount,
      cell: row => (
        <div className={`text-end ${row.type === "income" ? "text-success" : "text-danger"}`}>
          {row.formattedAmount}
        </div>
      ),
      sortable: true
    }
  ];

  const transactions = [
    ...incomeData.map(item => ({
      ...item,
      type: "income",
      formattedAmount: `+${formatCurrency(item.amount)}`,
    })),
    ...expenseData.map(item => ({
      ...item,
      type: "expense",
      formattedAmount: `-${formatCurrency(item.amount)}`,
    }))
  ].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)).slice(0, 10);

  const areaChartOptions = {
    series: [
      { name: "Income", data: monthlyData.map(item => item.income) },
      { name: "Expense", data: monthlyData.map(item => item.expense) },
    ],
    chart: { height: 350, type: "area", toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#4f46e5", "#ef4444"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 90, 100] } },
    xaxis: { categories: monthlyData.map(item => item.month) },
    tooltip: { y: { formatter: val => formatCurrency(val) } }
  };

  const createDonutOptions = (data, colors) => ({
    series: Object.values(data),
    chart: { type: "donut", height: 200 },
    labels: Object.keys(data),
    colors,
    legend: { position: "bottom" },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }],
    dataLabels: { enabled: true, formatter: val => `${val.toFixed(1)}%` }
  });

  const Card = ({ title, value, percentage, icon, bgColor }) => (
    <div className="col-xl-4 col-md-6 mb-4">
      <div className="card h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-center flex-grow-1">
            <div className="flex-grow-1">
              <p className="text-muted fw-medium mb-2">{title}</p>
              <h4 className="mb-0">{value}</h4>
            </div>
            <div className={`avatar-sm rounded-circle ${bgColor} p-4 ms-3`}>
              <span className="avatar-title rounded-circle h4 mb-0">{icon}</span>
            </div>
          </div>
          <div className="mt-2">
            <span className={`badge ${percentage >= 0 ? "bg-success" : "bg-danger"} fw-bold font-size-12 me-2`}>
              <i className={`bx ${percentage >= 0 ? "bx-up-arrow-alt" : "bx-down-arrow-alt"} me-1 align-middle`}></i>
              {Math.abs(percentage)}%
            </span>
            <span className="text-muted font-size-12">from previous period</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
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
          <p className="text-muted">Catatan semua Finance keuangan peternakan ditampilkan di sini.</p>
        </div>
      </div>

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
            {["thisMonth", "lastMonth", "thisYear", "last12months"].map(period => (
              <button
                key={period}
                className={`btn ${selectedPeriod === period ? "btn-primary" : "btn-light"}`}
                onClick={() => handlePeriodChange(period)}
              >
                {period.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                🗓️ Select period
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={() => handlePeriodChange("custom")}>
                    Custom range
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <Card title="Available Balance" value={formatCurrency(currentBalance)} percentage={20} icon="💰" bgColor="bg-primary bg-soft" />
        <Card title="Total Income" value={formatCurrency(totalIncome)} percentage={20} icon="📈" bgColor="bg-success bg-soft" />
        <Card title="Total Expense" value={formatCurrency(totalExpense)} percentage={5} icon="📉" bgColor="bg-danger bg-soft" />
      </div>

      <div className="row mb-4">
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Income & Expense</h5>
              <ReactApexChart options={areaChartOptions} series={areaChartOptions.series} type="area" height={350} />
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Income by Category</h5>
              <ReactApexChart
                options={createDonutOptions(incomeByCategory, ["#4f46e5", "#60a5fa", "#34d399", "#a78bfa", "#f87171"])}
                series={Object.values(incomeByCategory)}
                type="donut"
                height={200}
              />
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Expense by Category</h5>
              <ReactApexChart
                options={createDonutOptions(expenseByCategory, ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"])}
                series={Object.values(expenseByCategory)}
                type="donut"
                height={200}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Recent Transactions</h5>
                <Link to="/finance/transactions" className="btn btn-sm btn-primary">View All</Link>
              </div>
              <DataTable
                columns={columns}
                data={transactions}
                pagination
                highlightOnHover
                striped
                responsive
                customStyles={{
                  headCells: {
                    style: {
                      fontWeight: 'bold',
                      backgroundColor: '#f8f9fa'
                    }
                  },
                  cells: {
                    style: {
                      padding: '12px'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;