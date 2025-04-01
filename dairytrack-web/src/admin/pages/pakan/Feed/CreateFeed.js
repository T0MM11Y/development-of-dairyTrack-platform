import { useState, useEffect } from "react";
import { createFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";

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
          throw new Error("Data jenis pakan tidak tersedia.");
        }
      } catch (err) {
        console.error("Gagal mengambil data jenis pakan:", err);
        setError("Gagal mengambil data jenis pakan.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(""); // Reset error sebelum submit

    // Validasi sebelum dikirim
    if (!form.typeId || !form.name || !form.protein || !form.energy || !form.fiber || !form.minStock || !form.price) {
      setError("Semua kolom wajib diisi!");
      setSubmitting(false);
      return;
    }

    try {
      const feedData = {
        type_id: Number(form.typeId),
        name: form.name,
        protein: parseFloat(form.protein),
        energy: parseFloat(form.energy),
        fiber: parseFloat(form.fiber),
        minStock: parseInt(form.minStock, 10),
        price: parseFloat(form.price),
      };

      console.log("Mengirim data pakan:", feedData);

      const response = await createFeed(feedData);

      if (response.success) {
        if (onFeedAdded) onFeedAdded();
        onClose();
      } else {
        throw new Error(response.message || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("Gagal membuat data pakan:", err);
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Data Pakan</h4>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data jenis pakan...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Jenis Pakan</label>
                  <select name="typeId" value={form.typeId} onChange={handleChange} className="form-select" required>
                    <option value="">Pilih Jenis Pakan</option>
                    {feedTypes.map((feedType) => (
                      <option key={feedType.id} value={feedType.id}>
                        {feedType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Nama Pakan</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="form-control" placeholder="Masukkan nama pakan" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Protein (%)</label>
                  <input type="number" name="protein" value={form.protein} onChange={handleChange} required className="form-control" placeholder="Masukkan kandungan protein" min="0" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Energi (Kcal)</label>
                  <input type="number" name="energy" value={form.energy} onChange={handleChange} required className="form-control" placeholder="Masukkan kandungan energi" min="0" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Serat (%)</label>
                  <input type="number" name="fiber" value={form.fiber} onChange={handleChange} required className="form-control" placeholder="Masukkan kandungan serat" min="0" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Stock Minimum</label>
                  <input type="number" name="minStock" value={form.minStock} onChange={handleChange} required className="form-control" placeholder="Masukkan stock minimum" min="0" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Harga (Rp)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required className="form-control" placeholder="Masukkan harga pakan" min="0" />
                </div>

                <button type="submit" className="btn btn-info w-100" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedPage;
