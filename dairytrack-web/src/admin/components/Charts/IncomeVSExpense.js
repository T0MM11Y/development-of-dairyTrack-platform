import { useEffect, useState } from "react";
import { getFinances } from "../../../api/keuangan/finance";
import React from "react";
import ReactApexChart from "react-apexcharts";

const Finance = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const financesResponse = await getFinances();

      const incomes = financesResponse.filter(
        (item) => item.transaction_type === "income"
      );
      const expenses = financesResponse.filter(
        (item) => item.transaction_type === "expense"
      );

      processMonthlyData(incomes, expenses);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    `Rp ${Number(amount).toLocaleString("id-ID")}`;

  const areaChartOptions = {
    series: [
      { name: "Income", data: monthlyData.map((item) => item.income) },
      { name: "Expense", data: monthlyData.map((item) => item.expense) },
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
    xaxis: { categories: monthlyData.map((item) => item.month) },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
  };

  return (
    <div className="container-fluid p-4">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title mb-4">Income vs Expense</h5>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "350px" }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <ReactApexChart
              options={areaChartOptions}
              series={areaChartOptions.series}
              type="area"
              height={250}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
