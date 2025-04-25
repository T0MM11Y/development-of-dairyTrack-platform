import { useState } from "react";
import { createIncome } from "../../../../api/keuangan/income";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";
import { useTranslation } from "react-i18next";


const AddIncomeModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    income_type: "",
    amount: "",
    description: "",
    transaction_date: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

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
      transaction_type: "income", // Tambahkan untuk konsistensi dengan getFinances
    };

    try {
      await createIncome(formData);
      await showAlert({
        type: "success",
        title: "Berhasil",
        text: "Pemasukan berhasil disimpan.",
      });

      if (onSaved) onSaved(formData); // Kirim data baru ke parent
      onClose(); // Tutup modal
    } catch (err) {
      let message = "Gagal menyimpan pemasukan.";
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
            <h4 className="modal-title text-info fw-bold">{t('finance.add_income')}
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
                <label className="form-label fw-bold">{t('finance.income_type')}
                </label>
                <select
                  name="income_type"
                  value={form.income_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={submitting}
                >
                  <option value="">-- {t('finance.select_income_type')}
                  --</option>
                  <option value="investment">{t('finance.investment')}
                  </option>
                  <option value="sales">{t('finance.sales')}
                  </option>
                  <option value="other">{t('finance.others')}
                  </option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t('finance.amount')}
                (Rp)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Masukkan jumlah pemasukan"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t('finance.transaction_date')}
                </label>
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
                <label className="form-label fw-bold">{t('finance.description')}
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Masukkan deskripsi pemasukan (wajib)"
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

export default AddIncomeModal;
