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
  Spinner, // Added Spinner import
} from "react-bootstrap";
import Swal from "sweetalert2";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
  availableProducts,
}) => {
  const [newItem, setNewItem] = useState({ product_type: "", quantity: "" });
  const [modalError, setModalError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added isSubmitting state

  // Log availableProducts and selectedOrder for debugging
  useEffect(() => {
    console.log("Available products in OrderModals:", availableProducts);
    console.log("Selected order in OrderModals:", selectedOrder);
  }, [availableProducts, selectedOrder]);

  // Validate order_items when edit modal opens
  useEffect(() => {
    if (showEditModal && selectedOrder) {
      const validItems = selectedOrder.order_items.filter((item) => {
        const product = availableProducts.find(
          (p) => p.product_type === item.product_type
        );
        if (!product) {
          console.warn(
            `Product type ${item.product_type} not found in available products`
          );
          return false;
        }
        if (product.total_quantity < item.quantity) {
          console.warn(
            `Insufficient stock for product type ${item.product_type}. Requested: ${item.quantity}, Available: ${product.total_quantity}`
          );
          return false;
        }
        return true;
      });

      if (validItems.length !== selectedOrder.order_items.length) {
        setSelectedOrder((prev) => ({
          ...prev,
          order_items: validItems,
        }));
        setModalError(
          "Some order items were removed due to insufficient stock or unavailability."
        );
      }
    }
  }, [showEditModal, selectedOrder, availableProducts]);

  // Validate and normalize phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) return { isValid: true, normalizedPhone: "" }; // Phone number is optional
    const cleanedPhone = phone.trim();
    console.log("Validating phone number:", cleanedPhone);

    let normalizedPhone = cleanedPhone;
    while (normalizedPhone.startsWith("+6262")) {
      normalizedPhone = `+62${normalizedPhone.slice(4)}`;
    }

    if (normalizedPhone.startsWith("62")) {
      normalizedPhone = `+${normalizedPhone}`;
    }

    if (
      !normalizedPhone.startsWith("+62") &&
      !normalizedPhone.startsWith("+")
    ) {
      normalizedPhone = `+62${normalizedPhone}`;
    }

    const phoneRegex = /^\+62[0-9]{9,12}$/;
    const isValid = phoneRegex.test(normalizedPhone);
    console.log("Normalized phone number:", normalizedPhone);
    console.log("Phone number validation result:", isValid);
    return { isValid, normalizedPhone };
  };

  // Handle input change for add modal
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
    if (name === "phone_number") {
      const { isValid, normalizedPhone } = validatePhoneNumber(value);
      setPhoneError(
        isValid
          ? ""
          : "Phone number must be in the format +62 followed by 9-12 digits."
      );
      setNewOrder((prev) => ({ ...prev, phone_number: normalizedPhone }));
    }
  };

  // Handle phone number change for add modal
  const handleAddPhoneChange = (value) => {
    console.log("PhoneInput value (add):", value);
    const { isValid, normalizedPhone } = validatePhoneNumber(value);
    setNewOrder((prev) => ({ ...prev, phone_number: normalizedPhone }));
    setPhoneError(
      isValid
        ? ""
        : "Phone number must be in the format +62 followed by 9-12 digits."
    );
  };

  // Handle input change for edit modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedOrder((prev) => ({ ...prev, [name]: value }));
    if (name === "phone_number") {
      const { isValid, normalizedPhone } = validatePhoneNumber(value);
      setPhoneError(
        isValid
          ? ""
          : "Phone number must be in the format +62 followed by 9-12 digits."
      );
      setSelectedOrder((prev) => ({ ...prev, phone_number: normalizedPhone }));
    }
  };

  // Handle phone number change for edit modal
  const handleEditPhoneChange = (value) => {
    console.log("PhoneInput value (edit):", value);
    const { isValid, normalizedPhone } = validatePhoneNumber(value);
    setSelectedOrder((prev) => ({ ...prev, phone_number: normalizedPhone }));
    setPhoneError(
      isValid
        ? ""
        : "Phone number must be in the format +62 followed by 9-12 digits."
    );
  };

  // Handle new item change
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // Add order item
  const addOrderItem = () => {
    if (!newItem.product_type || !newItem.quantity) {
      setModalError("Please select a product and enter a quantity.");
      return;
    }

    const selectedProduct = availableProducts.find(
      (p) => p.product_type === parseInt(newItem.product_type)
    );

    if (!selectedProduct) {
      setModalError("Selected product not found.");
      return;
    }

    const requestedQuantity = parseInt(newItem.quantity);
    if (selectedProduct.total_quantity < requestedQuantity) {
      setModalError(
        `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity}`
      );
      return;
    }

    const existingItemIndex = newOrder.order_items.findIndex(
      (item) => item.product_type === parseInt(newItem.product_type)
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...newOrder.order_items];
      const newQuantity =
        updatedItems[existingItemIndex].quantity + requestedQuantity;
      if (selectedProduct.total_quantity < newQuantity) {
        setModalError(
          `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity}`
        );
        return;
      }
      updatedItems[existingItemIndex].quantity = newQuantity;
      setNewOrder((prev) => ({
        ...prev,
        order_items: updatedItems,
      }));
    } else {
      setNewOrder((prev) => ({
        ...prev,
        order_items: [
          ...prev.order_items,
          {
            product_type: parseInt(newItem.product_type),
            quantity: requestedQuantity,
          },
        ],
      }));
    }

    setNewItem({ product_type: "", quantity: "" });
    setModalError("");
  };

  // Remove order item
  const removeOrderItem = (index) => {
    setNewOrder((prev) => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index),
    }));
  };

  // Increment item quantity
  const incrementItemQuantity = (index) => {
    const updatedItems = [...newOrder.order_items];
    const currentItem = updatedItems[index];
    const selectedProduct = availableProducts.find(
      (p) => p.product_type === currentItem.product_type
    );

    if (currentItem.quantity + 1 > selectedProduct.total_quantity) {
      setModalError(
        `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity}`
      );
      return;
    }

    updatedItems[index].quantity += 1;
    setNewOrder((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
    setModalError("");
  };

  // Decrement item quantity
  const decrementItemQuantity = (index) => {
    const updatedItems = [...newOrder.order_items];
    if (updatedItems[index].quantity <= 1) {
      removeOrderItem(index);
      return;
    }
    updatedItems[index].quantity -= 1;
    setNewOrder((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
  };

  // Add order item for edit modal
  const addEditOrderItem = () => {
    if (!newItem.product_type || !newItem.quantity) {
      setModalError("Please select a product and enter a quantity.");
      return;
    }

    const selectedProduct = availableProducts.find(
      (p) => p.product_type === parseInt(newItem.product_type)
    );

    if (!selectedProduct) {
      setModalError("Selected product not found.");
      return;
    }

    const requestedQuantity = parseInt(newItem.quantity);
    if (selectedProduct.total_quantity < requestedQuantity) {
      setModalError(
        `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity}`
      );
      return;
    }

    const existingItemIndex = selectedOrder.order_items.findIndex(
      (item) => item.product_type === parseInt(newItem.product_type)
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedOrder.order_items];
      const newQuantity =
        updatedItems[existingItemIndex].quantity + requestedQuantity;
      if (selectedProduct.total_quantity < newQuantity) {
        setModalError(
          `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity}`
        );
        return;
      }
      updatedItems[existingItemIndex].quantity = newQuantity;
      setSelectedOrder((prev) => ({
        ...prev,
        order_items: updatedItems,
      }));
    } else {
      setSelectedOrder((prev) => ({
        ...prev,
        order_items: [
          ...prev.order_items,
          {
            product_type: parseInt(newItem.product_type),
            quantity: requestedQuantity,
          },
        ],
      }));
    }

    setNewItem({ product_type: "", quantity: "" });
    setModalError("");
  };

  // Remove order item for edit modal
  const removeEditOrderItem = (index) => {
    setSelectedOrder((prev) => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index),
    }));
  };

  // Increment item quantity for edit modal
  const incrementEditItemQuantity = (index) => {
    const updatedItems = [...selectedOrder.order_items];
    const currentItem = updatedItems[index];
    const selectedProduct = availableProducts.find(
      (p) => p.product_type === currentItem.product_type
    );

    if (!selectedProduct) {
      setModalError("Selected product is no longer available.");
      return;
    }

    if (currentItem.quantity + 1 > selectedProduct.total_quantity) {
      setModalError(
        `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity}`
      );
      return;
    }

    updatedItems[index].quantity += 1;
    setSelectedOrder((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
    setModalError("");
  };

  // Decrement item quantity for edit modal
  const decrementEditItemQuantity = (index) => {
    const updatedItems = [...selectedOrder.order_items];
    if (updatedItems[index].quantity <= 1) {
      removeEditOrderItem(index);
      return;
    }
    updatedItems[index].quantity -= 1;
    setSelectedOrder((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
  };

  // Reset form when closing modal
  const handleCloseAddModal = () => {
    setNewOrder({
      customer_name: "",
      email: "",
      phone_number: "",
      location: "",
      status: "Requested",
      payment_method: "",
      shipping_cost: "",
      order_items: [],
      notes: "",
    });
    setNewItem({ product_type: "", quantity: "" });
    setModalError("");
    setPhoneError("");
    setShowAddModal(false);
    setIsSubmitting(false); // Reset loading state
  };

  const handleCloseEditModal = () => {
    setSelectedOrder(null);
    setNewItem({ product_type: "", quantity: "" });
    setModalError("");
    setPhoneError("");
    setShowEditModal(false);
    setIsSubmitting(false); // Reset loading state
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

  // Modified handleAddSubmit to manage loading state
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state
    try {
      if (newOrder.order_items.length === 0) {
        setModalError("Please add at least one order item.");
        return;
      }

      const { isValid, normalizedPhone } = validatePhoneNumber(
        newOrder.phone_number
      );
      if (newOrder.phone_number && !isValid) {
        setPhoneError(
          "Phone number must be in the format +62 followed by 9-12 digits."
        );
        return;
      }

      const orderData = {
        customer_name: newOrder.customer_name,
        email: newOrder.email || null,
        phone_number: normalizedPhone || null,
        location: newOrder.location,
        status: newOrder.status,
        payment_method: newOrder.payment_method || null,
        shipping_cost: newOrder.shipping_cost
          ? parseFloat(newOrder.shipping_cost)
          : 0,
        order_items: newOrder.order_items.map((item) => ({
          product_type: item.product_type,
          quantity: item.quantity,
        })),
        notes: newOrder.notes || null,
      };

      console.log("Submitting add order:", orderData);
      await handleAddOrder(e, orderData);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Modified handleEditSubmit to manage loading state
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state
    try {
      if (selectedOrder.order_items.length === 0) {
        setModalError("Please add at least one order item.");
        return;
      }

      const { isValid, normalizedPhone } = validatePhoneNumber(
        selectedOrder.phone_number
      );
      if (selectedOrder.phone_number && !isValid) {
        setPhoneError(
          "Phone number must be in the format +62 followed by 9-12 digits."
        );
        return;
      }

      const invalidItems = selectedOrder.order_items.filter((item) => {
        const product = availableProducts.find(
          (p) => p.product_type === item.product_type
        );
        return !product || product.total_quantity < item.quantity;
      });

      if (invalidItems.length > 0) {
        setModalError(
          "Some order items are invalid or have insufficient stock. Please remove or adjust."
        );
        return;
      }

      const orderData = {
        customer_name: selectedOrder.customer_name,
        email: selectedOrder.email || null,
        phone_number: normalizedPhone || null,
        location: selectedOrder.location,
        status: selectedOrder.status,
        payment_method: selectedOrder.payment_method || null,
        shipping_cost: selectedOrder.shipping_cost
          ? parseFloat(selectedOrder.shipping_cost)
          : 0,
        order_items: selectedOrder.order_items.map((item) => ({
          product_type: item.product_type,
          quantity: item.quantity,
        })),
        notes: selectedOrder.notes || null,
      };

      console.log("Submitting edit order:", orderData);
      await handleEditOrder(e, orderData);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <>
      {/* Add Order Modal */}
      <Modal
        show={showAddModal}
        onHide={handleCloseAddModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Order
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            {modalError && (
              <div className="alert alert-danger">{modalError}</div>
            )}
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
                  <PhoneInput
                    country={"id"}
                    value={newOrder.phone_number}
                    onChange={handleAddPhoneChange}
                    placeholder="Enter phone number"
                    inputProps={{
                      name: "phone_number",
                      className: "form-control",
                    }}
                  />
                  {phoneError && (
                    <Form.Text className="text-danger">{phoneError}</Form.Text>
                  )}
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
                <Form.Group className="mb-3">
                  <Form.Label>Shipping Cost (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    name="shipping_cost"
                    value={newOrder.shipping_cost}
                    onChange={handleAddInputChange}
                    placeholder="Enter shipping cost"
                    min="0"
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
                    <option value="Processed">Processed</option>
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
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product Type</Form.Label>
                  <Form.Select
                    name="product_type"
                    value={newItem.product_type}
                    onChange={handleNewItemChange}
                    disabled={isLoadingProducts}
                  >
                    <option value="">Select product type</option>
                    {isLoadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : availableProducts.length === 0 ? (
                      <option disabled>No products available</option>
                    ) : (
                      availableProducts.map((product) => (
                        <option
                          key={product.product_type}
                          value={product.product_type}
                        >
                          {product.product_name} (Stock:{" "}
                          {product.total_quantity})
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                    placeholder="Enter quantity"
                    min="1"
                    disabled={isLoadingProducts}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  variant="primary"
                  className="w-100 mt-4"
                  onClick={addOrderItem}
                  disabled={isLoadingProducts}
                >
                  Add
                </Button>
              </Col>
            </Row>
            {newOrder.order_items.length > 0 && (
              <div className="mt-3">
                <h6>Order Items:</h6>
                <ul className="list-group">
                  {newOrder.order_items.map((item, index) => {
                    const product = availableProducts.find(
                      (p) => p.product_type === item.product_type
                    );
                    return (
                      <li
                        key={index}
                        className="list-group-item d-flex align-items-center"
                      >
                        {product?.image && (
                          <Image
                            src={product.image}
                            alt={product.product_name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              marginRight: "15px",
                              borderRadius: "5px",
                            }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/50";
                            }}
                          />
                        )}
                        <div className="flex-grow-1">
                          {product?.product_name || "Unknown"}
                        </div>
                        <div className="d-flex align-items-center me-3">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => decrementItemQuantity(index)}
                          >
                            -
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => incrementItemQuantity(index)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseAddModal}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || isLoadingProducts || phoneError}
            >
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

      {/* Edit Order Modal */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Order
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {modalError && (
              <div className="alert alert-danger">{modalError}</div>
            )}
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
                    <PhoneInput
                      country={"id"}
                      value={selectedOrder.phone_number}
                      onChange={handleEditPhoneChange}
                      placeholder="Enter phone number"
                      inputProps={{
                        name: "phone_number",
                        className: "form-control",
                      }}
                    />
                    {phoneError && (
                      <Form.Text className="text-danger">
                        {phoneError}
                      </Form.Text>
                    )}
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
                  <Form.Group className="mb-3">
                    <Form.Label>Shipping Cost (Optional)</Form.Label>
                    <Form.Control
                      type="number"
                      name="shipping_cost"
                      value={selectedOrder.shipping_cost}
                      onChange={handleEditInputChange}
                      placeholder="Enter shipping cost"
                      min="0"
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
                      <option value="Processed">Processed</option>
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
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Product Type</Form.Label>
                      <Form.Select
                        name="product_type"
                        value={newItem.product_type}
                        onChange={handleNewItemChange}
                        disabled={isLoadingProducts}
                      >
                        <option value="">Select product type</option>
                        {isLoadingProducts ? (
                          <option disabled>Loading products...</option>
                        ) : availableProducts.length === 0 ? (
                          <option disabled>No products available</option>
                        ) : (
                          availableProducts.map((product) => (
                            <option
                              key={product.product_type}
                              value={product.product_type}
                            >
                              {product.product_name} (Stock:{" "}
                              {product.total_quantity})
                            </option>
                          ))
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={newItem.quantity}
                        onChange={handleNewItemChange}
                        placeholder="Enter quantity"
                        min="1"
                        disabled={isLoadingProducts}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="primary"
                      className="w-100 mt-4"
                      onClick={addEditOrderItem}
                      disabled={isLoadingProducts}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
                {selectedOrder.order_items.length > 0 && (
                  <div className="mt-3">
                    <h6>Order Items:</h6>
                    <ul className="list-group">
                      {selectedOrder.order_items.map((item, index) => {
                        const product = availableProducts.find(
                          (p) => p.product_type === item.product_type
                        );
                        return (
                          <li
                            key={index}
                            className="list-group-item d-flex align-items-center"
                          >
                            {product?.image && (
                              <Image
                                src={product.image}
                                alt={product.product_name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "15px",
                                  borderRadius: "5px",
                                }}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/50";
                                }}
                              />
                            )}
                            <div className="flex-grow-1">
                              {product?.product_name || "Unknown"}
                            </div>
                            <div className="d-flex align-items-center me-3">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => decrementEditItemQuantity(index)}
                              >
                                -
                              </Button>
                              <span className="mx-2">{item.quantity}</span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => incrementEditItemQuantity(index)}
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeEditOrderItem(index)}
                            >
                              Remove
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
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
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || isLoadingProducts || phoneError}
            >
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

      {/* View Order Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
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
                      <strong>Customer Name:</strong>{" "}
                      {selectedOrder.customer_name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone Number:</strong>{" "}
                      {selectedOrder.phone_number || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedOrder.location || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge
                        bg={
                          selectedOrder.status === "Requested"
                            ? "warning"
                            : selectedOrder.status === "Processed"
                            ? "info"
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
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.payment_method || "N/A"}
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
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "en-US"
                      )}
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
