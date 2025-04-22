import React from "react";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";


const FinanceCharts = ({ monthlyData, incomeByCategory, expenseByCategory, loading }) => {
  const formatCurrency = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;
  const { t } = useTranslation();

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
      gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 90, 100] },
    },
    xaxis: { categories: monthlyData.map((item) => item.month) },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
  };

  const createDonutOptions = (data, colors) => ({
    series: Object.values(data),
    chart: { type: "donut", height: 200 },
    labels: Object.keys(data),
    colors,
    legend: { position: "bottom" },
    responsive: [
      { breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } },
    ],
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
  });

  return (
    <div className="row mb-4">
      <div className="col-xl-8">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title mb-4">{t('finance.income_expense')}
            </h5>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "350px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t('finance.loading')}
                  ...</span>
                </div>
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
        </div>
      </div>

      <div className="col-xl-4">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-4">{t('finance.income_by_category')}
            </h5>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t('finance.loading')}
                  ...</span>
                </div>
              </div>
            ) : (
              <ReactApexChart
                options={createDonutOptions(incomeByCategory, [
                  "#4f46e5",
                  "#60a5fa",
                  "#34d399",
                  "#a78bfa",
                  "#f87171",
                ])}
                series={Object.values(incomeByCategory)}
                type="donut"
                height={200}
              />
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">{t('finance.expense_by_category')}
            </h5>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t('finance.loading')}
                  ...</span>
                </div>
              </div>
            ) : (
              <ReactApexChart
                options={createDonutOptions(expenseByCategory, [
                  "#f87171",
                  "#fb923c",
                  "#facc15",
                  "#4ade80",
                  "#60a5fa",
                ])}
                series={Object.values(expenseByCategory)}
                type="donut"
                height={200}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceCharts;