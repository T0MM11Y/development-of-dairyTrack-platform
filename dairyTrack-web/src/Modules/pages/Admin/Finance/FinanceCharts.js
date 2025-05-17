// src/components/FinanceCharts.jsx
import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import ReactApexChart from "react-apexcharts";

const FinanceCharts = ({ incomes, expenses, loading }) => {
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

    incomes.forEach((income) => {
      const monthIndex = new Date(income.transaction_date).getMonth();
      monthlyIncome[monthIndex] += parseFloat(income.amount || "0");
    });

    expenses.forEach((expense) => {
      const monthIndex = new Date(expense.transaction_date).getMonth();
      monthlyExpense[monthIndex] += parseFloat(expense.amount || "0");
    });

    const incomeByCategory = incomes.reduce((acc, income) => {
      const category = income.income_type_detail?.name || "Unknown";
      acc[category] = (acc[category] || 0) + parseFloat(income.amount || "0");
      return acc;
    }, {});
    const incomeCategoryLabels = Object.keys(incomeByCategory);
    const incomeCategoryValues = Object.values(incomeByCategory);

    const expenseByCategory = expenses.reduce((acc, expense) => {
      const category = expense.expense_type_detail?.name || "Unknown";
      acc[category] = (acc[category] || 0) + parseFloat(expense.amount || "0");
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
      monthly: { income: monthlyIncome, expense: monthlyExpense, months },
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
  }, [incomes, expenses]);

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
        formatter: (val) =>
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(val),
      },
    },
  };

  const donutChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "Nunito", size: 14, weight: "500" },
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
        titleFont: { family: "Nunito", size: 14 },
        bodyFont: { family: "Nunito", size: 12 },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      <div className="col-span-2 bg-white shadow-md rounded-lg p-6">
        <h5 className="text-lg font-nunito font-semibold text-center mb-4">
          Income vs Expense
        </h5>
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <ReactApexChart
            options={areaChartOptions}
            series={areaChartOptions.series}
            type="area"
            height={350}
          />
        )}
      </div>
      <div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-4">
          <h5 className="text-lg font-nunito font-semibold text-center mb-4">
            Income by Category
          </h5>
          {loading || chartData.incomeCategory.labels.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-chart-pie text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-600">
                No income category data available.
              </p>
            </div>
          ) : (
            <div className="h-48">
              <Doughnut
                data={chartData.incomeCategory}
                options={donutChartOptions}
              />
            </div>
          )}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h5 className="text-lg font-nunito font-semibold text-center mb-4">
            Expense by Category
          </h5>
          {loading || chartData.expenseCategory.labels.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-chart-pie text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-600">
                No expense category data available.
              </p>
            </div>
          ) : (
            <div className="h-48">
              <Doughnut
                data={chartData.expenseCategory}
                options={donutChartOptions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceCharts;
