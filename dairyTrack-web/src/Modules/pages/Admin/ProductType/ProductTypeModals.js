import React, { useState } from "react"; // Add useState import
import {
  Modal,
  Button,
  Form,
  Image,
  Col,
  Row,
  Card,
  Badge,
  Spinner, // Ensure Spinner is imported
} from "react-bootstrap";
import CurrencyInput from "react-currency-input-field";
import Swal from "sweetalert2";
import { useMemo } from "react";

// Fungsi untuk memformat harga ke Rupiah
const formatRupiah = (value) => {
  if (!value) return "Rp 0";
  const number = parseFloat(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const ProductTypeModals = ({
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showViewModal,
  setShowViewModal,
  newProductType,
  setNewProductType,
  selectedProductType,
  setSelectedProductType,
  handleAddProductType,
  handleEditProductType,
}) => {
  // Add loading state for form submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file input change
  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setSelectedProductType((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      } else {
        setNewProductType((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
    }
  };

  // Handle input change for add modal
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewProductType((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input change for edit modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProductType((prev) => ({ ...prev, [name]: value }));
  };

  // Handle CurrencyInput for price
  const handlePriceChange = (value, isEdit = false) => {
    const numericValue = value ? parseFloat(value.replace(/[^0-9]/g, "")) : "";
    if (isEdit) {
      setSelectedProductType((prev) => ({
        ...prev,
        price: numericValue || "",
      }));
    } else {
      setNewProductType((prev) => ({
        ...prev,
        price: numericValue || "",
      }));
    }
  };

  // Reset forms when closing modals
  const handleCloseAddModal = () => {
    setNewProductType({
      product_name: "",
      product_description: "",
      price: "",
      unit: "",
      image: null,
      imagePreview: null,
    });
    setShowAddModal(false);
    setIsSubmitting(false); // Reset loading state
  };

  const handleCloseEditModal = () => {
    setSelectedProductType(null);
    setShowEditModal(false);
    setIsSubmitting(false); // Reset loading state
  };

  // Modified handleAddProductType to manage loading state
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true
    try {
      await handleAddProductType(e);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Modified handleEditProductType to manage loading state
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true
    try {
      await handleEditProductType(e);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <>
      {/* Add Product Type Modal */}
      <Modal
        show={showAddModal}
        onHide={handleCloseAddModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Product Type
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="product_name"
                    value={newProductType.product_name}
                    onChange={handleAddInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price (Rp)</Form.Label>
                  <CurrencyInput
                    prefix="Rp "
                    groupSeparator="."
                    decimalSeparator=","
                    className="form-control"
                    value={newProductType.price}
                    onValueChange={(value) => handlePriceChange(value)}
                    placeholder="Enter price"
                    decimalsLimit={0}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    name="unit"
                    value={newProductType.unit}
                    onChange={handleAddInputChange}
                    required
                  >
                    <option value="">Select unit</option>
                    <option value="botol">Botol</option>
                    <option value="cup">Cup</option>
                    <option value="pcs">Pcs</option>
                    <option value="liter">Liter</option>
                    <option value="galon">Galon</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="product_description"
                    value={newProductType.product_description}
                    onChange={handleAddInputChange}
                    placeholder="Enter product description"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e)}
                  />
                  {newProductType.imagePreview && (
                    <Image
                      src={newProductType.imagePreview}
                      alt="Preview"
                      fluid
                      className="mt-2"
                      style={{ maxHeight: "100px" }}
                    />
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseAddModal}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Product Type Modal */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Product Type
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {selectedProductType && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="product_name"
                      value={selectedProductType.product_name}
                      onChange={handleEditInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (Rp)</Form.Label>
                    <CurrencyInput
                      prefix="Rp "
                      groupSeparator="."
                      decimalSeparator=","
                      className="form-control"
                      value={selectedProductType.price}
                      onValueChange={(value) => handlePriceChange(value, true)}
                      placeholder="Enter price"
                      decimalsLimit={0}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit</Form.Label>
                    <Form.Select
                      name="unit"
                      value={selectedProductType.unit}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select unit</option>
                      <option value="botol">Botol</option>
                      <option value="cup">Cup</option>
                      <option value="pcs">Pcs</option>
                      <option value="liter">Liter</option>
                      <option value="galon">Galon</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="product_description"
                      value={selectedProductType.product_description}
                      onChange={handleEditInputChange}
                      placeholder="Enter product description"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                    />
                    {selectedProductType.imagePreview ||
                    selectedProductType.image ? (
                      <Image
                        src={
                          selectedProductType.imagePreview ||
                          selectedProductType.image
                        }
                        alt="Preview"
                        fluid
                        className="mt-2"
                        style={{ maxHeight: "100px" }}
                      />
                    ) : null}
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseEditModal}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Product Type Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Product Type Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProductType && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Image
                      src={
                        selectedProductType.image ||
                        "https://via.placeholder.com/150"
                      }
                      alt={selectedProductType.product_name}
                      fluid
                      className="mb-3"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  </Col>
                  <Col md={6}>
                    <h5>{selectedProductType.product_name}</h5>
                    <p>
                      {selectedProductType.product_description ||
                        "No description available."}
                    </p>
                    <p>
                      <strong>Price:</strong>{" "}
                      {formatRupiah(selectedProductType.price)}
                    </p>
                    <p>
                      <strong>Unit:</strong>{" "}
                      <Badge bg="info">{selectedProductType.unit}</Badge>
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {selectedProductType.created_by?.username || "N/A"}
                    </p>
                    <p>
                      <strong>Updated By:</strong>{" "}
                      {selectedProductType.updated_by?.username || "N/A"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedProductType.created_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                    <p>
                      <strong>Updated At:</strong>{" "}
                      {new Date(selectedProductType.updated_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductTypeModals;
