import { useEffect, useState } from "react";
import { getOrders, deleteOrder } from "../../../../api/keuangan/order";
import { Link } from "react-router-dom";

const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersRes = await getOrders();
      setOrders(ordersRes);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    try {
      await deleteOrder(deleteId);
      fetchData();
      setDeleteId(null);
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success";
      case "Processing":
        return "bg-primary";
      case "Requested":
      case "Pending":
        return "bg-warning";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">Sales</h2>
        <Link to="/admin/keuangan/sales/create" className="btn btn-info">
          + Order
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
          <p className="mt-2">Loading order data...</p>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No order data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Order Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Order No</th>
                      <th>Customer Name</th>
                      <th>Location</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Payment Method</th>
                      <th>Order Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{order.order_no}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.location}</td>
                        <td>{formatPrice(order.total_price)}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>{order.payment_method || "-"}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <button
                            onClick={() => openOrderDetail(order)}
                            className="btn btn-info me-2"
                            title="View Details"
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          <button
                            onClick={() => setDeleteId(order.id)}
                            className="btn btn-danger"
                            title="Delete Order"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Order Details - {selectedOrder.order_no}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted">Customer Information</h6>
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.phone_number}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedOrder.location}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Order Information</h6>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {formatDate(selectedOrder.created_at)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge ${getStatusBadgeClass(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.payment_method || "-"}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <h6 className="text-muted">Order Items</h6>
                    <table className="table table-bordered table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Image</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.product_type_detail?.product_name || "-"}</td>
                            <td>
                              {item.product_type_detail?.image ? (
                                <img
                                  src={item.product_type_detail.image}
                                  alt={item.product_type_detail.product_name}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                    borderRadius: "5px",
                                  }}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{item.quantity}</td>
                            <td>{formatPrice(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-end">
                            <strong>Subtotal:</strong>
                          </td>
                          <td>
                            {formatPrice(
                              selectedOrder.order_items.reduce(
                                (sum, item) =>
                                  sum + parseFloat(item.total_price),
                                0
                              )
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="text-end">
                            <strong>Shipping Cost:</strong>
                          </td>
                          <td>{formatPrice(selectedOrder.shipping_cost)}</td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="text-end">
                            <strong>Total:</strong>
                          </td>
                          <td>
                            <strong>
                              {formatPrice(selectedOrder.total_price)}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Link
                  to={`/admin/keuangan/sales/edit/${selectedOrder.id}`}
                  className="btn btn-warning"
                >
                  Edit Order
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
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
                  Are you sure you want to delete this order?
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

export default Sales;