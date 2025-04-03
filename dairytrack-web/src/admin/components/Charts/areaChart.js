import ReactApexChart from "react-apexcharts";

const AreaChart = () => {
  const options = {
    series: [
      {
        name: "Milk Production",
        data: [3100, 3400, 2800, 3500, 3200, 3900, 4100],
      },
      {
        name: "Feed Consumption",
        data: [2100, 2300, 2500, 2200, 2400, 2600, 2800],
      },
    ],
    chart: { height: 350, type: "area" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      type: "datetime",
      categories: [
        "2023-05-01T00:00:00.000Z",
        "2023-05-02T00:00:00.000Z",
        "2023-05-03T00:00:00.000Z",
        "2023-05-04T00:00:00.000Z",
        "2023-05-05T00:00:00.000Z",
        "2023-05-06T00:00:00.000Z",
        "2023-05-07T00:00:00.000Z",
      ],
    },
    tooltip: { x: { format: "dd/MM/yy" } },
  };

  return (
    <ReactApexChart
      options={options}
      series={options.series}
      type="area"
      height={350}
    />
  );
};

export default AreaChart;