import { useState } from "react";
import { createIncome } from "../../../../api/keuangan/income";
import { useNavigate } from "react-router-dom";

const AddIncomePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    income_type: "",
    amount: "",
    description: "",
    transaction_date: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      income_type: form.income_type,
      amount: Number(form.amount),
      description: form.description,
      transaction_date: new Date(form.transaction_date).toISOString(),
    };

    console.log("Data yang dikirim:", JSON.stringify(formData, null, 2));

    try {
      await createIncome(formData);
      navigate("/admin/keuangan/finance");
    } catch (err) {
      console.error("Gagal menyimpan data pemasukan:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
      }
      setError("Gagal menyimpan data pemasukan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Pemasukan</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/finance")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              {/* Income Type */}
              <div className="mb-3">
                <label className="form-label fw-bold">Jenis Pemasukan</label>
                <select
                  name="income_type"
                  value={form.income_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Pilih Jenis Pemasukan --</option>
                  <option value="investment">Investasi</option>
                  <option value="sales">Penjualan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="form-label fw-bold">Jumlah (Rp)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Masukkan jumlah pemasukan"
                  required
                />
              </div>

              {/* Transaction Date */}
              <div className="mb-3">
                <label className="form-label fw-bold">Tanggal Transaksi</label>
                <input
                  type="datetime-local"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-bold">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Masukkan deskripsi pemasukan (opsional)"
                  rows="3"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIncomePage;
