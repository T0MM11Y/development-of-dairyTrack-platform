import { useEffect, useState } from "react";
import { getOrderById, updateOrder } from "../../../../api/keuangan/order";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";


const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderStatuses] = useState([
    "Requested",
    "Processed",
    "Completed",
    "Cancelled",
  ]);
  const { t } = useTranslation();

  const [paymentMethods] = useState([
    { value: "", label: "Select Payment Method" },
    { value: "Cash", label: "Cash" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Bank Transfer", label: "Bank Transfer" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await getOrderById(id);
        console.log(
          "Respons getOrderById:",
          JSON.stringify(orderRes, null, 2)
        ); // Log JSON respons
        setForm(orderRes);
      } catch (err) {
        console.error("Error fetching order:", {
          message: err.message,
          response: err.response ? err.response.data : null,
        }); // Log detail error
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
        payment_method: form.payment_method || null,
      };

      if (form.status === "Requested") {
        updatePayload.shipping_cost = form.shipping_cost
          ? parseFloat(form.shipping_cost)
          : 0;
      }

      // Validasi payment_method untuk status Completed
      if (form.status === "Completed" && !form.payment_method) {
        setError("Metode pembayaran harus diisi untuk status Completed.");
        setSubmitting(false);
        return;
      }

      console.log(
        "Payload updateOrder:",
        JSON.stringify(updatePayload, null, 2)
      ); // Log payload sebelum kirim

      await updateOrder(id, updatePayload);
      navigate("/admin/keuangan/sales");
    } catch (err) {
      console.error("Error updating order:", {
        message: err.message,
        response: err.response ? err.response.data : null,
      }); // Log detail error
      setError("Gagal memperbarui data order: " + err.message);
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

  return (
    <div
      className="modal show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
            {t('sales.edit_order')}
            {form?.order_no}
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
                <p className="mt-2">{t('sales.loading_order_data')}
                ...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">{t('sales.customer_information')}
                    </h6>
                    <div className="mb-3">
                      <label className="form-label">{t('sales.customer_name')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.customer_name || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('sales.customer_email')}
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('sales.customer_phone')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.phone_number || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('sales.customer_location')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.location || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">{t('sales.status_payment')}
                    </h6>
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
                        {t('sales.order_shipping_cost')}
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

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                      {t('sales.payment_method')}

                      </label>
                      <select
                        name="payment_method"
                        value={form.payment_method || ""}
                        onChange={handleChange}
                        className="form-select"
                        disabled={submitting}
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">{t('sales.total_price')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formatPrice(form.total_price) || ""}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">{t('sales.order_date')}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={new Date(form.created_at).toLocaleString("id-ID")}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="fw-bold mb-3">{t('sales.order_items_table')}
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
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
                          {form.order_items &&
                            form.order_items.map((item, index) => (
                              <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.product_type?.product_name || "Unknown"}</td>
                                <td>
                                  {item.product_type?.image ? (
                                    <img
                                      src={item.product_type.image}
                                      alt={item.product_type.product_name}
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        borderRadius: "5px",
                                      }}
                                      onError={(e) => {
                                        e.target.src = "/images/fallback.jpg";
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
                            <td colSpan="4" className="text-end fw-bold">
                            {t('sales.subtotal')}
                            :
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
                            <td colSpan="4" className="text-end fw-bold">
                            {t('sales.order_shipping_cost')}
                            :
                            </td>
                            <td>{formatPrice(form.shipping_cost)}</td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="text-end fw-bold">
                            {t('sales.total')}
                            :
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
                    {t('sales.back')}

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