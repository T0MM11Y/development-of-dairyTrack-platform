import { useState, useEffect } from "react";
import { getFeedById, updateFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import Swal from "sweetalert2";

const FeedDetailPage = ({ id, onClose }) => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    protein: "",
    energy: "",
    fiber: "",
    minStock: "",
    price: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const typesResponse = await getFeedTypes();
        if (!typesResponse?.success || !typesResponse?.feedTypes) {
          throw new Error("Gagal mengambil data jenis pakan.");
        }
        setFeedTypes(typesResponse.feedTypes);

        const feedResponse = await getFeedById(id);
        if (!feedResponse?.success || !feedResponse?.feed) {
          throw new Error("Data pakan tidak ditemukan.");
        }

        const feed = feedResponse.feed;
        const formattedPrice = Math.round(Number(feed.price || 0)).toLocaleString('id-ID');
        
        setForm({
          typeId: feed.typeId?.toString() || "",
          name: feed.name || "",
          protein: Math.round(feed.protein || 0).toString(),
          energy: Math.round(feed.energy || 0).toString(),
          fiber: Math.round(feed.fiber || 0).toString(),
          minStock: Math.round(feed.min_stock || 0).toString(),
          price: formattedPrice,
        });
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = numericValue ? Number(numericValue).toLocaleString('id-ID') : '';
      setForm((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const requiredFields = ['typeId', 'name', 'protein', 'energy', 'fiber', 'minStock', 'price'];
    const emptyFields = requiredFields.filter(field => !form[field] || form[field].toString().trim() === '');
    
    if (emptyFields.length > 0) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    const confirm = await Swal.fire({
      title: 'Yakin ingin menyimpan perubahan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal',
    });
    
    if (!confirm.isConfirmed) return;
    
    setSubmitting(true);

    try {
      const priceValue = form.price.replace(/\./g, '');
      
      // Modified to match backend expectations - remove id from body
      const feedData = {
        typeId: parseInt(form.typeId),
        name: form.name.trim(),
        protein: parseFloat(form.protein),
        energy: parseFloat(form.energy),
        fiber: parseFloat(form.fiber),
        min_stock: parseInt(form.minStock),
        price: parseFloat(priceValue),
      };

      console.log("Sending feed data for update:", { id, ...feedData });

      // Assuming updateFeed accepts (id, data) parameters
      const response = await updateFeed(id, feedData);
      
      if (!response?.success) {
        throw new Error(response?.message || "Gagal memperbarui data pakan.");
      }

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Data pakan berhasil diperbarui.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      await Swal.fire({
        title: 'Error!',
        text: err.message || "Terjadi kesalahan saat menyimpan data.",
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Pakan</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Memuat data pakan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Pakan</h5>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label fw-bold">Jenis Pakan</label>
                <select
                  name="typeId"
                  value={form.typeId}
                  onChange={handleChange}
                  className="form-select"
                  disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
              <div className="mb-2">
                <label className="form-label fw-bold">Harga</label>
                <div className="input-group">
                  <span className="input-group-text">Rp</span>
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="0"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="mt-3">
                <button 
                  type="submit" 
                  className="btn btn-success me-2" 
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedDetailPage;