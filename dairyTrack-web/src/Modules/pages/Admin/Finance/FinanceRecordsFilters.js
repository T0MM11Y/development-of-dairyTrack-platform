import React from "react";
import {
  Row,
  Col,
  InputGroup,
  FormControl,
  Form,
  Button,
} from "react-bootstrap";

const FinanceRecordsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  setCurrentPage,
}) => {
  return (
    <Row className="mb-4">
      <Col md={6} lg={5}>
        <InputGroup className="shadow-sm mb-3">
          <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by description..."
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
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
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
            setSelectedType("");
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

export default FinanceRecordsFilters;
