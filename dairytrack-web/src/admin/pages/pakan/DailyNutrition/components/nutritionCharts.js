import ReactApexChart from "react-apexcharts";
import { useMemo } from "react";

const NutritionCharts = ({ chartData, selectedCow, cowNames, nutrientMeta }) => {
  const areaChartOptions = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        series: [],
        chart: {
          height: 350,
          type: "area",
          toolbar: { show: false },
        },
        xaxis: {
          categories: [],
        },
      };
    }

    const availableNutrients = new Set();
    chartData.forEach((item) => {
      Object.keys(item.nutrients || {}).forEach((nutrient) =>
        availableNutrients.add(nutrient)
      );
    });

    const series = Array.from(availableNutrients).map((nutrient) => ({
      name: `${
        nutrient.charAt(0).toUpperCase() + nutrient.slice(1)
      } (${nutrientMeta[nutrient]?.unit || "unit"})`,
      data: chartData.map((item) => {
        const value =
          (item.nutrients[nutrient] || 0) *
          (nutrientMeta[nutrient]?.multiplier || 1);
        return parseFloat(value.toFixed(2));
      }),
    }));

    return {
      series,
      chart: {
        height: 350,
        type: "area",
        toolbar: { show: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00c4ff"],
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
        categories: chartData.map((item) => item.date),
        labels: { rotate: -45, style: { fontSize: "12px" } },
      },
      tooltip: {
        y: {
          formatter: (val, { seriesIndex }) => {
            const nutrient = Array.from(availableNutrients)[seriesIndex];
            return `${val} ${nutrientMeta[nutrient]?.unit || "unit"}`;
          },
        },
      },
      legend: { position: "top" },
    };
  }, [chartData, nutrientMeta]);

  const pieChartOptions = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        series: [],
        labels: [],
        chart: { type: "donut", height: 300 },
      };
    }

    const allNutrients = new Set();
    chartData.forEach((item) => {
      Object.keys(item.nutrients || {}).forEach((nutrient) =>
        allNutrients.add(nutrient)
      );
    });
    const nutrientList = Array.from(allNutrients);

    const nutrientTotals = nutrientList.map((nutrient) => {
      const total = chartData.reduce(
        (sum, item) => sum + (item.nutrients[nutrient] || 0),
        0
      );
      return parseFloat(
        ((total / chartData.length) * (nutrientMeta[nutrient]?.multiplier || 1)).toFixed(
          2
        )
      );
    });

    if (nutrientList.length === 0 || nutrientTotals.every((val) => val === 0)) {
      return {
        series: [1],
        labels: ["No Data"],
        chart: { type: "donut", height: 300 },
      };
    }

    return {
      series: nutrientTotals,
      chart: { type: "donut", height: 300 },
      labels: nutrientList.map(
        (nutrient) =>
          `${
            nutrient.charAt(0).toUpperCase() + nutrient.slice(1)
          } (${nutrientMeta[nutrient]?.unit || "unit"})`
      ),
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00c4ff"],
      legend: { position: "bottom" },
      responsive: [
        {
          breakpoint: 480,
          options: { chart: { width: 200 }, legend: { position: "bottom" } },
        },
      ],
      dataLabels: {
        enabled: true,
        formatter: (val) => parseFloat(val).toFixed(1) + "%",
      },
    };
  }, [chartData, nutrientMeta]);

  return (
    <div className="row mb-4">
      <div className="col-xl-8">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">
              Grafik Nilai Nutrisi
              {selectedCow && (
                <span className="text-primary ms-2">
                  ({cowNames[selectedCow] || `Sapi #${selectedCow}`})
                </span>
              )}
            </h5>
            {!selectedCow ? (
              <div className="alert alert-info text-center p-4">
                <i className="ri-information-line fs-3 mb-3"></i>
                <h5>Silakan Pilih Sapi</h5>
                <p>Untuk melihat grafik nutrisi, harap pilih sapi terlebih dahulu.</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="alert alert-warning text-center">
                <i className="ri-error-warning-line me-2"></i>
                Tidak ada data nutrisi tersedia untuk sapi dan rentang tanggal yang dipilih.
              </div>
            ) : (
              <div id="nutrition-chart">
                <ReactApexChart
                  options={areaChartOptions}
                  series={areaChartOptions.series}
                  type="area"
                  height={350}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-xl-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">Distribusi Nutrisi</h5>
            {!selectedCow || chartData.length === 0 ? (
              <div className="alert alert-info text-center p-3">
                <i className="ri-information-line me-2"></i>
                Data nutrisi tidak tersedia
              </div>
            ) : (
              <div id="nutrition-distribution-chart">
                <ReactApexChart
                  options={pieChartOptions}
                  series={pieChartOptions.series}
                  type="donut"
                  height={250}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionCharts;
