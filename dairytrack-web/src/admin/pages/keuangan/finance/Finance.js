import { useEffect, useState } from "react";
import { getFinances } from "../../../../api/keuangan/finance";
import { getIncomes } from "../../../../api/keuangan/income";
import { getExpenses } from "../../../../api/keuangan/expense";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const financesResponse = await getFinances();
        const incomesResponse = await getIncomes();
        const expensesResponse = await getExpenses();
        
        setFinanceData(financesResponse);
        setIncomeData(incomesResponse);
        setExpenseData(Array.isArray(expensesResponse) ? expensesResponse : [expensesResponse]);

        // Calculate totals
        calculateTotals(incomesResponse, Array.isArray(expensesResponse) ? expensesResponse : [expensesResponse]);
        
        // Process monthly data for the chart
        processMonthlyData(incomesResponse, Array.isArray(expensesResponse) ? expensesResponse : [expensesResponse]);
        
        // Process category data for pie charts
        processCategoryData(incomesResponse, Array.isArray(expensesResponse) ? expensesResponse : [expensesResponse]);
      } catch (error) {
        console.error("Error fetching data:", error);
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    // Process incomes
    incomes.forEach(income => {
      const date = new Date(income.transaction_date);
      const monthIndex = date.getMonth();
      monthlyIncome[monthIndex] += parseFloat(income.amount);
    });

    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.transaction_date);
      const monthIndex = date.getMonth();
      monthlyExpense[monthIndex] += parseFloat(expense.amount);
    });

    // Normalize values to 0-100 range for chart display
    const maxValue = Math.max(...monthlyIncome, ...monthlyExpense);
    const normalizedIncome = monthlyIncome.map(value => maxValue > 0 ? (value / maxValue) * 100 : 0);
    const normalizedExpense = monthlyExpense.map(value => maxValue > 0 ? (value / maxValue) * 100 : 0);

    const data = months.map((month, index) => ({
      month,
      income: normalizedIncome[index],
      expense: normalizedExpense[index],
    }));

    setMonthlyData(data);
  };

  const processCategoryData = (incomes, expenses) => {
    // Process income by category
    const incomeCategories = {};
    incomes.forEach(income => {
      const category = income.income_type;
      if (!incomeCategories[category]) {
        incomeCategories[category] = 0;
      }
      incomeCategories[category] += parseFloat(income.amount);
    });
    setIncomeByCategory(incomeCategories);

    // Process expense by category
    const expenseCategories = {};
    expenses.forEach(expense => {
      const category = expense.expense_type;
      if (!expenseCategories[category]) {
        expenseCategories[category] = 0;
      }
      expenseCategories[category] += parseFloat(expense.amount);
    });
    setExpenseByCategory(expenseCategories);
  };

  const formatCurrency = (amount) => {
    return `Rp. ${Number(amount).toLocaleString('id-ID')}`;
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Here you would filter data based on the selected period
    // This is a placeholder for the actual implementation
  };

  const renderMonthlyChart = () => {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Income & Expense</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Expense</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 relative">
          {/* Line chart display */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" viewBox="0 0 800 300">
              {/* Grid lines */}
              <line x1="0" y1="250" x2="800" y2="250" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Income line */}
              <polyline
                points={monthlyData.map((data, index) => `${(index * 70) + 20},${250 - data.income * 2}`).join(' ')}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
              />
              
              {/* Income dots */}
              {monthlyData.map((data, index) => (
                <circle
                  key={`income-${index}`}
                  cx={(index * 70) + 20}
                  cy={250 - data.income * 2}
                  r="4"
                  fill="#4f46e5"
                />
              ))}
              
              {/* Expense line */}
              <polyline
                points={monthlyData.map((data, index) => `${(index * 70) + 20},${250 - data.expense * 2}`).join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />
              
              {/* Expense dots */}
              {monthlyData.map((data, index) => (
                <circle
                  key={`expense-${index}`}
                  cx={(index * 70) + 20}
                  cy={250 - data.expense * 2}
                  r="4"
                  fill="#ef4444"
                />
              ))}
              
              {/* Month labels */}
              {monthlyData.map((data, index) => (
                <text
                  key={`month-${index}`}
                  x={(index * 70) + 20}
                  y="280"
                  textAnchor="middle"
                  className="text-xs text-gray-500"
                  fontSize="12"
                >
                  {data.month}
                </text>
              ))}
              
              {/* Y-axis labels */}
              <text x="10" y="250" textAnchor="start" fontSize="12" fill="#9ca3af">0</text>
              <text x="10" y="200" textAnchor="start" fontSize="12" fill="#9ca3af">25</text>
              <text x="10" y="150" textAnchor="start" fontSize="12" fill="#9ca3af">50</text>
              <text x="10" y="100" textAnchor="start" fontSize="12" fill="#9ca3af">75</text>
              <text x="10" y="50" textAnchor="start" fontSize="12" fill="#9ca3af">100</text>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderPieChart = (title, data, colors) => {
    const totalAmount = Object.values(data).reduce((sum, amount) => sum + amount, 0);
    const categories = Object.keys(data);
    
    // Calculate percentages
    const percentages = {};
    categories.forEach(category => {
      percentages[category] = ((data[category] / totalAmount) * 100).toFixed(2);
    });
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <div className="flex">
          <div className="w-1/2">
            {categories.map((category, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="capitalize">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{percentages[category]}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-1/2 flex justify-center items-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="white" />
              {renderPieSlices(data, totalAmount, colors)}
              <circle cx="60" cy="60" r="25" fill="white" /> {/* Inner circle for donut chart */}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderPieSlices = (data, totalAmount, colors) => {
    const slices = [];
    const categories = Object.keys(data);
    
    let startAngle = 0;
    
    categories.forEach((category, index) => {
      const percentage = data[category] / totalAmount;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;
      
      // Convert angles to radians for calculation
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      
      // Calculate points on the circle
      const x1 = 60 + 50 * Math.cos(startRad);
      const y1 = 60 + 50 * Math.sin(startRad);
      const x2 = 60 + 50 * Math.cos(endRad);
      const y2 = 60 + 50 * Math.sin(endRad);
      
      // Create path for the slice
      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      slices.push(
        <path
          key={category}
          d={pathData}
          fill={colors[index % colors.length]}
        />
      );
      
      startAngle = endAngle;
    });
    
    return slices;
  };

  const getRecentTransactions = () => {
    // Combine income and expense transactions
    const allTransactions = [
      ...incomeData.map(item => ({
        ...item,
        type: 'income',
        formattedAmount: `+${formatCurrency(item.amount)}`,
      })),
      ...expenseData.map(item => ({
        ...item,
        type: 'expense',
        formattedAmount: `-${formatCurrency(item.amount)}`,
      })),
    ];
    
    // Sort by date, most recent first
    allTransactions.sort((a, b) => 
      new Date(b.transaction_date) - new Date(a.transaction_date)
    );
    
    // Return the most recent transactions (limited to 10)
    return allTransactions.slice(0, 10);
  };

  const renderTransactionIcon = (transaction) => {
    if (transaction.description?.toLowerCase().includes('milk')) {
      return <span className="text-2xl">🥛</span>;
    } else if (transaction.description?.toLowerCase().includes('cow')) {
      return <span className="text-2xl">🐄</span>;
    } else if (
      transaction.description?.toLowerCase().includes('vet') || 
      transaction.description?.toLowerCase().includes('doctor')
    ) {
      return <span className="text-2xl">👨‍⚕️</span>;
    } else if (transaction.description?.toLowerCase().includes('drug')) {
      return <span className="text-2xl">💊</span>;
    } else if (transaction.type === 'income') {
      return <span className="text-2xl">💰</span>;
    } else {
      return <span className="text-2xl">💸</span>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-2">Finance</h1>
      <p className="text-gray-600 mb-6">Catatan semua Finance keuangan peternakan ditampilkan di sini.</p>
      
      {/* Action buttons */}
      <div className="flex mb-6 gap-4">
        <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          <span>+</span>
          <span>Add income</span>
        </button>
        <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          <span>-</span>
          <span>Add expense</span>
        </button>
        
        <div className="ml-auto flex gap-2">
          <button 
            className={`px-4 py-2 rounded-md ${selectedPeriod === 'thisMonth' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => handlePeriodChange('thisMonth')}
          >
            This month
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${selectedPeriod === 'lastMonth' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => handlePeriodChange('lastMonth')}
          >
            Last month
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${selectedPeriod === 'thisYear' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => handlePeriodChange('thisYear')}
          >
            This year
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${selectedPeriod === 'last12months' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => handlePeriodChange('last12months')}
          >
            Last 12 months
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md">
            <span>🗓️</span>
            <span>Select period</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Available Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold">{formatCurrency(currentBalance)}</h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-600">Available Balance</span>
            <div className="flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">+20%</span>
              <span className="text-gray-500 text-xs ml-2">last month</span>
            </div>
          </div>
        </div>
        
        {/* Total Income Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold">{formatCurrency(totalIncome)}</h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-600">Total Income</span>
            <div className="flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">+20%</span>
              <span className="text-gray-500 text-xs ml-2">last month</span>
            </div>
          </div>
        </div>
        
        {/* Total Expense Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold">{formatCurrency(totalExpense)}</h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-600">Total Expense</span>
            <div className="flex items-center">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">+5%</span>
              <span className="text-gray-500 text-xs ml-2">last month</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart */}
        {renderMonthlyChart()}
        
        {/* Category Charts */}
        <div className="grid grid-rows-2 gap-6">
          {/* Income Category Chart */}
          {renderPieChart('Income', incomeByCategory, ['#4f46e5', '#60a5fa', '#34d399', '#a78bfa', '#f87171'])}
          
          {/* Expense Category Chart */}
          {renderPieChart('Expense', expenseByCategory, ['#4f46e5', '#60a5fa', '#34d399', '#a78bfa', '#f87171'])}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transaction</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left text-gray-500">Description</th>
                <th className="py-2 px-4 text-left text-gray-500">Method</th>
                <th className="py-2 px-4 text-left text-gray-500">Date</th>
                <th className="py-2 px-4 text-left text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {getRecentTransactions().map((transaction, index) => (
                <tr key={index} className="border-b">
                  <td className="py-4 px-4 flex items-center gap-3">
                    {renderTransactionIcon(transaction)}
                    <span>{transaction.description}</span>
                  </td>
                  <td className="py-4 px-4">
                    {transaction.payment_method || (transaction.type === 'income' ? 'Bank account' : 'Credit card')}
                  </td>
                  <td className="py-4 px-4">
                    {new Date(transaction.transaction_date).toISOString().split('T')[0]}
                  </td>
                  <td className={`py-4 px-4 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.formattedAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;