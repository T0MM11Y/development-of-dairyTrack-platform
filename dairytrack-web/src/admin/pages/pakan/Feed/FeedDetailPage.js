import { useState, useEffect } from "react";
import { getFeedById, updateFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import { getNutritions } from "../../../../api/pakan/nutrient";
import Swal from "sweetalert2";

const EditFeedModal = ({ feedId, onClose, onFeedUpdated }) => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [nutritions, setNutritions] = useState([]);
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    min_stock: 0,
    price: 0,
  });
  const [selectedNutrients, setSelectedNutrients] = useState([]);
  const [nutrientToAdd, setNutrientToAdd] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Starting data fetch for feed ID:", feedId);

        // Fetch feed types
        const typeResponse = await getFeedTypes();
        console.log("getFeedTypes Response:", typeResponse);
        const feedTypesData = typeResponse.feedTypes || typeResponse.jenisPakan || [];
        console.log("Processed feedTypesData:", feedTypesData);
        if (typeResponse.success && feedTypesData.length > 0) {
          setFeedTypes(feedTypesData);
        } else {
          throw new Error("Jenis pakan tidak tersedia.");
        }

        // Fetch nutritions
        const nutritionResponse = await getNutritions();
        console.log("getNutritions Response:", nutritionResponse);
        const nutritionsData = nutritionResponse.nutrisi || [];
        console.log("Processed nutritionsData:", nutritionsData);
        if (nutritionResponse.success && nutritionsData.length > 0) {
          setNutritions(nutritionsData);
        } else {
          throw new Error("Data nutrisi tidak tersedia.");
        }

        // Fetch feed
        const feedResponse = await getFeedById(feedId);
        console.log("getFeedById Response:", feedResponse);
        const feed = feedResponse.data || feedResponse.pakan || feedResponse.feed || {};
        console.log("Processed feed:", feed);
        if (feedResponse.success && Object.keys(feed).length > 0) {
          setForm({
            typeId: feed.typeId?.toString() || feed.FeedType?.id?.toString() || "",
            name: feed.name || "",
            min_stock: Number(feed.min_stock) || 0,
            price: Number(feed.price) || 0,
          });
          if (feed.FeedNutrisiRecords && Array.isArray(feed.FeedNutrisiRecords)) {
            const nutrients = feed.FeedNutrisiRecords.map((record) => ({
              nutrisiId: record.nutrisi_id || record.nutrisiId || "",
              amount: Number(record.amount) || 0,
              name: record.Nutrisi?.name || "Unknown",
              unit: record.Nutrisi?.unit || "",
            }));
            console.log("Processed selectedNutrients:", nutrients);
            setSelectedNutrients(nutrients);
          }
        } else {
          throw new Error("Pakan tidak ditemukan atau data tidak valid.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        Swal.fire({
          title: "Gagal",
          text: err.message || "Terjadi kesalahan saat memuat data.",
          icon: "error",
          confirmButtonText: "Tutup",
        }).then(() => onClose());
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };
    fetchData();
  }, [feedId, onClose]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "name" && !value.trim()) {
      error = "Nama pakan wajib diisi.";
    } else if (name === "typeId" && !value) {
      error = "Jenis pakan wajib dipilih.";
    } else if (name === "min_stock" && (value < 0 || isNaN(value))) {
      error = "Stok minimum harus angka nol atau positif.";
    } else if (name === "price" && (value < 0 || isNaN(value))) {
      error = "Harga harus angka nol atau positif.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "typeId"
        ? value
        : name === "min_stock" || name === "price"
        ? Number(value) || 0
        : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const handleNutrientChange = (nutrisiId, value) => {
    const amount = value ? Number(value) : 0;
    setSelectedNutrients((prev) =>
      prev.map((nutrient) =>
        nutrient.nutrisiId === nutrisiId ? { ...nutrient, amount } : nutrient
      )
    );
    setErrors((prev) => ({
      ...prev,
      [`nutrient-${nutrisiId}`]:
        amount <= 0 ? "Nilai nutrisi harus lebih dari 0." : "",
    }));
  };

  const handleAddNutrient = () => {
    if (!nutrientToAdd) {
      setErrors((prev) => ({ ...prev, nutrientToAdd: "Pilih nutrisi terlebih dahulu." }));
      return;
    }
    if (selectedNutrients.some((n) => n.nutrisiId === Number(nutrientToAdd))) {
      setErrors((prev) => ({ ...prev, nutrientToAdd: "Nutrisi sudah dipilih." }));
      return;
    }

    const nutrient = nutritions.find((n) => n.id === Number(nutrientToAdd));
    if (nutrient) {
      setSelectedNutrients((prev) => [
        ...prev,
        { nutrisiId: nutrient.id, amount: 0, name: nutrient.name, unit: nutrient.unit },
      ]);
      setNutrientToAdd("");
      setErrors((prev) => ({ ...prev, nutrientToAdd: "" }));
    }
  };

  const handleRemoveNutrient = (nutrisiId) => {
    setSelectedNutrients((prev) => prev.filter((n) => n.nutrisiId !== nutrisiId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`nutrient-${nutrisiId}`];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate form fields
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    // Validate nutrients
    if (selectedNutrients.length === 0) {
      newErrors.nutrients = "Setidaknya satu nutrisi harus ditambahkan.";
    } else {
      selectedNutrients.forEach((n) => {
        if (n.amount <= 0) {
          newErrors[`nutrient-${n.nutrisiId}`] =
            `Nilai untuk ${n.name} harus lebih dari 0.`;
        }
      });
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        title: "Gagal",
        text: "Periksa kembali input Anda.",
        icon: "error",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menyimpan perubahan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);

    try {
      const nutrientRecords = selectedNutrients.map((n) => ({
        nutrisi_id: n.nutrisiId, // ✅ ubah dari 'nutrisiId' jadi 'nutrisi_id'
        amount: Number(n.amount),
      }));
      
      const feedData = {
        typeId: Number(form.typeId),
        name: form.name.trim(),
        min_stock: Number(form.min_stock),
        price: Number(form.price),
        nutrisiList: nutrientRecords, // ✅ cocok dengan backend
      };
            
      console.log("Sending feed data for update:", { id: feedId, ...feedData });

      const response = await updateFeed(feedId, feedData);
      console.log("updateFeed Response:", response);

      if (response.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: response.message || "Data pakan berhasil diperbarui.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        onFeedUpdated();
        onClose();
      } else {
        throw new Error(response.message || "Gagal memperbarui data pakan.");
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err.message.includes("sudah ada")
        ? err.message
        : err.message === "Pakan not found"
        ? "Pakan tidak ditemukan."
        : "Terjadi kesalahan saat memperbarui pakan.";
      await Swal.fire({
        title: "Gagal!",
        text: errorMessage,
        icon: "error",
      });
      setErrors((prev) => ({ ...prev, form: errorMessage }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (loading) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Memuat data pakan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedTypes.length || !nutritions.length) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <div className="alert alert-danger">
                Gagal memuat data jenis pakan atau nutrisi.
              </div>
              <button
                className="btn btn-secondary w-100"
                onClick={handleCancel}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Pakan</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {errors.form && <div className="alert alert-danger">{errors.form}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Jenis Pakan</label>
                <select
                  name="typeId"
                  value={form.typeId}
                  onChange={handleChange}
                  className={`form-select ${errors.typeId ? "is-invalid" : ""}`}
                  disabled={submitting}
                >
                  <option value="">Pilih Jenis</option>
                  {feedTypes.map((ft) => (
                    <option key={ft.id} value={ft.id}>
                      {ft.name}
                    </option>
                  ))}
                </select>
                {errors.typeId && <div className="invalid-feedback">{errors.typeId}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Nama pakan"
                  disabled={submitting}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Stok Minimum</label>
                <input
                  type="number"
                  name="min_stock"
                  value={form.min_stock}
                  onChange={handleChange}
                  className={`form-control ${errors.min_stock ? "is-invalid" : ""}`}
                  min="0"
                  placeholder="0"
                  disabled={submitting}
                />
                {errors.min_stock && (
                  <div className="invalid-feedback">{errors.min_stock}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className={`form-control ${errors.price ? "is-invalid" : ""}`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>
              <h5 className="mb-3">Nutrisi</h5>
              <div className="mb-3">
                <label className="form-label fw-bold">Tambah Nutrisi</label>
                <div className="input-group">
                  <select
                    value={nutrientToAdd}
                    onChange={(e) => setNutrientToAdd(e.target.value)}
                    className={`form-select ${errors.nutrientToAdd ? "is-invalid" : ""}`}
                    disabled={submitting}
                  >
                    <option value="">Pilih Nutrisi</option>
                    {nutritions
                      .filter((n) => !selectedNutrients.some((sn) => sn.nutrisiId === n.id))
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.unit})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleAddNutrient}
                    disabled={!nutrientToAdd || submitting}
                  >
                    Tambah
                  </button>
                </div>
                {errors.nutrientToAdd && (
                  <div className="invalid-feedback d-block">{errors.nutrientToAdd}</div>
                )}
                {errors.nutrients && (
                  <div className="text-danger mt-2">{errors.nutrients}</div>
                )}
              </div>
              {selectedNutrients.length > 0 && (
                <div className="mb-3">
                  {selectedNutrients.map((nutrient) => (
                    <div key={nutrient.nutrisiId} className="mb-2 d-flex align-items-center">
                      <div className="flex-grow-1">
                        <label
                          htmlFor={`nutrient-${nutrient.nutrisiId}`}
                          className="form-label fw-bold"
                        >
                          {nutrient.name} ({nutrient.unit})
                        </label>
                        <input
                          type="number"
                          id={`nutrient-${nutrient.nutrisiId}`}
 aika
                          value={nutrient.amount}
                          onChange={(e) =>
                            handleNutrientChange(nutrient.nutrisiId, e.target.value)
                          }
                          className={`form-control ${
                            errors[`nutrient-${nutrient.nutrisiId}`] ? "is-invalid" : ""
                          }`}
                          min="0"
                          step="0.01"
                          placeholder={`Masukkan ${nutrient.name.toLowerCase()}`}
                          disabled={submitting}
                        />
                        {errors[`nutrient-${nutrient.nutrisiId}`] && (
                          <div className="invalid-feedback">
                            {errors[`nutrient-${nutrient.nutrisiId}`]}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => handleRemoveNutrient(nutrient.nutrisiId)}
                        aria-label={`Hapus ${nutrient.name}`}
                        disabled={submitting}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              )}
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFeedModal;