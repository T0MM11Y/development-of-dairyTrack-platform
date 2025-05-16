import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Spinner,
  Alert,
} from "react-bootstrap";
import Swal from "sweetalert2";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { createOrder } from "../controllers/orderController";
import { getProductStocks } from "../controllers/productStockController";

const Order = () => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [order, setOrder] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    location: "",
    order_items: [],
    notes: "",
  });
  const [newItem, setNewItem] = useState({ product_type: "", quantity: "" });

  const primaryColor = "#E9A319"; // Consistent with Product component

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductStocks();
        if (!response.success) {
          throw new Error(response.message || "Failed to fetch products");
        }

        // Aggregate available products by product_type
        const groupedProducts = response.productStocks.reduce((acc, stock) => {
          if (stock.status === "available" && stock.product_type_detail) {
            const type = stock.product_type;
            if (!acc[type]) {
              acc[type] = {
                product_type: type,
                product_name: stock.product_type_detail.product_name,
                total_quantity: 0,
                image: stock.product_type_detail.image || "",
                price: parseFloat(stock.product_type_detail.price) || 0,
                unit: stock.product_type_detail.unit || "",
              };
            }
            acc[type].total_quantity += Number(stock.quantity) || 0;
          }
          return acc;
        }, {});

        const products = Object.values(groupedProducts);
        setAvailableProducts(products);
        setError("");
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Validate and normalize phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) return { isValid: true, normalizedPhone: "" }; // Phone number is optional
    const cleanedPhone = phone.trim();
    let normalizedPhone = cleanedPhone;

    // Normalize phone number
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
    return { isValid, normalizedPhone };
  };

  // Handle input changes for customer details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
    if (name === "phone_number") {
      const { isValid, normalizedPhone } = validatePhoneNumber(value);
      setPhoneError(
        isValid
          ? ""
          : "Phone number must be in the format +62 followed by 9-12 digits."
      );
      setOrder((prev) => ({ ...prev, phone_number: normalizedPhone }));
    }
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    const { isValid, normalizedPhone } = validatePhoneNumber(value);
    setOrder((prev) => ({ ...prev, phone_number: normalizedPhone }));
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
      setFormError("Please select a product and enter a quantity.");
      return;
    }

    const selectedProduct = availableProducts.find(
      (p) => p.product_type === parseInt(newItem.product_type)
    );

    if (!selectedProduct) {
      setFormError("Selected product not found.");
      return;
    }

    const requestedQuantity = parseInt(newItem.quantity);
    if (selectedProduct.total_quantity < requestedQuantity) {
      setFormError(
        `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity} ${selectedProduct.unit}`
      );
      return;
    }

    const existingItemIndex = order.order_items.findIndex(
      (item) => item.product_type === parseInt(newItem.product_type)
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...order.order_items];
      const newQuantity =
        updatedItems[existingItemIndex].quantity + requestedQuantity;
      if (selectedProduct.total_quantity < newQuantity) {
        setFormError(
          `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity} ${selectedProduct.unit}`
        );
        return;
      }
      updatedItems[existingItemIndex].quantity = newQuantity;
      setOrder((prev) => ({
        ...prev,
        order_items: updatedItems,
      }));
    } else {
      setOrder((prev) => ({
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
    setFormError("");
  };

  // Remove order item
  const removeOrderItem = (index) => {
    setOrder((prev) => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index),
    }));
  };

  // Increment item quantity
  const incrementItemQuantity = (index) => {
    const updatedItems = [...order.order_items];
    const currentItem = updatedItems[index];
    const selectedProduct = availableProducts.find(
      (p) => p.product_type === currentItem.product_type
    );

    if (currentItem.quantity + 1 > selectedProduct.total_quantity) {
      setFormError(
        `Insufficient stock for ${selectedProduct.product_name}. Available: ${selectedProduct.total_quantity} ${selectedProduct.unit}`
      );
      return;
    }

    updatedItems[index].quantity += 1;
    setOrder((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
    setFormError("");
  };

  // Decrement item quantity
  const decrementItemQuantity = (index) => {
    const updatedItems = [...order.order_items];
    if (updatedItems[index].quantity <= 1) {
      removeOrderItem(index);
      return;
    }
    updatedItems[index].quantity -= 1;
    setOrder((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate form
    if (!order.customer_name) {
      setFormError("Customer name is required.");
      return;
    }
    if (!order.location) {
      setFormError("Location is required.");
      return;
    }
    if (order.order_items.length === 0) {
      setFormError("Please add at least one order item.");
      return;
    }
    if (order.phone_number && phoneError) {
      setFormError("Please fix the phone number format.");
      return;
    }

    const orderData = {
      customer_name: order.customer_name,
      email: order.email || null,
      phone_number: order.phone_number || null,
      location: order.location,
      status: "Requested",
      payment_method: null, // No payment method
      shipping_cost: 0,
      order_items: order.order_items.map((item) => ({
        product_type: item.product_type,
        quantity: item.quantity,
      })),
      notes: order.notes || null,
    };

    try {
      const response = await createOrder(orderData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Order Placed Successfully!",
          html: `
            <p>Your order has been submitted.</p>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Location:</strong> ${order.location}</p>
            <p><strong>Items:</strong></p>
            <ul style="text-align: left;">
              ${order.order_items
                .map((item) => {
                  const product = availableProducts.find(
                    (p) => p.product_type === item.product_type
                  );
                  return `<li>${product?.product_name} - ${item.quantity} ${product?.unit}</li>`;
                })
                .join("")}
            </ul>
          `,
          showConfirmButton: true,
          confirmButtonText: "OK",
          confirmButtonColor: primaryColor,
        });
        // Reset form
        setOrder({
          customer_name: "",
          email: "",
          phone_number: "",
          location: "",
          order_items: [],
          notes: "",
        });
        setNewItem({ product_type: "", quantity: "" });
      } else {
        setFormError(response.message || "Failed to place order.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to place order.",
        });
      }
    } catch (err) {
      setFormError("An unexpected error occurred while placing the order.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "An unexpected error occurred while placing the order.",
      });
      console.error("Error placing order:", err);
    }
  };

  // Format currency
  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" variant="warning" />
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0 rounded">
        <Card.Header
          className="bg-gradient-primary text-grey py-3"
          style={{ background: primaryColor }}
        >
          <h4
            className="mb-0 text-white"
            style={{
              fontFamily: "Roboto, Monospace",
              letterSpacing: "1.4px",
              fontSize: "25px",
            }}
          >
            <i className="fas fa-shopping-cart me-2" /> Place Your Order
          </h4>
        </Card.Header>
        <Card.Body>
          {formError && (
            <Alert variant="danger" className="mb-4">
              {formError}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <h5 className="mb-3">Customer Details</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="customer_name"
                    value={order.customer_name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email (Optional)</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={order.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number (Optional)</Form.Label>
                  <PhoneInput
                    country={"id"}
                    value={order.phone_number}
                    onChange={handlePhoneChange}
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
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={order.location}
                    onChange={handleInputChange}
                    placeholder="Enter delivery address"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={order.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <h5 className="mb-3">Order Items</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Product Type</Form.Label>
                      <Form.Select
                        name="product_type"
                        value={newItem.product_type}
                        onChange={handleNewItemChange}
                        disabled={availableProducts.length === 0}
                      >
                        <option value="">Select product type</option>
                        {availableProducts.length === 0 ? (
                          <option disabled>No products available</option>
                        ) : (
                          availableProducts.map((product) => (
                            <option
                              key={product.product_type}
                              value={product.product_type}
                            >
                              {product.product_name} (Stock:{" "}
                              {product.total_quantity} {product.unit})
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
                        disabled={availableProducts.length === 0}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="primary"
                      className="w-100 mt-4"
                      onClick={addOrderItem}
                      disabled={availableProducts.length === 0}
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      }}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
                {order.order_items.length > 0 && (
                  <div className="mt-3">
                    <h6>Selected Items:</h6>
                    <ul className="list-group">
                      {order.order_items.map((item, index) => {
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
                              {product?.product_name || "Unknown"} -{" "}
                              {item.quantity} {product?.unit}
                              <br />
                              <small>
                                {formatRupiah(product?.price * item.quantity)}
                              </small>
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
                    <p className="mt-3">
                      <strong>Total Price:</strong>{" "}
                      {formatRupiah(
                        order.order_items.reduce((total, item) => {
                          const product = availableProducts.find(
                            (p) => p.product_type === item.product_type
                          );
                          return total + (product?.price || 0) * item.quantity;
                        }, 0)
                      )}
                    </p>
                  </div>
                )}
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={phoneError || formError}
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
              >
                Place Order
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Order;
