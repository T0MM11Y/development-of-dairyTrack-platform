import React from "react";
import ReactApexChart from "react-apexcharts";

const MilkSalesVsExpensesChart = () => {
  const columnChartOptions = {
    series: [
      {
        name: "Milk Sales",
        data: [44000, 55000, 57000, 56000, 61000, 58000, 63000, 60000, 66000],
      },
      {
        name: "Expenses",
        data: [76000, 85000, 101000, 98000, 87000, 105000, 91000, 114000, 94000],
      },
    ],
    chart: { type: "bar", height: 350 },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    },
    yaxis: { title: { text: "$ (dollars)" } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `$ ${val}` } },
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Milk Sales vs Expenses</h4>
        <ReactApexChart
          options={columnChartOptions}
          series={columnChartOptions.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default MilkSalesVsExpensesChart;