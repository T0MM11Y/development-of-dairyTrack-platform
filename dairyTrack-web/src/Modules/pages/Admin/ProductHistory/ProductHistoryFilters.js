
import React from "react";
import { Row, Col, Form, InputGroup, FormControl, Button } from "react-bootstrap";

const ProductHistoryFilters = ({
  searchTerm,
  setSearchTerm,
  selectedChangeType,
  setSelectedChangeType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  productHistory,
  setCurrentPage,
  formatDate,
}) => {
  const uniqueChangeTypes = [
    ...new Set(productHistory.map((ph) => ph.change_type)),
  ];

  return (
    <Row className="mb-4">
      <Col md={6} lg={3}>
        <InputGroup className="shadow-sm mb-3">
          <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              <i className="bi bi-x-lg" />
            </Button>
          )}
        </InputGroup>
      </Col>
      <Col md={6} lg={3}>
        <Form.Group className="mb-3">
          <Form.Select
            value={selectedChangeType}
            onChange={(e) => {
              setSelectedChangeType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by Change Type</option>
            {uniqueChangeTypes.map((changeType) => (
              <option key={changeType} value={changeType}>
                {changeType.charAt(0).toUpperCase() + changeType.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Button
          variant="outline-primary"
          size="sm"
          className="mt-2 w-100"
          onClick={() => {
            setSearchTerm("");
            setSelectedChangeType("");
            setStartDate(
              formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)))
            );
            setEndDate(formatDate(new Date()));
            setCurrentPage(1);
          }}
          style={{ letterSpacing: "0.5px" }}
        >
          <i className="fas fa-sync-alt me-2"></i> Reset Filters
        </Button>
      </Col>
    </Row>
  );
};

export default ProductHistoryFilters;