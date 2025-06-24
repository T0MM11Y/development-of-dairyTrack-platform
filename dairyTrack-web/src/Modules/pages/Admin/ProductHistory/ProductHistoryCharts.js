import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ProductHistoryCharts = ({ productHistory }) => {
  // Calculate chart data
  const chartData = useMemo(() => {
    const productNameCounts = productHistory.reduce((acc, ph) => {
      const name = ph.product_name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const productNameLabels = Object.keys(productNameCounts);
    const productNameValues = Object.values(productNameCounts);
    const productNamePercentages = productNameValues.map((value) =>
      ((value / productHistory.length) * 100).toFixed(1)
    );

    const changeTypeCounts = productHistory.reduce((acc, ph) => {
      const type = ph.change_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const changeTypeLabels = Object.keys(changeTypeCounts);
    const changeTypeValues = Object.values(changeTypeCounts);
    const changeTypePercentages = changeTypeValues.map((value) =>
      ((value / productHistory.length) * 100).toFixed(1)
    );

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
      productName: {
        labels: productNameLabels,
        datasets: [
          {
            data: productNameValues,
            backgroundColor: colors.slice(0, productNameLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
        percentages: productNamePercentages,
      },
      changeType: {
        labels: changeTypeLabels,
        datasets: [
          {
            data: changeTypeValues,
            backgroundColor: colors.slice(0, changeTypeLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
        percentages: changeTypePercentages,
      },
    };
  }, [productHistory]);

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "'Nunito', sans-serif",
            size: 14,
            weight: "500",
          },
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
        titleFont: {
          family: "'Nunito', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Nunito', sans-serif",
          size: 12,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Row className="mb-4">
      <Col md={6}>
        <Card className="shadow-sm border-0 rounded">
          <Card.Body>
            <h5
              className="card-title text-center mb-4"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: "600",
                color: "#444",
              }}
            >
              Product Name Distribution
            </h5>
            {chartData.productName.labels.length > 0 ? (
              <div style={{ height: "250px" }}>
                <Doughnut data={chartData.productName} options={chartOptions} />
              </div>
            ) : (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No product name data available.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="shadow-sm border-0 rounded">
          <Card.Body>
            <h5
              className="card-title text-center mb-4"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: "600",
                color: "#444",
              }}
            >
              Change Type Distribution
            </h5>
            {chartData.changeType.labels.length > 0 ? (
              <div style={{ height: "250px" }}>
                <Doughnut data={chartData.changeType} options={chartOptions} />
              </div>
            ) : (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No change type data available.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductHistoryCharts;
