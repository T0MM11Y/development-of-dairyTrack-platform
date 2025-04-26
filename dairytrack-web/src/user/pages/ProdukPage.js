import { useEffect, useState } from "react";
import { getProductStocks } from "../../api/keuangan/product";
import { Link } from "react-router-dom";
import "../../assets/client/css/publicUserProduct.css";

const ProdukPage = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupedProducts, setGroupedProducts] = useState({});

  useEffect(() => {
    fetchProductStocks();
  }, []);

  const fetchProductStocks = async () => {
    try {
      setLoading(true);
      const products = await getProductStocks();
      setProductData(products);

      // Group products by their product type
      const grouped = groupProductsByType(products);
      setGroupedProducts(grouped);
      setError("");
    } catch (err) {
      console.error("Failed to fetch product stocks:", err.message);
      setError(
        "Failed to load products. Please ensure the API server is active."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to group products by their product type
  const groupProductsByType = (products) => {
    const grouped = {};

    products.forEach((product) => {
      const typeId = product.product_type;
      const typeDetails = product.product_type_detail;

      if (!grouped[typeId]) {
        grouped[typeId] = {
          typeDetails: typeDetails,
          totalAvailableQuantity: 0,
          products: [],
        };
      }

      grouped[typeId].products.push(product);

      // Only count available products in the total
      if (product.status === "available") {
        grouped[typeId].totalAvailableQuantity += product.quantity;
      }
    });

    return grouped;
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Render content based on loading/error state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Loading products...</p>
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-danger text-center fs-5">{error}</div>;
    }

    return (
      <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="container py-5">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-5">
              <p className="fs-5">No products available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4">
              {Object.values(groupedProducts).map((group, index) => (
                <ProdukItem
                  key={index}
                  productType={group.typeDetails}
                  availableQuantity={group.totalAvailableQuantity}
                  truncateText={truncateText}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <>
      {/* Breadcrumb Section */}
      <section className="breadcrumb__wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb__wrap__content">
                <h2 className="title">Products Page</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Products
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Render appropriate content based on state */}
      {renderContent()}
    </>
  );
};

const ProdukItem = ({ productType, availableQuantity, truncateText }) => {
  const formatPrice = (price) => {
    return `Rp ${parseFloat(price).toLocaleString("id-ID")}`;
  };

  return (
    <div className="col-md-4">
      <div className="card h-100 border-0 shadow-sm overflow-hidden">
        <div className="position-relative">
          <img
            src={productType.image || "/placeholder-image.jpg"}
            alt={productType.product_name}
            className="card-img-top"
            style={{ height: "250px", objectFit: "cover" }}
          />
          <div className="position-absolute top-0 end-0 m-3">
            <span className="badge bg-success px-3 py-2 rounded-pill">
              {availableQuantity} {productType.unit} available
            </span>
          </div>
        </div>
        <div className="card-body p-4">
          <h5 className="card-title fw-bold" style={{ color: "#2c3e50" }}>
            {productType.product_name}
          </h5>
          <p className="card-text text-muted mb-4">
            {truncateText(productType.product_description)}
          </p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-primary fw-bold fs-5">
              {formatPrice(productType.price)} / {productType.unit}
            </span>
          </div>
        </div>
        <div className="card-footer bg-transparent border-0 p-4 pt-0">
          <Link
            to="/pemesanan"
            className="btn btn-primary w-100 py-2 rounded-pill"
            style={{ fontWeight: "500" }}
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProdukPage;
