import React from "react";
import {
  Row,
  Col,
  Form,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

const ProductTypeFilters = ({
  searchTerm,
  setSearchTerm,
  selectedUnit,
  setSelectedUnit,
  productTypes,
  setCurrentPage,
}) => {
  const uniqueUnits = [...new Set(productTypes.map((pt) => pt.unit))];

  return (
    <Row className="mb-4">
      <Col md={6} lg={5}>
        <InputGroup className="shadow-sm mb-3">
          <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by name or description..."
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
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by Unit</option>
            {uniqueUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
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
            setSelectedUnit("");
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

export default ProductTypeFilters;
