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

      setData(productsRes);
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

  useEffect(() => {
    fetchData();
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
                        <td>
                          {new Date(item.production_at).toLocaleDateString()}
                        </td>
                        <td>{new Date(item.expiry_at).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === "available"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>{item.total_milk_used} L</td>
                        <td>
                          <Link
                            to={`/admin/keuangan/product/edit/${item.id}`}
                            className="btn btn-warning me-2"
                          >
                            <i className="ri-edit-line"></i>
                          </Link>
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
