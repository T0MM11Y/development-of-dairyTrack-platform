import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Image,
  Col,
  Row,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { getProductTypes } from "../../../controllers/productTypeController";

const ProductStockModals = ({
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showViewModal,
  setShowViewModal,
  newProductStock,
  setNewProductStock,
  selectedProductStock,
  setSelectedProductStock,
  handleAddProductStock,
  handleEditProductStock,
}) => {
  const [productTypes, setProductTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product types for dropdown
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await getProductTypes();
        if (response.success) {
          setProductTypes(response.productTypes);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch product types.",
          });
        }
      } catch (error) {
        console.error("Error fetching product types:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching product types.",
        });
      }
    };
    fetchProductTypes();
  }, []);

  // Handle input change for add modal
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewProductStock((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input change for edit modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProductStock((prev) => ({ ...prev, [name]: value }));
  };

  // Reset forms when closing modals
  const handleCloseAddModal = () => {
    setNewProductStock({
      product_type: "",
      initial_quantity: "",
      production_at: "",
      expiry_at: "",
      status: "available",
      total_milk_used: "",
      created_by: newProductStock.created_by,
    });
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  const handleCloseEditModal = () => {
    setSelectedProductStock(null);
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  // Modified handleAddProductStock to manage loading state
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await handleAddProductStock(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modified handleEditProductStock to manage loading state
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await handleEditProductStock(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Product Stock Modal */}
      <Modal
        show={showAddModal}
        onHide={handleCloseAddModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Product Stock
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Type</Form.Label>
                  <Form.Select
                    name="product_type"
                    value={newProductStock.product_type}
                    onChange={handleAddInputChange}
                    required
                  >
                    <option value="">Select product type</option>
                    {productTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.product_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="initial_quantity"
                    value={newProductStock.initial_quantity}
                    onChange={handleAddInputChange}
                    placeholder="Enter initial quantity"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Production Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="production_at"
                    value={newProductStock.production_at}
                    onChange={handleAddInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="expiry_at"
                    value={newProductStock.expiry_at}
                    onChange={handleAddInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={newProductStock.status}
                    onChange={handleAddInputChange}
                    required
                  >
                    <option value="available">Available</option>
                    <option value="expired">Expired</option>
                    <option value="contamination">Contamination</option>
                    <option value="sold_out">Sold Out</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Total Milk Used (Liters)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="total_milk_used"
                    value={newProductStock.total_milk_used}
                    onChange={handleAddInputChange}
                    placeholder="Enter total milk used"
                  />
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

      {/* Edit Product Stock Modal */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Product Stock
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {selectedProductStock && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Type</Form.Label>
                    <Form.Select
                      name="product_type"
                      value={selectedProductStock.product_type}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select product type</option>
                      {productTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.product_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Initial Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name="initial_quantity"
                      value={selectedProductStock.initial_quantity}
                      onChange={handleEditInputChange}
                      placeholder="Enter initial quantity"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Production Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="production_at"
                      value={selectedProductStock.production_at.slice(0, 16)}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="expiry_at"
                      value={selectedProductStock.expiry_at.slice(0, 16)}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={selectedProductStock.status}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="expired">Expired</option>
                      <option value="contamination">Contamination</option>
                      <option value="sold_out">Sold Out</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Total Milk Used (Liters)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="total_milk_used"
                      value={selectedProductStock.total_milk_used}
                      onChange={handleEditInputChange}
                      placeholder="Enter total milk used"
                    />
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

      {/* View Product Stock Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Product Stock Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProductStock && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Image
                      src={
                        selectedProductStock.product_type_detail?.image ||
                        "https://via.placeholder.com/150"
                      }
                      alt={
                        selectedProductStock.product_type_detail
                          ?.product_name || "N/A"
                      }
                      fluid
                      className="mb-3"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  </Col>
                  <Col md={6}>
                    <h5>
                      {selectedProductStock.product_type_detail?.product_name ||
                        "N/A"}
                    </h5>
                    <p>
                      <strong>Quantity:</strong> {selectedProductStock.quantity}{" "}
                      / {selectedProductStock.initial_quantity}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge
                        bg={
                          selectedProductStock.status === "available"
                            ? "success"
                            : selectedProductStock.status === "expired"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {selectedProductStock.status.charAt(0).toUpperCase() +
                          selectedProductStock.status.slice(1)}
                      </Badge>
                    </p>
                    <p>
                      <strong>Production Date:</strong>{" "}
                      {new Date(
                        selectedProductStock.production_at
                      ).toLocaleString("id-ID")}
                    </p>
                    <p>
                      <strong>Expiry Date:</strong>{" "}
                      {new Date(selectedProductStock.expiry_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                    <p>
                      <strong>Total Milk Used:</strong>{" "}
                      {selectedProductStock.total_milk_used} Liters
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {selectedProductStock.created_by?.username || "N/A"}
                    </p>
                    <p>
                      <strong>Updated By:</strong>{" "}
                      {selectedProductStock.updated_by?.username || "N/A"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedProductStock.created_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                    <p>
                      <strong>Updated At:</strong>{" "}
                      {new Date(selectedProductStock.updated_at).toLocaleString(
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

export default ProductStockModals;
