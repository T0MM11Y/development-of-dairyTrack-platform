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
      setError("Failed to load products. Please ensure the API server is active.");
    } finally {
      setLoading(false);
    }
  };

  // Function to group products by their product type
  const groupProductsByType = (products) => {
    const grouped = {};
    
    products.forEach(product => {
      const typeId = product.product_type;
      const typeDetails = product.product_type_detail;
      
      if (!grouped[typeId]) {
        grouped[typeId] = {
          typeDetails: typeDetails,
          totalAvailableQuantity: 0,
          products: []
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

  if (loading) {
    return (
      <div className="container mx-auto py-5 text-center" style={{ marginTop: "170px", marginBottom: "100px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-5" style={{ marginTop: "170px", marginBottom: "100px" }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto py-5"
      style={{ marginTop: "170px", marginBottom: "100px" }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Our Products</h2>
      
      {/* Display message if no products available */}
      {Object.keys(groupedProducts).length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      )}
      
      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {Object.values(groupedProducts).map((group, index) => (
          <ProdukItem 
            key={index} 
            productType={group.typeDetails}
            availableQuantity={group.totalAvailableQuantity}
          />
        ))}
      </div>
    </div>
  );
};

const ProdukItem = ({ productType, availableQuantity }) => {
  const formatPrice = (price) => {
    return `Rp ${parseFloat(price).toLocaleString("id-ID")}`;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Product Image */}
      <img 
        src={productType.image || "/placeholder-image.jpg"} 
        alt={productType.product_name} 
        className="w-full h-48 object-cover"
      />

      {/* Product Details */}
      <div className="p-4">
        <h5 className="product-name">{productType.product_name}</h5>
        
        {/* Description */}
        <p className="text-gray-600 mt-2">
          {productType.product_description.length > 100
            ? `${productType.product_description.substring(0, 100)}...`
            : productType.product_description}
        </p>

        {/* Price and Unit */}
        <div className="product-price">
          {formatPrice(productType.price)} / {productType.unit}
        </div>

        {/* Available Stock */}
        <div className="mt-2 flex items-center text-gray-700 text-sm">
          <span className="font-medium">{availableQuantity} {productType.unit} available</span>
        </div>

        {/* View Details Button */}
        <div className="mt-4 text-center">
          <Link
            to={`/product/${productType.id}`}
            className="view-details-btn"
          >
            Pesan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProdukPage;