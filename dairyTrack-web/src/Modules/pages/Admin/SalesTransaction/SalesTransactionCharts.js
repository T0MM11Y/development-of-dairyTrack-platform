import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SalesTransactionCharts = ({ salesTransactions }) => {
  // Calculate chart data
  const chartData = useMemo(() => {
    const paymentMethodCounts = salesTransactions.reduce((acc, tx) => {
      const method = tx.payment_method || "Unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    const paymentMethodLabels = Object.keys(paymentMethodCounts);
    const paymentMethodValues = Object.values(paymentMethodCounts);
    const paymentMethodPercentages = paymentMethodValues.map((value) =>
      ((value / salesTransactions.length) * 100).toFixed(1)
    );

    const statusCounts = salesTransactions.reduce((acc, tx) => {
      const status = tx.order.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const statusLabels = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);
    const statusPercentages = statusValues.map((value) =>
      ((value / salesTransactions.length) * 100).toFixed(1)
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
      paymentMethod: {
        labels: paymentMethodLabels,
        datasets: [
          {
            data: paymentMethodValues,
            backgroundColor: colors.slice(0, paymentMethodLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
        percentages: paymentMethodPercentages,
      },
      status: {
        labels: statusLabels,
        datasets: [
          {
            data: statusValues,
            backgroundColor: colors.slice(0, statusLabels.length),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
        percentages: statusPercentages,
      },
    };
  }, [salesTransactions]);

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
              Payment Method Distribution
            </h5>
            {chartData.paymentMethod.labels.length > 0 ? (
              <div style={{ height: "250px" }}>
                <Doughnut data={chartData.paymentMethod} options={chartOptions} />
              </div>
            ) : (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No payment method data available.</p>
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
              Order Status Distribution
            </h5>
            {chartData.status.labels.length > 0 ? (
              <div style={{ height: "250px" }}>
                <Doughnut data={chartData.status} options={chartOptions} />
              </div>
            ) : (
              <div
                className="text-center py-4"
                style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}
              >
                <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                <p>No order status data available.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SalesTransactionCharts;