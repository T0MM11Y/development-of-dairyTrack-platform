import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const OrderStats = ({ stats }) => {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Orders</h6>
                <h2 className="mt-2 mb-0">{stats.totalOrders}</h2>
              </div>
              <div>
                <i className="fas fa-shopping-cart fa-3x opacity-50"></i>
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
                <h6 className="card-title mb-0">Requested Orders</h6>
                <h2 className="mt-2 mb-0">{stats.requestedOrders}</h2>
              </div>
              <div>
                <i className="fas fa-hourglass-start fa-3x opacity-50"></i>
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
                <h6 className="card-title mb-0">Processed Orders</h6>
                <h2 className="mt-2 mb-0">{stats.processedOrders}</h2>
              </div>
              <div>
                <i className="fas fa-cogs fa-3x opacity-50"></i>
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

export default OrderStats;
