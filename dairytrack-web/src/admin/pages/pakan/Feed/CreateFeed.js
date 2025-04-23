import { useState, useEffect } from "react";
import { createFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import { getNutritions } from "../../../../api/pakan/nutrient";
import Swal from "sweetalert2";

const CreateFeedPage = ({ onFeedAdded, onClose }) => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [nutritions, setNutritions] = useState([]);
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    min_stock: 0,
    price: 0,
  });
  const [selectedNutrients, setSelectedNutrients] = useState([]); // [{ nutrisiId, amount }]
  const [nutrientToAdd, setNutrientToAdd] = useState(""); // Selected nutrient ID from dropdown
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch feed types
        const typeResponse = await getFeedTypes();
        console.log("getFeedTypes Response:", typeResponse);
        if (typeResponse.success && (typeResponse.feedTypes || typeResponse.jenisPakan)) {
          setFeedTypes(typeResponse.feedTypes || typeResponse.jenisPakan);
        } else {
          throw new Error("Jenis pakan tidak tersedia.");
        }

        // Fetch nutritions
        const nutritionResponse = await getNutritions();
        console.log("getNutritions Response:", nutritionResponse);
        if (nutritionResponse.success && nutritionResponse.nutrisi) {
          setNutritions(nutritionResponse.nutrisi);
        } else {
          throw new Error("Data nutrisi tidak tersedia.");
        }
      } catch (err) {
        setError(err.message || "Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "typeId"
          ? value
          : name === "min_stock" || name === "price"
          ? Number(value) || 0
          : value,
    }));
  };

  const handleNutrientChange = (nutrisiId, value) => {
    setSelectedNutrients((prev) =>
      prev.map((nutrient) =>
        nutrient.nutrisiId === nutrisiId
          ? { ...nutrient, amount: value ? Number(value) : "" }
          : nutrient
      )
    );
  };

  const handleAddNutrient = () => {
    if (!nutrientToAdd) {
      setError("Pilih nutrisi terlebih dahulu.");
      return;
    }
    if (selectedNutrients.some((n) => n.nutrisiId === Number(nutrientToAdd))) {
      setError("Nutrisi sudah dipilih.");
      return;
    }

    const nutrient = nutritions.find((n) => n.id === Number(nutrientToAdd));
    if (nutrient) {
      setSelectedNutrients((prev) => [
        ...prev,
        { nutrisiId: nutrient.id, amount: "", name: nutrient.name, unit: nutrient.unit },
      ]);
      setNutrientToAdd("");
      setError("");
    }
  };

  const handleRemoveNutrient = (nutrisiId) => {
    setSelectedNutrients((prev) => prev.filter((n) => n.nutrisiId !== nutrisiId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!form.typeId || !form.name || form.min_stock < 0 || form.price < 0) {
      setError("Jenis pakan, nama, stok minimum, dan harga wajib diisi dengan nilai valid.");
      return;
    }

    // Validate nutrients
    if (selectedNutrients.length === 0) {
      setError("Setidaknya satu nutrisi harus ditambahkan.");
      return;
    }
    const invalidNutrient = selectedNutrients.find(
      (n) => n.amount === "" || n.amount === null || n.amount < 0
    );
    if (invalidNutrient) {
      setError(`Masukkan nilai valid untuk ${invalidNutrient.name}.`);
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menambah pakan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, tambah",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);

    try {
      const nutrientRecords = selectedNutrients.map((n) => ({
        nutrisiId: n.nutrisiId,
        amount: Number(n.amount),
      }));

      const feedData = {
        typeId: Number(form.typeId),
        name: form.name,
        min_stock: Number(form.min_stock),
        price: Number(form.price),
        nutrients: nutrientRecords,
      };

      const response = await createFeed(feedData);
      console.log("createFeed Response:", response);

      if (response.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: response.message || "Pakan berhasil ditambahkan.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Reset form
        setForm({
          typeId: "",
          name: "",
          min_stock: 0,
          price: 0,
        });
        setSelectedNutrients([]);
        setNutrientToAdd("");
        onFeedAdded();
      } else {
        throw new Error(response.message || "Gagal menambahkan pakan.");
      }
    } catch (err) {
      console.error("Error:", err);
      await Swal.fire({
        title: "Gagal!",
        text: err.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tambah Pakan</h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status" />
                <p>Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Jenis Pakan</label>
                  <select
                    name="typeId"
                    value={form.typeId}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Pilih Jenis</option>
                    {feedTypes.map((ft) => (
                      <option key={ft.id} value={ft.id}>
                        {ft.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nama pakan"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Stok Minimum</label>
                  <input
                    type="number"
                    name="min_stock"
                    value={form.min_stock}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <h5 className="mb-3">Nutrisi</h5>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tambah Nutrisi</label>
                  <div className="input-group">
                    <select
                      value={nutrientToAdd}
                      onChange={(e) => setNutrientToAdd(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Pilih Nutrisi</option>
                      {nutritions
                        .filter(
                          (n) => !selectedNutrients.some((sn) => sn.nutrisiId === n.id)
                        )
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
                      disabled={!nutrientToAdd}
                    >
                      Tambah
                    </button>
                  </div>
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
                            value={nutrient.amount}
                            onChange={(e) =>
                              handleNutrientChange(nutrient.nutrisiId, e.target.value)
                            }
                            className="form-control"
                            min="0"
                            step="0.01"
                            placeholder={`Masukkan ${nutrient.name.toLowerCase()}`}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleRemoveNutrient(nutrient.nutrisiId)}
                          aria-label={`Hapus ${nutrient.name}`}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : null}
                    Simpan
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

export default CreateFeedPage;
