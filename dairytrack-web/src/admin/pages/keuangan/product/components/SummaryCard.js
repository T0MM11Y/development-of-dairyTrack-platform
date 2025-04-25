// components/SummaryCards.jsx
import ReactApexChart from "react-apexcharts";
import MetricCard from "./MetricCard";
import ChangeTypeCard from "./ChangeTypeCard";

const SummaryCards = ({ summaryData, t, getChangeTypeLabel }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Configure chart options
  const productTypeChartOptions = {
    series: summaryData.productTypeData.map((item) => item.value),
    options: {
      chart: {
        type: "donut",
      },
      labels: summaryData.productTypeData.map((item) => item.name),
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
    },
  };

  const changeTypeChartOptions = {
    series: summaryData.changeTypeData.map((item) => item.value),
    options: {
      chart: {
        type: "donut",
      },
      labels: summaryData.changeTypeData.map((item) => item.name),
      colors: ["#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6c757d"],
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
    },
  };

  return (
    <div className="row">
      {/* Total Quantity Card */}
      <div className="col-md-3">
        <MetricCard
          title="Total Quantity Changed"
          value={formatNumber(summaryData.totalQuantity)}
          percentage={summaryData.quantityPercentage}
          icon="🥛"
          bgColor=""
        />
      </div>

      {/* Change Type Summary Cards */}
      <div className="col-md-3">
        <ChangeTypeCard
          title={getChangeTypeLabel("sold")}
          value={formatNumber(summaryData.changeTypeSummary.sold)}
          icon="💰"
          type="sold"
        />
      </div>

      <div className="col-md-3">
        <ChangeTypeCard
          title={getChangeTypeLabel("expired")}
          value={formatNumber(summaryData.changeTypeSummary.expired)}
          icon="⏱️"
          type="expired"
        />
      </div>

      <div className="col-md-3">
        <ChangeTypeCard
          title={getChangeTypeLabel("contamination")}
          value={formatNumber(summaryData.changeTypeSummary.contamination)}
          icon="☣️"
          type="contamination"
        />
      </div>

      {/* Product Type Distribution */}
      <div className="col-md-6">
        <div className="card" style={{ height: "346px" }}>
          <div className="card-body">
            <h4 className="card-title mb-4">
              {t("product.product_type_distribution")}
            </h4>
            <div style={{ height: "280px" }}>
              {summaryData.productTypeData.length > 0 ? (
                <ReactApexChart
                  options={productTypeChartOptions.options}
                  series={productTypeChartOptions.series}
                  type="donut"
                  height="280"
                />
              ) : (
                <div className="text-center my-5">
                  {t("product.no_data_available")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Type Distribution */}
      <div className="col-md-6">
        <div className="card" style={{ height: "346px" }}>
          <div className="card-body">
            <h4 className="card-title mb-4">{t("product.change_type")}</h4>
            <div style={{ height: "280px" }}>
              {summaryData.changeTypeData.length > 0 ? (
                <ReactApexChart
                  options={changeTypeChartOptions.options}
                  series={changeTypeChartOptions.series}
                  type="donut"
                  height="280"
                />
              ) : (
                <div className="text-center my-5">
                  {t("product.no_data_available")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
