import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";

const SalesTransactionStats = ({ salesTransactions, formatRupiah }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = salesTransactions.length;
    const totalRevenue = salesTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.total_price || 0),
      0
    );
    const cashPayments = salesTransactions.filter(
      (tx) => tx.payment_method === "Cash"
    ).length;
    const completedOrders = salesTransactions.filter(
      (tx) => tx.order.status === "Completed"
    ).length;

    return {
      totalTransactions,
      totalRevenue,
      cashPayments,
      completedOrders,
    };
  }, [salesTransactions]);

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Transactions</h6>
                <h2 className="mt-2 mb-0">{stats.totalTransactions}</h2>
              </div>
              <div>
                <i className="fas fa-shopping-cart fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="bg-success text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Revenue</h6>
                <h2 className="mt-2 mb-0">{formatRupiah(stats.totalRevenue)}</h2>
              </div>
              <div>
                <i className="fas fa-money-bill-wave fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="bg-info text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Cash Payments</h6>
                <h2 className="mt-2 mb-0">{stats.cashPayments}</h2>
              </div>
              <div>
                <i className="fas fa-money-bill fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="bg-warning text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Completed Orders</h6>
                <h2 className="mt-2 mb-0">{stats.completedOrders}</h2>
              </div>
              <div>
                <i className="fas fa-check-circle fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SalesTransactionStats;