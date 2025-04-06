import { useState } from "react";
import { createExpense } from "../../../../api/keuangan/expense";
import { useNavigate } from "react-router-dom";

const AddExpensePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    expense_type: "",
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
      expense_type: form.expense_type,
      amount: Number(form.amount),
      description: form.description,
      transaction_date: new Date(form.transaction_date).toISOString(),
    };

    console.log("Data yang dikirim:", JSON.stringify(formData, null, 2));

    try {
      await createExpense(formData);
      navigate("/admin/keuangan/finance");
    } catch (err) {
      console.error("Gagal menyimpan data pengeluaran:", err);

      // Menampilkan detail error response
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
        console.error(
          "Response data:",
          JSON.stringify(err.response.data, null, 2)
        );

        // Jika server mengembalikan pesan error spesifik
        if (err.response.data && err.response.data.message) {
          setError("Server error: " + err.response.data.message);
        } else {
          setError("Gagal menyimpan data pengeluaran: " + err.response.status);
        }
      } else if (err.request) {
        // Request dibuat tapi tidak ada response
        console.error("Request sent but no response:", err.request);
        setError(
          "Tidak ada respons dari server. Periksa koneksi internet Anda."
        );
      } else {
        // Error pada setup request
        console.error("Error setup request:", err.message);
        setError("Gagal menyiapkan request: " + err.message);
      }
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
            <h4 className="modal-title text-info fw-bold">
              Tambah Pengeluaran
            </h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/finance")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              {/* Expense Type */}
              <div className="mb-3">
                <label className="form-label fw-bold">Jenis Pengeluaran</label>
                <select
                  name="expense_type"
                  value={form.expense_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Pilih Jenis Pengeluaran --</option>
                  <option value="material_purchase">Pembelian Bahan</option>
                  <option value="feed_purchase">Pembelian Pakan</option>
                  <option value="medicine_purchase">Pembelian Obat</option>
                  <option value="employee_salary">Gaji Karyawan</option>
                  <option value="operational">Biaya Operasional</option>
                  <option value="equipment_purchase">
                    Pembelian Peralatan
                  </option>
                  <option value="marketing">Marketing</option>
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
                  placeholder="Masukkan jumlah pengeluaran"
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
                  placeholder="Masukkan deskripsi pengeluaran (opsional)"
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

export default AddExpensePage;
