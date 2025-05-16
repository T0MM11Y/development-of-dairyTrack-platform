import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Image, Col, Row, Card, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { getProductTypes } from "../../../controllers/productTypeController";

const OrderModals = ({
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showViewModal,
  setShowViewModal,
  newOrder,
  setNewOrder,
  selectedOrder,
  setSelectedOrder,
  handleAddOrder,
  handleEditOrder,
}) => {
  const [productTypes, setProductTypes] = useState([]);

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
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Handle order item change for add modal
  const handleAddItemChange = (index, e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => {
      const order_items = [...prev.order_items];
      order_items[index] = { ...order_items[index], [name]: value };
      return { ...prev, order_items };
    });
  };

  // Handle input change for edit modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Handle order item change for edit modal
  const handleEditItemChange = (index, e) => {
    const { name, value } = e.target;
    setSelectedOrder((prev) => {
      const order_items = [...prev.order_items];
      order_items[index] = { ...order_items[index], [name]: value };
      return { ...prev, order_items };
    });
  };

  // Reset forms when closing modals
  const handleCloseAddModal = () => {
    setNewOrder({
      customer_name: "",
      email: "",
      phone_number: "",
      location: "",
      status: "Requested",
      payment_method: "",
      order_items: [{ product_type_id: "", quantity: "" }],
      notes: "",
    });
    setShowAddModal(false);
  };

  const handleCloseEditModal = () => {
    setSelectedOrder(null);
    setShowEditModal(false);
  };

  // Format Rupiah
  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <>
      {/* Add Order Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Order
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddOrder}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customer_name"
                    value={newOrder.customer_name}
                    onChange={handleAddInputChange}
                    placeholder="Enter customer name"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={newOrder.email}
                    onChange={handleAddInputChange}
                    placeholder="Enter email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={newOrder.phone_number}
                    onChange={handleAddInputChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={newOrder.location}
                    onChange={handleAddInputChange}
                    placeholder="Enter location"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={newOrder.status}
                    onChange={handleAddInputChange}
                    required
                  >
                    <option value="Requested">Requested</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="payment_method"
                    value={newOrder.payment_method}
                    onChange={handleAddInputChange}
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={newOrder.notes}
                    onChange={handleAddInputChange}
                    placeholder="Enter notes"
                  />
                </Form.Group>
              </Col>
            </Row>
            <h5 className="mt-3">Order Items</h5>
            {newOrder.order_items.map((item, index) => (
              <Row key={index} className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Product Type</Form.Label>
                    <Form.Select
                      name="product_type_id"
                      value={item.product_type_id}
                      onChange={(e) => handleAddItemChange(index, e)}
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
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleAddItemChange(index, e)}
                      placeholder="Enter quantity"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Order Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Order
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditOrder}>
          <Modal.Body>
            {selectedOrder && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="customer_name"
                      value={selectedOrder.customer_name}
                      onChange={handleEditInputChange}
                      placeholder="Enter customer name"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={selectedOrder.email}
                      onChange={handleEditInputChange}
                      placeholder="Enter email"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone_number"
                      value={selectedOrder.phone_number}
                      onChange={handleEditInputChange}
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={selectedOrder.location}
                      onChange={handleEditInputChange}
                      placeholder="Enter location"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={selectedOrder.status}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="Requested">Requested</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      name="payment_method"
                      value={selectedOrder.payment_method}
                      onChange={handleEditInputChange}
                    >
                      <option value="">Select payment method</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={selectedOrder.notes}
                      onChange={handleEditInputChange}
                      placeholder="Enter notes"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            {selectedOrder && (
              <>
                <h5 className="mt-3">Order Items</h5>
                {selectedOrder.order_items.map((item, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Product Type</Form.Label>
                        <Form.Select
                          name="product_type_id"
                          value={item.product_type_id}
                          onChange={(e) => handleEditItemChange(index, e)}
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
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleEditItemChange(index, e)}
                          placeholder="Enter quantity"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Order Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5>Order #{selectedOrder.order_no}</h5>
                    <p>
                      <strong>Customer Name:</strong> {selectedOrder.customer_name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone Number:</strong> {selectedOrder.phone_number || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedOrder.location || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge
                        bg={
                          selectedOrder.status === "Requested"
                            ? "warning"
                            : selectedOrder.status === "Completed"
                            ? "success"
                            : "danger"
                        }
                      >
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Badge>
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {selectedOrder.payment_method || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Shipping Cost:</strong>{" "}
                      {formatRupiah(selectedOrder.shipping_cost)}
                    </p>
                    <p>
                      <strong>Total Price:</strong>{" "}
                      {formatRupiah(selectedOrder.total_price)}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedOrder.created_at).toLocaleString("id-ID")}
                    </p>
                    <p>
                      <strong>Notes:</strong> {selectedOrder.notes || "N/A"}
                    </p>
                    <h6>Order Items:</h6>
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="mb-2">
                        <p>
                          <strong>Product:</strong>{" "}
                          {item.product_type_detail?.product_name || "N/A"}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>Total Price:</strong>{" "}
                          {formatRupiah(item.total_price)}
                        </p>
                        {item.product_type_detail?.image && (
                          <Image
                            src={item.product_type_detail.image}
                            alt={item.product_type_detail.product_name}
                            fluid
                            className="mb-2"
                            style={{ maxHeight: "100px", objectFit: "cover" }}
                          />
                        )}
                      </div>
                    ))}
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

export default OrderModals;