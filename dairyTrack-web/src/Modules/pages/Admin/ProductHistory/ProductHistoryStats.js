import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";

const ProductHistoryStats = ({ productHistory }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalHistory = productHistory.length;
    const expiredChanges = productHistory.filter(
      (ph) => ph.change_type === "expired"
    ).length;
    const soldOutChanges = productHistory.filter(
      (ph) => ph.change_type === "sold"
    ).length;
    const contamintationOutChanges = productHistory.filter(
      (ph) => ph.change_type === "contamination"
    ).length;
    return {
      totalHistory,
      expiredChanges,
      soldOutChanges,
      contamintationOutChanges,
    };
  }, [productHistory]);

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total History Records</h6>
                <h2 className="mt-2 mb-0">{stats.totalHistory}</h2>
              </div>
              <div>
                <i className="fas fa-history fa-3x opacity-50"></i>
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
                <h6 className="card-title mb-0">Sold Out Changes</h6>
                <h2 className="mt-2 mb-0">{stats.soldOutChanges}</h2>
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
                <h6 className="card-title mb-0">Expired Changes</h6>
                <h2 className="mt-2 mb-0">{stats.expiredChanges}</h2>
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
                <h6 className="card-title mb-0">Contamination Changes</h6>
                <h2 className="mt-2 mb-0">{stats.contamintationOutChanges}</h2>
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

export default ProductHistoryStats;
