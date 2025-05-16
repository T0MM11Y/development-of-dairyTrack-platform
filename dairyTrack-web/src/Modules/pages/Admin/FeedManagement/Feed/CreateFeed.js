// src/pages/Admin/FeedManagement/Feed/CreateFeed.js
import { useState, useEffect } from "react";
import { addFeed } from "../../../../controllers/feedController";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";

const FeedCreatePage = ({ feedTypes, nutritions, onClose, onSaved }) => {
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    unit: "",
    min_stock: "",
    price: "",
    created_by: "",
    nutrisiList: [],
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id) {
      setCurrentUser(userData);
      setForm((prev) => ({
        ...prev,
        created_by: userData.user_id || userData.id || "",
      }));
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      const rawValue = value.replace(/[^0-9]/g, "");
      setForm((prev) => ({
        ...prev,
        [name]: rawValue,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNutrisiChange = (index, field, value) => {
    const updatedNutrisiList = [...form.nutrisiList];
    updatedNutrisiList[index] = {
      ...updatedNutrisiList[index],
      [field]: field === "amount" ? (value === "" ? "" : parseFloat(value) || 0) : value,
    };
    setForm((prev) => ({
      ...prev,
      nutrisiList: updatedNutrisiList,
    }));
  };

  const addNutrisi = () => {
    setForm((prev) => ({
      ...prev,
      nutrisiList: [...prev.nutrisiList, { nutrisi_id: "", amount: "" }],
    }));
  };

  const removeNutrisi = (index) => {
    setForm((prev) => ({
      ...prev,
      nutrisiList: prev.nutrisiList.filter((_, i) => i !== index),
    }));
  };

  const formatPrice = (value) => {
    if (!value) return "";
    const number = parseInt(value, 10);
    if (isNaN(number)) return "";
    return number.toLocaleString("id-ID");
  };

  // Filter available nutritions for a given dropdown based on previous selections
  const getAvailableNutritions = (currentIndex) => {
    const selectedNutrisiIds = form.nutrisiList
      .filter((_, index) => index !== currentIndex) // Exclude the current index
      .map((n) => n.nutrisi_id)
      .filter((id) => id); // Only include non-empty IDs
    return nutritions.filter((n) => !selectedNutrisiIds.includes(n.id.toString()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        typeId: parseInt(form.typeId),
        name: form.name.trim(),
        unit: form.unit.trim(),
        min_stock: parseFloat(form.min_stock) || 0,
        price: parseFloat(form.price) || 0,
        nutrisiList: form.nutrisiList.map((n) => ({
          nutrisi_id: parseInt(n.nutrisi_id),
          amount: parseFloat(n.amount) || 0,
        })),
      };

      const response = await addFeed(payload);
      console.log("FeedCreatePage - addFeed Response:", response);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message || "Pakan berhasil disimpan.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || "Gagal menyimpan pakan.");
      }
    } catch (err) {
      const message = err.message || "Terjadi kesalahan saat menyimpan pakan.";
      setError(message);
      Swal.fire({
        icon: "error",
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
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h4 className="modal-title text-info fw-bold">Tambah Pakan</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body p-4">
            {error && <p className="text-danger text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Jenis Pakan</label>
                  <select
                    name="typeId"
                    value={form.typeId}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Pilih Jenis Pakan</option>
                    {feedTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nama Pakan</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Satuan</label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Stok Minimum</label>
                  <input
                    type="number"
                    name="min_stock"
                    value={form.min_stock}
                    onChange={handleChange}
                    className="form-control"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Harga</label>
                  <div className="input-group">
                    <span className="input-group-text">Rp</span>
                    <input
                      type="text"
                      name="price"
                      value={formatPrice(form.price)}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Dibuat oleh</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={currentUser?.name || "Tidak diketahui"}
                    disabled
                  />
                  <input
                    type="hidden"
                    name="created_by"
                    value={form.created_by}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold d-block">Nutrisi</label>
                {form.nutrisiList.map((nutrisi, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-md-5">
                      {index === 0 && (
                        <label className="form-label mb-1">Pilih Nutrisi</label>
                      )}
                      <select
                        className="form-control"
                        value={nutrisi.nutrisi_id}
                        onChange={(e) =>
                          handleNutrisiChange(index, "nutrisi_id", e.target.value)
                        }
                        required
                      >
                        <option value="">Pilih Nutrisi</option>
                        {getAvailableNutritions(index).map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-5">
                      {index === 0 && (
                        <label className="form-label mb-1">Jumlah</label>
                      )}
                      <input
                        type="number"
                        className="form-control"
                        value={nutrisi.amount}
                        onChange={(e) =>
                          handleNutrisiChange(index, "amount", e.target.value)
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-2">
                      <Button
                        variant="outline-danger"
                        onClick={() => removeNutrisi(index)}
                        className="mt-3"
                      >
                        <i className="fas fa-trash" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={addNutrisi}
                  className="mt-2"
                >
                  Tambah Nutrisi
                </Button>
              </div>

              <button
                type="submit"
                className="btn btn-info w-100 mt-3"
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

export default FeedCreatePage;