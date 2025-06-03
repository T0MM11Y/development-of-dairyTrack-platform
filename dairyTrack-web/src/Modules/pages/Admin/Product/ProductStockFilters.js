import React from "react";
import { Row, Col, Form, InputGroup, FormControl, Button } from "react-bootstrap";

const ProductStockFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  productStocks,
  setCurrentPage,
}) => {
  const uniqueStatuses = [...new Set(productStocks.map((ps) => ps.status))];

  return (
    <Row className="mb-4">
      <Col md={6} lg={5}>
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
      <Col md={6} lg={5}>
        <Form.Group className="mb-3">
          <Form.Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Button
          variant="outline-primary"
          size="sm"
          className="mt-2 w-100"
          onClick={() => {
            setSearchTerm("");
            setSelectedStatus("");
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

export default ProductStockFilters;