import { useEffect, useState } from "react";
import { getOrders, deleteOrder } from "../../../../api/keuangan/order";
import DataTable from "react-data-table-component";
import SalesCreateModal from "./SalesCreatePage";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t } = useTranslation();

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

    const result = await showAlert({
      type: "warning",
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        await deleteOrder(deleteId);
        await showAlert({
          type: "success",
          title: "Berhasil",
          text: "Pesanan berhasil dihapus.",
        });
        fetchData();
        setDeleteId(null);
      } catch (err) {
        await showAlert({
          type: "error",
          title: "Gagal Menghapus",
          text: "Gagal menghapus pesanan: " + err.message,
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      setDeleteId(null);
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  const handleCreateSaved = () => {
    fetchData();
    setShowCreateModal(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (deleteId) {
      handleDelete();
    }
  }, [deleteId]);

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

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Order No",
      selector: (row) => row.order_no,
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row) => row.customer_name,
      sortable: true,
    },
    {
      name: "Location",
      selector: (row) => row.location,
      sortable: true,
    },
    {
      name: "Total Price",
      selector: (row) => parseFloat(row.total_price),
      cell: (row) => formatPrice(row.total_price),
      sortable: true,
      right: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <span className={`badge ${getStatusBadgeClass(row.status)}`}>
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Payment Method",
      selector: (row) => row.payment_method || "-",
      sortable: true,
    },
    {
      name: "Order Date",
      selector: (row) => row.created_at,
      cell: (row) => formatDate(row.created_at),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            onClick={() => openOrderDetail(row)}
            className="btn btn-info btn-sm me-2"
            title="View Details"
          >
            <i className="ri-eye-line"></i>
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="btn btn-danger btn-sm"
            title="Delete Order"
            disabled={submitting}
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

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">{t('sales.title')}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info"
          disabled={submitting}
        >
          + Order
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h4 className="card-title">{t('sales.order_data')}
          </h4>
          <DataTable
            columns={columns}
            data={orders}
            pagination
            persistTableHead
            progressPending={loading}
            progressPendingIndicator={
              <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">{t('sales.loading_orders')}
                ...</p>
              </div>
            }
            noDataComponent={
              <div className="text-center my-3">
                <p className="text-gray-500">{t('sales.no_orders')}
                .</p>
              </div>
            }
            customStyles={customStyles}
            highlightOnHover
            responsive
          />
        </div>
      </div>

      {showCreateModal && (
        <SalesCreateModal
          onClose={() => setShowCreateModal(false)}
          onSaved={handleCreateSaved}
        />
      )}

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
                {t('sales.order_details')}
                - {selectedOrder.order_no}
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
                    <h6 className="text-muted">{t('sales.customer_info')}
                    </h6>
                    <p>
                      <strong>{t('sales.name')}
                      :</strong> {selectedOrder.customer_name}
                    </p>
                    <p>
                      <strong>{t('sales.email')}
                      :</strong> {selectedOrder.email}
                    </p>
                    <p>
                      <strong>{t('sales.phone')}
                      :</strong> {selectedOrder.phone_number}
                    </p>
                    <p>
                      <strong>{t('sales.location')}
                      :</strong> {selectedOrder.location}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">{t('sales.order_info')}
                    </h6>
                    <p>
                      <strong>{t('sales.order_date')}
                      :</strong>{" "}
                      {formatDate(selectedOrder.created_at)}
                    </p>
                    <p>
                      <strong>{t('sales.status')}
                      :</strong>{" "}
                      <span
                        className={`badge ${getStatusBadgeClass(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p>
                      <strong>{t('sales.payment_method')}
                      :</strong>{" "}
                      {selectedOrder.payment_method || "-"}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <h6 className="text-muted">{t('sales.order_items')}
                    </h6>
                    <table className="table table-bordered table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{t('sales.product')}
                          </th>
                          <th>{t('sales.image')}
                          </th>
                          <th>{t('sales.quantity')}
                          </th>
                          <th>{t('sales.price')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>
                              {item.product_type_detail?.product_name || "-"}
                            </td>
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
                            <strong>{t('sales.subtotal')}
                            :</strong>
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
                            <strong>{t('sales.shipping_cost')}
                            :</strong>
                          </td>
                          <td>{formatPrice(selectedOrder.shipping_cost)}</td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="text-end">
                            <strong>{t('sales.total')}
                            :</strong>
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
                  {t('sales.edit_order')}

                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  {t('sales.close')}

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
