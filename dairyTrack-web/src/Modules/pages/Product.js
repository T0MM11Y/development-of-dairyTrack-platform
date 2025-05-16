import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Modal,
  Pagination,
} from "react-bootstrap";
import { format } from "date-fns";
import { Link } from "react-router-dom"; // Import Link
import { getProductStocks } from "../../Modules/controllers/productStockController";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const productsPerPage = 6;

  const primaryColor = "#E9A319";
  const greyColor = "#6c757d";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProductStocks();
        if (response.success) {
          const availableProducts = response.productStocks.filter(
            (product) => product.status === "available"
          );
          setProducts(availableProducts);
        } else {
          throw new Error(response.message || "Failed to fetch products");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenDetail = (productType) => {
    setSelectedProductType(productType);
    setShowDetailModal(true);
  };

  const groupedProducts = useMemo(() => {
    const grouped = {};
    products.forEach((product) => {
      const typeId = product.product_type;
      if (!grouped[typeId]) {
        grouped[typeId] = {
          product_type_detail: product.product_type_detail,
          quantity: 0,
          items: [],
        };
      }
      grouped[typeId].quantity += product.quantity;
      grouped[typeId].items.push(product);
    });
    return Object.values(grouped);
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = groupedProducts.filter((group) => {
      const matchesSearch = group.product_type_detail.product_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        const aLatest = Math.max(
          ...a.items.map((item) => new Date(item.production_at))
        );
        const bLatest = Math.max(
          ...b.items.map((item) => new Date(item.production_at))
        );
        return bLatest - aLatest;
      } else if (sortBy === "oldest") {
        const aEarliest = Math.min(
          ...a.items.map((item) => new Date(item.production_at))
        );
        const bEarliest = Math.min(
          ...b.items.map((item) => new Date(item.production_at))
        );
        return aEarliest - bEarliest;
      } else if (sortBy === "alphabetical") {
        return a.product_type_detail.product_name.localeCompare(
          b.product_type_detail.product_name
        );
      } else if (sortBy === "price") {
        return (
          parseFloat(a.product_type_detail.price) -
          parseFloat(b.product_type_detail.price)
        );
      }
      return 0;
    });
  }, [groupedProducts, searchTerm, sortBy]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + productsPerPage
    );
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / productsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("product-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(parseFloat(price));
  };

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <div
        className="text-white py-5"
        style={{
          background: greyColor,
          padding: "60px 0",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8} className="text-md-start text-center">
              <h1
                className="display-4 fw-bold mb-2"
                style={{
                  fontFamily: "Roboto, monospace",
                  letterSpacing: "1.5px",
                  fontSize: "40px",
                  fontWeight: "600",
                }}
              >
                Our Products
              </h1>
              <p className="lead mb-4">
                <i className="fas fa-cheese me-2"></i>
                Discover a variety of high-quality dairy products, crafted with
                love and dedication for your satisfaction.
              </p>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <div className="text-end">
                <i className="fas fa-shopping-cart fa-5x"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5" id="product-section">
        <Row>
          <Col lg={12}>
            <Row className="mb-4">
              <Col lg={4} md={6} className="mb-3">
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <i className="fas fa-search text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col lg={4} md={6} className="mb-3">
                <Form.Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="price">Price (Low to High)</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-4">
              {currentProducts.length > 0 ? (
                currentProducts.map((group) => (
                  <Col lg={4} md={6} key={group.product_type_detail.id}>
                    <Card
                      className="h-100 shadow-sm hover-shadow"
                      style={{ borderRadius: "8px", overflow: "hidden" }}
                    >
                      <div style={{ height: "200px", overflow: "hidden" }}>
                        <Card.Img
                          variant="top"
                          src={group.product_type_detail.image}
                          alt={group.product_type_detail.product_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          className="hover-zoom"
                        />
                      </div>
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                          <Badge pill bg="success">
                            Available
                          </Badge>
                          <Badge pill bg="info">
                            {group.quantity} {group.product_type_detail.unit}
                          </Badge>
                        </div>
                        <Card.Title className="mb-2 h5">
                          {group.product_type_detail.product_name}
                        </Card.Title>
                        <Card.Text className="text-muted small">
                          {truncateText(
                            group.product_type_detail.product_description,
                            100
                          )}
                        </Card.Text>
                        <div className="mb-2">
                          <strong>
                            {formatPrice(group.product_type_detail.price)}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleOpenDetail(group)}
                            style={{
                              color: primaryColor,
                              borderColor: primaryColor,
                            }}
                            className="read-more-btn"
                          >
                            View Details
                          </Button>
                          <Link
                            to={`/order`}
                            className="btn btn-warning btn-sm"
                            style={{
                              backgroundColor: primaryColor,
                              borderColor: primaryColor,
                              color: "white",
                            }}
                          >
                            Order
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12} className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h4>No products found</h4>
                  <p className="text-muted">Try changing your search</p>
                  <Button
                    variant="warning"
                    onClick={() => {
                      setSearchTerm("");
                    }}
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
                  >
                    Clear Search
                  </Button>
                </Col>
              )}
            </Row>

            {filteredAndSortedProducts.length > 0 && (
              <Row className="mt-5">
                <Col className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.First
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                    />
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                            style={
                              pageNum === currentPage
                                ? {
                                    backgroundColor: primaryColor,
                                    borderColor: primaryColor,
                                  }
                                : {}
                            }
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === totalPages - 1 &&
                          currentPage < totalPages - 2)
                      ) {
                        return (
                          <Pagination.Ellipsis key={`ellipsis-${pageNum}`} />
                        );
                      } else {
                        return null;
                      }
                    })}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                    <Pagination.Last
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                    />
                  </Pagination>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProductType?.product_type_detail.product_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProductType && (
            <>
              <div className="text-center mb-4">
                <img
                  src={selectedProductType.product_type_detail.image}
                  alt={selectedProductType.product_type_detail.product_name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                  className="shadow-sm"
                />
              </div>
              <div className="mb-3">
                <strong>Price:</strong>{" "}
                {formatPrice(selectedProductType.product_type_detail.price)}
              </div>
              <div className="mb-3">
                <strong>Description:</strong>{" "}
                {selectedProductType.product_type_detail.product_description}
              </div>
              <div className="mb-3">
                <strong>Total Stock:</strong> {selectedProductType.quantity}{" "}
                {selectedProductType.product_type_detail.unit}
              </div>
              <div className="mb-3">
                <strong>Status:</strong>{" "}
                <Badge pill bg="success">
                  Available
                </Badge>
              </div>
              <h5>Stock Details</h5>
              <ul>
                {selectedProductType.items
                  .sort(
                    (a, b) =>
                      new Date(a.production_at) - new Date(b.production_at)
                  )
                  .map((item) => (
                    <li key={item.id}>
                      <strong>Quantity:</strong> {item.quantity}{" "}
                      {selectedProductType.product_type_detail.unit}
                      <br />
                      <strong>Production:</strong>{" "}
                      {format(new Date(item.production_at), "MMMM d, yyyy")}
                      <br />
                      <strong>Expiry:</strong>{" "}
                      {format(new Date(item.expiry_at), "MMMM d, yyyy")}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button
            variant="warning"
            onClick={() => setShowDetailModal(false)}
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            }}
          >
            Back to Products
          </Button>
        </Modal.Footer>
      </Modal>

      <style type="text/css">{`
        .hover-shadow:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
        .hover-zoom:hover {
          transform: scale(1.03);
        }
        .page-item.active .page-link {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
        }
        .page-link {
          color: ${primaryColor};
        }
        .read-more-btn:hover {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
          color: white !important;
        }
      `}</style>
    </Container>
  );
};

export default Product;
