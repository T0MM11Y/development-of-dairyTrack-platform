import { useEffect, useState } from "react";
import {
  deleteProductStock,
  getProductStocks,
} from "../../../../api/keuangan/product";
import { getProductTypes } from "../../../../api/keuangan/productType";
import { Link } from "react-router-dom";

const ProductStockListPage = () => {
  const [data, setData] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, productTypesRes] = await Promise.all([
        getProductStocks(),
        getProductTypes(),
      ]);

      // Process data to add time remaining info
      const processedData = productsRes.map((item) => {
        const now = new Date();
        const expiryDate = new Date(item.expiry_at);
        const timeRemaining = expiryDate - now;

        return {
          ...item,
          timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
        };
      });

      // Sort by time remaining (ascending - products expiring soon first)
      const sortedData = processedData.sort((a, b) => {
        // If both are available, sort by time remaining
        if (a.status === "available" && b.status === "available") {
          return a.timeRemaining - b.timeRemaining;
        }
        // If only one is available, put available items first
        else if (a.status === "available") {
          return -1;
        } else if (b.status === "available") {
          return 1;
        }
        // If neither is available, maintain original order
        return 0;
      });

      setData(sortedData);
      setProductTypes(productTypesRes);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const getProductTypeName = (productTypeId) => {
    const productType = productTypes.find((type) => type.id === productTypeId);
    return productType ? productType.product_name : "Unknown";
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (timeRemaining <= 0) {
      return "Expired";
    }

    // Convert milliseconds to days, hours, minutes
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (days > 0) {
      return `${days} hari ${hours} jam`;
    } else if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    } else if (minutes > 0) {
      return `${minutes} menit`;
    } else {
      return "< 1 menit"; // Fix for NaN menit when minutes is 0
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusBadgeClass = (status, timeRemaining) => {
    if (status !== "available") {
      return "bg-danger";
    }

    // If time remaining is less than 24 hours (86400000 ms)
    if (timeRemaining < 86400000) {
      return "bg-warning"; // Yellow for urgent
    }

    return "bg-success"; // Green for normal available
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    try {
      await deleteProductStock(deleteId);
      fetchData();
      setDeleteId(null);
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Update data every minute to refresh time remaining
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">Product Stock</h2>
        <Link to="/admin/keuangan/product/create" className="btn btn-info">
          + Product Stock
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading product stock data...</p>
        </div>
      ) : data.length === 0 ? (
        <p className="text-gray-500">No product stock data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Product Stock Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Type</th>
                      <th>Remaining Qty</th>
                      <th>Production Date</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Total Milk Used</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={item.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{getProductTypeName(item.product_type)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatDateTime(item.production_at)}</td>
                        <td>{formatDateTime(item.expiry_at)}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              item.status,
                              item.timeRemaining
                            )}`}
                          >
                            {item.status === "available"
                              ? `${item.status} (${formatTimeRemaining(
                                  item.timeRemaining
                                )})`
                              : item.status}
                          </span>
                        </td>
                        <td>{item.total_milk_used} L</td>
                        <td>
                          {item.status === "contamination" ||
                          item.status === "expired" ||
                          item.status === "sold_out" ? (
                            <button
                              className="btn btn-warning me-2"
                              disabled
                              title="Tidak dapat diedit"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                          ) : (
                            <Link
                              to={`/admin/keuangan/product/edit/${item.id}`}
                              className="btn btn-warning me-2"
                            >
                              <i className="ri-edit-line"></i>
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="btn btn-danger"
                          >
                            <i className="ri-delete-bin-6-line"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="modal fade show d-block"
          style={{
            background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this product stock?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStockListPage;
