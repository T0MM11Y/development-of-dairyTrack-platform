import React from "react";
import {
  Row,
  Col,
  Form,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

const SalesTransactionFilters = ({
  searchTerm,
  setSearchTerm,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  salesTransactions,
  setCurrentPage,
  formatDate,
}) => {
  const uniquePaymentMethods = [
    ...new Set(salesTransactions.map((tx) => tx.payment_method)),
  ];

  return (
    <Row className="mb-4">
      <Col md={6} lg={3}>
        <InputGroup className="shadow-sm mb-3">
          <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by customer name..."
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
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by Payment Method</option>
            {uniquePaymentMethods.map((method) => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
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
            setSelectedPaymentMethod("");
            setStartDate(
              formatDate(
                new Date(new Date().setMonth(new Date().getMonth() - 1))
              )
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

export default SalesTransactionFilters;
