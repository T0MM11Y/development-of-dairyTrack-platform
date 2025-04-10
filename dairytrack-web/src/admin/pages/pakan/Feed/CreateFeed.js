import { useState, useEffect } from "react";
import { createFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import Swal from "sweetalert2";

const CreateFeedPage = ({ onFeedAdded, onClose }) => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    protein: "",
    energy: "",
    fiber: "",
    minStock: "",
    price: "",
  });
  
  const formatRupiah = (value) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('id-ID');
  };
  
  // Hilangkan titik dan ubah ke angka biasa
  const unformatRupiah = (value) => {
    return value.replace(/\D/g, '');
  };
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedTypes = async () => {
      try {
        const response = await getFeedTypes();
        if (response.success && response.feedTypes) {
          setFeedTypes(response.feedTypes);
        } else {
          throw new Error(response.message || "Jenis pakan tidak tersedia.");
        }
      } catch (err) {
        setError("Gagal mengambil data jenis pakan.");
        console.error("Error fetching feed types:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi form kosong - perbaikan untuk mengizinkan nilai 0
    if (
      form.typeId === "" ||
      form.name === "" ||
      form.protein === "" ||
      form.energy === "" ||
      form.fiber === "" ||
      form.minStock === "" ||
      form.price === ""
    ) {
      setError("Semua kolom wajib diisi.");
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

    const feedData = {
      typeId: Number(form.typeId),
      name: form.name,
      protein: parseFloat(form.protein),
      energy: parseFloat(form.energy),
      fiber: parseFloat(form.fiber),
      min_stock: parseInt(form.minStock, 10),
      price: parseFloat(form.price),
    };

    try {
      const response = await createFeed(feedData);

      if (response && response.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: response.message || "Pakan berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Reset form
        setForm({
          typeId: "",
          name: "",
          protein: "",
          energy: "",
          fiber: "",
          minStock: "",
          price: "",
        });

        // Jalankan callback dan tutup modal setelah berhasil
        if (typeof onFeedAdded === 'function') {
          onFeedAdded();
        }
        
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        throw new Error(response.message || "Gagal menambahkan pakan.");
      }
    } catch (err) {
      console.error("Error:", err);
      await Swal.fire({
        title: "Error!",
        text: err.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tambah Pakan</h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger">{error}</p>}
            {loading ? (
              <p>Memuat data jenis pakan...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label fw-bold">Jenis Pakan</label>
                  <select
                    name="typeId"
                    value={form.typeId}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Pilih Jenis</option>
                    {feedTypes.map((ft) => (
                      <option key={ft.id} value={ft.id}>
                        {ft.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nama pakan"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Protein (%)</label>
                  <input
                    type="number"
                    name="protein"
                    value={form.protein}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Energi (kcal/kg)</label>
                  <input
                    type="number"
                    name="energy"
                    value={form.energy}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Serat (%)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={form.fiber}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Stok Minimum</label>
                  <input
                    type="number"
                    name="minStock"
                    value={form.minStock}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold" htmlFor="price">
                    Harga
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">Rp</span>
                    <input
                      type="text"
                      name="price"
                      id="price"
                      value={formatRupiah(form.price)}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "price",
                            value: unformatRupiah(e.target.value),
                          },
                        })
                      }
                      className="form-control"
                      placeholder="Masukkan harga"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Batal
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