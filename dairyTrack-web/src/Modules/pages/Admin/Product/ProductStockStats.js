import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const ProductStockStats = ({ stats }) => {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Stocks</h6>
                <h2 className="mt-2 mb-0">{stats.totalStocks}</h2>
              </div>
              <div>
                <i className="fas fa-warehouse fa-3x opacity-50"></i>
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
                <h6 className="card-title mb-0">Available Stocks</h6>
                <h2 className="mt-2 mb-0">{stats.availableStocks}</h2>
              </div>
              <div>
                <i className="fas fa-check-circle fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="bg-danger text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Expired Stocks</h6>
                <h2 className="mt-2 mb-0">{stats.expiredStocks}</h2>
              </div>
              <div>
                <i className="fas fa-exclamation-triangle fa-3x opacity-50"></i>
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
                <h6 className="card-title mb-0">Contamination Stocks</h6>
                <h2 className="mt-2 mb-0">{stats.contaminationStocks}</h2>
              </div>
              <div>
                <i className="fas fa-trash fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductStockStats;
