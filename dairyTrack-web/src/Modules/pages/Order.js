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
import { motion, AnimatePresence } from "framer-motion";

const Order = () => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading
  const [order, setOrder] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    location: "",
    order_items: [],
    notes: "",
  });
  const [newItem, setNewItem] = useState({ product_type: "", quantity: "" });

  // Theme configuration
  const theme = {
    primary: "#E9A319",
    secondary: "#3D8D7A",
    accent: "#F15A29",
    light: "#F8F9FA",
    dark: "#212529",
    gradients: {
      primary: "linear-gradient(135deg, #E9A319 0%, #F4B942 100%)",
      secondary: "linear-gradient(135deg, #3D8D7A 0%, #4AA391 100%)",
      hero: "linear-gradient(135deg, rgba(61, 141, 122, 0.93), rgba(61, 141, 122, 0.7))",
      card: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    },
    shadows: {
      card: "0 10px 40px rgba(0, 0, 0, 0.1)",
      hover: "0 20px 60px rgba(0, 0, 0, 0.15)",
      glow: "0 0 30px rgba(233, 163, 25, 0.3)",
    },
  };

  // Animation variants
  const animations = {
    fadeInUp: {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 },
      },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    },
    slideInRight: {
      hidden: { opacity: 0, x: 50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },
  };

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductStocks();
        if (!response.success) {
          throw new Error(response.message || "Failed to fetch products");
        }

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
    if (!phone) return { isValid: true, normalizedPhone: "" };
    const cleanedPhone = phone.trim();
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
    return { isValid, normalizedPhone };
  };

  // Handle input changes
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
    setIsSubmitting(true); // Start loading

    if (!order.customer_name) {
      setFormError("Customer name is required.");
      setIsSubmitting(false); // Stop loading
      return;
    }
    if (!order.location) {
      setFormError("Location is required.");
      setIsSubmitting(false); // Stop loading
      return;
    }
    if (order.order_items.length === 0) {
      setFormError("Please add at least one order item.");
      setIsSubmitting(false); // Stop loading
      return;
    }
    if (order.phone_number && phoneError) {
      setFormError("Please fix the phone number format.");
      setIsSubmitting(false); // Stop loading
      return;
    }

    const orderData = {
      customer_name: order.customer_name,
      email: order.email || null,
      phone_number: order.phone_number || null,
      location: order.location,
      status: "Requested",
      payment_method: null,
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
          confirmButtonColor: theme.primary,
        });
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
    } finally {
      setIsSubmitting(false); // Stop loading
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
      <div
        className="loading-screen"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="loading-content"
        >
          <img
            src={require("../../assets/loading.gif")}
            style={{
              display: "block",
              maxWidth: "30vw",
              maxHeight: "30vh",
              width: "auto",
              height: "auto",
              margin: "0 auto 1rem",
            }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="loading-text"
          ></motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="error-container"
        >
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <Button
            variant="warning"
            onClick={() => window.location.reload()}
            style={{ background: theme.primary, borderColor: theme.primary }}
          >
            Try Again
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="modern-order">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="particles-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`particle particle-${i % 3}`}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <Container className="hero-content">
            <Row className="align-items-center min-vh-50">
              <Col lg={8}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.fadeInUp}
                  className="hero-text"
                >
                  <div className="hero-badge">
                    <i className="fas fa-shopping-cart me-2"></i>
                    Order Now
                  </div>
                  <h1 className="hero-title">
                    Place Your <span className="gradient-text">Order</span>
                  </h1>
                  <div className="title-divider"></div>
                  <p className="hero-description">
                    Fill out the form below to order Dairy~Track's premium dairy
                    and healthy food products. We ensure top-quality service and
                    prompt processing of your orders.
                  </p>
                  <div className="hero-stats">
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">
                        {availableProducts.length}
                      </div>
                      <div className="stat-label">Products</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">
                        {availableProducts.reduce(
                          (sum, p) => sum + p.total_quantity,
                          0
                        )}
                      </div>
                      <div className="stat-label">Stock</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Support</div>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
              <Col lg={4} className="d-none d-lg-block">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  className="hero-visual"
                >
                  <div className="hero-icon-container">
                    <motion.div
                      className="hero-icon-circle"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="icon-glow"></div>
                      <i className="fas fa-clipboard-list"></i>
                    </motion.div>
                    <motion.div
                      className="floating-element element-1"
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <i className="fas fa-cheese"></i>
                    </motion.div>
                    <motion.div
                      className="floating-element element-2"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <i className="fas fa-leaf"></i>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Order Form Section */}
      <Container className="order-form-section">
        <motion.div
          variants={animations.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Card className="order-card">
            <div className="card-header">
              <motion.h4 variants={animations.fadeInUp} className="card-title">
                <i className="fas fa-shopping-cart me-2" />
                Place Your Order
              </motion.h4>
            </div>
            <Card.Body>
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert variant="danger" className="form-alert">
                      {formError}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col lg={6}>
                    <motion.div
                      variants={animations.fadeInUp}
                      className="section-title"
                    >
                      <h5>Customer Details</h5>
                    </motion.div>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name *</Form.Label>
                      <motion.div
                        variants={animations.scaleIn}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <Form.Control
                          type="text"
                          name="customer_name"
                          value={order.customer_name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          required
                          className="form-input"
                        />
                      </motion.div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email (Optional)</Form.Label>
                      <motion.div
                        variants={animations.scaleIn}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <Form.Control
                          type="email"
                          name="email"
                          value={order.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="form-input"
                        />
                      </motion.div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number (Optional)</Form.Label>
                      <motion.div
                        variants={animations.scaleIn}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <PhoneInput
                          country={"id"}
                          value={order.phone_number}
                          onChange={handlePhoneChange}
                          placeholder="Enter phone number"
                          inputProps={{
                            name: "phone_number",
                            className: "form-control form-input phone-input",
                          }}
                        />
                        {phoneError && (
                          <Form.Text className="text-danger">
                            {phoneError}
                          </Form.Text>
                        )}
                      </motion.div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Location *</Form.Label>
                      <motion.div
                        variants={animations.scaleIn}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <Form.Control
                          type="text"
                          name="location"
                          value={order.location}
                          onChange={handleInputChange}
                          placeholder="Enter delivery address"
                          required
                          className="form-input"
                        />
                      </motion.div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Notes (Optional)</Form.Label>
                      <motion.div
                        variants={animations.scaleIn}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="notes"
                          value={order.notes}
                          onChange={handleInputChange}
                          placeholder="Enter any additional notes"
                          className="form-input"
                        />
                      </motion.div>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <motion.div
                      variants={animations.fadeInUp}
                      className="section-title"
                    >
                      <h5>Order Items</h5>
                    </motion.div>
                    <Row className="mb-3 align-items-end">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Product Type</Form.Label>
                          <motion.div
                            variants={animations.scaleIn}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <Form.Select
                              name="product_type"
                              value={newItem.product_type}
                              onChange={handleNewItemChange}
                              disabled={availableProducts.length === 0}
                              className="form-input"
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
                          </motion.div>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Quantity</Form.Label>
                          <motion.div
                            variants={animations.scaleIn}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <Form.Control
                              type="number"
                              name="quantity"
                              value={newItem.quantity}
                              onChange={handleNewItemChange}
                              placeholder="Enter quantity"
                              min="1"
                              disabled={availableProducts.length === 0}
                              className="form-input"
                            />
                          </motion.div>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-flex align-items-end">
                        <motion.div
                          variants={animations.scaleIn}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-100"
                        >
                          <Button
                            variant="primary"
                            className="w-100 action-btn add-order-btn"
                            onClick={addOrderItem}
                            disabled={availableProducts.length === 0}
                          >
                            +
                          </Button>
                        </motion.div>
                      </Col>
                    </Row>
                    {order.order_items.length > 0 && (
                      <motion.div
                        variants={animations.staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="order-items"
                      >
                        <h6>Selected Items:</h6>
                        <ul className="order-items-list">
                          {order.order_items.map((item, index) => {
                            const product = availableProducts.find(
                              (p) => p.product_type === item.product_type
                            );
                            return (
                              <motion.li
                                key={index}
                                variants={animations.scaleIn}
                                className="order-item"
                                whileHover={{ y: -5 }}
                              >
                                {product?.image && (
                                  <Image
                                    src={product.image}
                                    alt={product.product_name}
                                    className="item-image"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/50";
                                    }}
                                  />
                                )}
                                <div className="item-details">
                                  {product?.product_name || "Unknown"} -{" "}
                                  {item.quantity} {product?.unit}
                                  <div className="item-price">
                                    {formatRupiah(
                                      product?.price * item.quantity
                                    )}
                                  </div>
                                </div>
                                <div className="item-actions">
                                  <motion.div
                                    className="quantity-controls"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() =>
                                        decrementItemQuantity(index)
                                      }
                                      className="quantity-btn"
                                    >
                                      -
                                    </Button>
                                    <span className="quantity">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() =>
                                        incrementItemQuantity(index)
                                      }
                                      className="quantity-btn"
                                    >
                                      +
                                    </Button>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => removeOrderItem(index)}
                                      className="remove-btn"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </motion.div>
                                </div>
                              </motion.li>
                            );
                          })}
                        </ul>
                        <motion.div
                          variants={animations.fadeInUp}
                          className="total-price"
                        >
                          <strong>Total Price:</strong>{" "}
                          {formatRupiah(
                            order.order_items.reduce((total, item) => {
                              const product = availableProducts.find(
                                (p) => p.product_type === item.product_type
                              );
                              return (
                                total + (product?.price || 0) * item.quantity
                              );
                            }, 0)
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </Col>
                </Row>
                <motion.div
                  variants={animations.fadeInUp}
                  className="form-actions"
                >
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={phoneError || formError || isSubmitting}
                    className="action-btn-large"
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
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </motion.div>
              </Form>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-order {
          font-family: "Inter", sans-serif;
          overflow-x: hidden;
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: ${theme.gradients.hero};
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
        }

        .spinner-ring {
          position: absolute;
          border: 3px solid transparent;
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
        }

        .spinner-ring:nth-child(1) {
          width: 80px;
          height: 80px;
        }
        .spinner-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          animation-delay: -0.4s;
        }
        .spinner-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          animation-delay: -0.8s;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          font-size: 1.2rem;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          overflow: hidden;
        }

        .hero-background {
          background: ${theme.gradients.hero},
            url(${require("../../assets/about.png")}) no-repeat center;
          background-size: cover;
          min-height: 50vh;
          position: relative;
        }

        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }

        .particle-0 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
        }
        .particle-1 {
          width: 6px;
          height: 6px;
          top: 40%;
          left: 80%;
        }
        .particle-2 {
          width: 3px;
          height: 3px;
          top: 70%;
          left: 30%;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          color: white;
          padding: 6rem 0;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: ${theme.gradients.primary};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-divider {
          width: 80px;
          height: 4px;
          background: ${theme.gradients.primary};
          margin-bottom: 1.5rem;
          border-radius: 2px;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 600px;
          opacity: 0.95;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .stat-number {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: ${theme.primary};
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-icon-container {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .hero-icon-circle {
          width: 180px;
          height: 180px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-icon-circle i {
          font-size: 4rem;
          color: white;
          z-index: 2;
        }

        .icon-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(233, 163, 25, 0.3) 0%,
            transparent 70%
          );
        }

        .floating-element {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          backdrop-filter: blur(10px);
        }

        .element-1 {
          top: 20%;
          right: 10%;
        }
        .element-2 {
          bottom: 20%;
          left: 10%;
        }

        /* Order Form Section */
        .order-form-section {
          padding: 80px 0;
          background: ${theme.light};
        }

        .order-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
          transition: all 0.4s ease;
        }

        .order-card:hover {
          background-color: ${theme.shadows.light};
        }

        .card-header {
          background: ${theme.gradients.secondary};
          color: white;
          padding: 1.5rem;
          border-bottom: none;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0;
        }

        .section-title {
          margin-bottom: 2rem;
          color: ${theme.dark};
          font-weight: 600;
        }

        .form-alert {
          border-radius: 8px;
          padding: 1rem;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .order-form-section .form-input {
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .order-form-section .form-input:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 0.2rem rgba(233, 163, 25, 0.25);
        }

        .order-form-section .phone-input {
          width: 100%;
          padding-left: 3.5rem;
        }

        .action-btn {
          background: ${theme.gradients.primary};
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          box-shadow: ${theme.shadows.glow};
        }

        .action-btn:disabled {
          background: #e2e8f0;
          cursor: not-allowed;
        }

        .order-items {
          margin-top: 1.5rem;
        }

        .order-items-list {
          list-style: none;
          padding: 0;
        }

        .order-item {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          padding: 12px;
          margin-bottom: 0.75rem;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .order-item:hover {
          box-shadow: ${theme.shadows.card};
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 1rem;
        }

        .item-details {
          flex-grow: 1;
          font-size: 0.95rem;
        }

        .item-price {
          color: ${theme.primary};
          font-weight: 600;
          font-size: 0.9rem;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-btn {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .quantity-btn:hover {
          background: ${theme.primary};
          color: white;
          border-color: ${theme.primary};
        }

        .quantity {
          font-weight: 600;
          min-width: 30px;
          text-align: center;
        }

        .remove-btn {
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
        }
        .remove-btn:hover {
          background: #c82333;
          border-color: #bd2130;
        }

        .total-price {
          margin-top: 1.5rem;
          font-size: 1.1rem;
          color: ${theme.dark};
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 3rem;
        }

        .action-btn-large {
          background: ${theme.gradients.primary};
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn-large:hover {
          box-shadow: ${theme.shadows.glow};
        }

        .action-btn-large:disabled {
          background: #e2e8f0;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .hero-content {
            padding: 4rem 0;
          }

          .hero-stats {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }

          .stat-item {
            min-width: 120px;
            padding: 0.75rem 1rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .order-form-section {
            padding: 60px 0;
          }

          .order-item {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .item-actions {
            flex-shrink: 0;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-content {
            padding: 3rem 0;
          }

          .order-card {
            margin: 0 1rem;
          }

          .section-title {
            font-size: 1.3rem;
          }

          .form-actions {
            justify-content: center;
          }

          .action-btn-large {
            width: 100%;
            justify-content: center;
          }

          .item-image {
            width: 50px;
            height: 50px;
          }

          .item-details {
            font-size: 0.9rem;
          }

          .item-actions {
            flex-direction: row;
            gap: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .hero-content {
            text-align: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .order-item {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }

          .item-image {
            margin-bottom: 0.5rem;
          }

          .item-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .quantity-controls {
            gap: 0.25rem;
          }

          .quantity-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default Order;
