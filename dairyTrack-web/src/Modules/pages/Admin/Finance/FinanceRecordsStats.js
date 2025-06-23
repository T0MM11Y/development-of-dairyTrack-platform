import React, { useMemo } from "react";
import { Card, Row, Col } from "react-bootstrap";

const FinanceRecordsStats = ({ records, formatRupiah }) => {
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const totalExpense = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    return { totalRecords, totalIncome, totalExpense };
  }, [records]);

  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Records</h6>
                <h2 className="mt-2 mb-0">{stats.totalRecords}</h2>
              </div>
              <div>
                <i className="fas fa-list fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-success text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Income</h6>
                <h2 className="mt-2 mb-0">{formatRupiah(stats.totalIncome)}</h2>
              </div>
              <div>
                <i className="fas fa-arrow-up fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-danger text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Expense</h6>
                <h2 className="mt-2 mb-0">
                  {formatRupiah(stats.totalExpense)}
                </h2>
              </div>
              <div>
                <i className="fas fa-arrow-down fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default FinanceRecordsStats;