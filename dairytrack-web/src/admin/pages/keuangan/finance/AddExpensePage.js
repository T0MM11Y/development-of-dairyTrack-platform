import { useState } from "react";
import { createExpense } from "../../../../api/keuangan/expense";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";

const AddExpenseModal = ({ onClose, onSaved }) => {
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
      transaction_type: "expense",
    };

    try {
      await createExpense(formData);
      await showAlert({
        type: "success",
        title: "Berhasil",
        text: "Pengeluaran berhasil disimpan.",
      });

      if (onSaved) onSaved(formData);
      onClose();
    } catch (err) {
      let message = "Gagal menyimpan pengeluaran.";
      if (err.response && err.response.data) {
        message = err.response.data.message || message;
      }
      setError(message);
      await showAlert({
        type: "error",
        title: "Gagal Menyimpan",
        text: message,
      });
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
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              Tambah Pengeluaran
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Jenis Pengeluaran</label>
                <select
                  name="expense_type"
                  value={form.expense_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Tanggal Transaksi</label>
                <input
                  type="datetime-local"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Masukkan deskripsi pengeluaran (opsional)"
                  rows="3"
                  disabled={submitting}
                />
              </div>

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

export default AddExpenseModal;
