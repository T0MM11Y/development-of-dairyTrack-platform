import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const ProductTypeStats = ({ stats }) => {
  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Product Types</h6>
                <h2 className="mt-2 mb-0">{stats.totalProductTypes}</h2>
              </div>
              <div>
                <i className="fas fa-boxes fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductTypeStats;
