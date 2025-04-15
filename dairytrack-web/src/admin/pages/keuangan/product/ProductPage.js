import { useEffect, useState } from "react";
import {
  deleteProductStock,
  getProductStocks,
} from "../../../../api/keuangan/product";
import DataTable from "react-data-table-component";
import ProductStockCreatePage from "./ProductCreatePage";
import ProductEditPage from "./ProductEditPage";

const ProductStockListPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null); // State untuk modal edit (simpan ID produk)

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsRes = await getProductStocks();
      const processedData = productsRes.map((item) => {
        const now = new Date();
        const expiryDate = new Date(item.expiry_at);
        const timeRemaining = expiryDate - now;
        return {
          ...item,
          timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
        };
      });
      const sortedData = processedData.sort((a, b) => {
        if (a.status === "available" && b.status === "available") {
          return a.timeRemaining - b.timeRemaining;
        } else if (a.status === "available") {
          return -1;
        } else if (b.status === "available") {
          return 1;
        }
        return 0;
      });
      setData(sortedData);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (timeRemaining <= 0) {
      return "Expired";
    }
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
      return "< 1 menit";
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
    if (timeRemaining < 86400000) {
      return "bg-warning";
    }
    return "bg-success";
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

  const columns = [
    {
      name: "Product Type",
      selector: (row) => row.product_type_detail?.product_name || "Unknown",
      sortable: true,
    },
    {
      name: "Remaining Qty",
      selector: (row) => row.quantity,
      sortable: true,
    },
    {
      name: "Production Date",
      selector: (row) => formatDateTime(row.production_at),
      sortable: true,
    },
    {
      name: "Expiry Date",
      selector: (row) => formatDateTime(row.expiry_at),
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${getStatusBadgeClass(row.status, row.timeRemaining)}`}
        >
          {row.status === "available"
            ? `${row.status} (${formatTimeRemaining(row.timeRemaining)})`
            : row.status}
        </span>
      ),
      sortable: true,
      selector: (row) => row.status,
    },
    {
      name: "Total Milk Used",
      selector: (row) => `${row.total_milk_used} L`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          {row.status === "contamination" ||
          row.status === "expired" ||
          row.status === "sold_out" ? (
            <button
              className="btn btn-warning btn-sm me-2"
              disabled
              title="Tidak dapat diedit"
            >
              <i className="ri-edit-line"></i>
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm me-2"
              onClick={() => setShowEditModal(row.id)}
            >
              <i className="ri-edit-line"></i>
            </button>
          )}
          <button
            onClick={() => setDeleteId(row.id)}
            className="btn btn-danger btn-sm"
          >
            <i className="ri-delete-bin-6-line"></i>
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "55px",
      },
    },
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 600000); // 10 menit
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">Product Stock</h2>
        <button
          className="btn btn-info"
          onClick={() => setShowCreateModal(true)}
        >
          + Product Stock
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={data}
            pagination
            persistTableHead
            progressPendingIndicator={
              <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading product stock data...</p>
              </div>
            }
            progressPending={loading}
            noDataComponent={
              <div className="text-center my-3">
                <p className="text-gray-500">No product stock data available.</p>
              </div>
            }
            customStyles={customStyles}
            highlightOnHover
            responsive
          />
        </div>
      </div>

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

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{
            background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <ProductStockCreatePage
                onProductAdded={() => {
                  fetchData();
                  setShowCreateModal(false);
                }}
                onClose={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{
            background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
          onClick={() => setShowEditModal(null)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <ProductEditPage
                productId={showEditModal}
                onProductUpdated={() => {
                  fetchData();
                  setShowEditModal(null);
                }}
                onClose={() => setShowEditModal(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStockListPage;