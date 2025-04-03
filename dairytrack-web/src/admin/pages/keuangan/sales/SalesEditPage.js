import { useEffect, useState } from "react";
import { getOrderById, updateOrder } from "../../../../api/keuangan/order";
import { getProductTypes } from "../../../../api/keuangan/productType";
import { useNavigate, useParams } from "react-router-dom";

const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderStatuses] = useState([
    "Requested",
    "Processing",
    "Completed",
    "Cancelled",
  ]);
  const [paymentMethods] = useState([
    "Cash",
    "Credit Card",
    "Bank Transfer",
    "E-Wallet",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, productTypesRes] = await Promise.all([
          getOrderById(id),
          getProductTypes(),
        ]);

        setForm(orderRes);
        setProductTypes(productTypesRes);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Gagal mengambil data order.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Construct the update payload
      const updatePayload = {
        status: form.status,
        payment_method: form.payment_method,
      };

      // Add shipping cost only if status is Requested
      if (form.status === "Requested") {
        updatePayload.shipping_cost = form.shipping_cost;
      }

      await updateOrder(id, updatePayload);
      navigate("/admin/keuangan/sales");
    } catch (err) {
      console.error("Error updating order:", err);
      setError("Gagal memperbarui data order.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductTypeName = (productTypeId) => {
    const productType = productTypes.find((type) => type.id === productTypeId);
    return productType ? productType.product_name : "Unknown";
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              Edit Order {form?.order_no}
            </h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/sales")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading || !form ? (
              <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Memuat data order...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Informasi Pelanggan</h6>
                    <div className="mb-3">
                      <label className="form-label">Nama Pelanggan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.customer_name || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nomor Telepon</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.phone_number || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Lokasi</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.location || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Status dan Pembayaran</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Status Order
                      </label>
                      <select
                        name="status"
                        value={form.status || ""}
                        onChange={handleChange}
                        className="form-select"
                        disabled={submitting}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {form.status === "Requested" && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Biaya Pengiriman
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            name="shipping_cost"
                            value={form.shipping_cost || ""}
                            onChange={handleChange}
                            className="form-control"
                            disabled={submitting}
                            min="0"
                          />
                        </div>
                      </div>
                    )}

                    {form.status === "Processing" && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Metode Pembayaran
                        </label>
                        <select
                          name="payment_method"
                          value={form.payment_method || ""}
                          onChange={handleChange}
                          className="form-select"
                          disabled={submitting}
                        >
                          {paymentMethods.map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Total Harga</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formatPrice(form.total_price) || ""}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Tanggal Order</label>
                      <input
                        type="text"
                        className="form-control"
                        value={new Date(form.created_at).toLocaleString(
                          "id-ID"
                        )}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="fw-bold mb-3">Order Items</h6>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Produk</th>
                            <th>Jumlah</th>
                            <th>Harga</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.order_items &&
                            form.order_items.map((item, index) => (
                              <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{getProductTypeName(item.product_type)}</td>
                                <td>{item.quantity}</td>
                                <td>{formatPrice(item.total_price)}</td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">
                              Subtotal:
                            </td>
                            <td>
                              {formatPrice(
                                form.order_items?.reduce(
                                  (sum, item) =>
                                    sum + parseFloat(item.total_price),
                                  0
                                ) || 0
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">
                              Biaya Pengiriman:
                            </td>
                            <td>{formatPrice(form.shipping_cost)}</td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">
                              Total:
                            </td>
                            <td className="fw-bold">
                              {formatPrice(form.total_price)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin/keuangan/sales")}
                    disabled={submitting}
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Memperbarui...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEditPage;
