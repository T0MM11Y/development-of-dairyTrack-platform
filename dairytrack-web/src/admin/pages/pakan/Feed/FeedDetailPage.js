import { useState, useEffect } from "react";
import { getFeedById, updateFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import Swal from "sweetalert2";

const EditFeedModal = ({ feedId, onFeedUpdated, onClose }) => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch feed types
        const typesResponse = await getFeedTypes();
        if (typesResponse.success && typesResponse.feedTypes) {
          setFeedTypes(typesResponse.feedTypes);
        } else {
          throw new Error("Gagal mengambil data jenis pakan.");
        }
        
        // Fetch feed detail
        const feedResponse = await getFeedById(feedId);
        if (feedResponse.success && feedResponse.feed) {
          setFeed(feedResponse.feed);
          // Set form data with feed data
          setForm({
            typeId: feedResponse.feed.typeId?.toString() || "",
            name: feedResponse.feed.name || "",
            protein: feedResponse.feed.protein?.toString() || "",
            energy: feedResponse.feed.energy?.toString() || "",
            fiber: feedResponse.feed.fiber?.toString() || "",
            minStock: feedResponse.feed.min_stock?.toString() || "",
            price: feedResponse.feed.price?.toString() || "",
          });
        } else {
          throw new Error("Data pakan tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [feedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validasi form kosong
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
      title: 'Yakin ingin menyimpan perubahan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal',
    });
    
    if (!confirm.isConfirmed) return;
    
    setSubmitting(true);

    // Prepare feed data for update
    const feedData = {
      typeId: parseInt(form.typeId),
      name: form.name,
      protein: parseFloat(form.protein),
      energy: parseFloat(form.energy),
      fiber: parseFloat(form.fiber),
      min_stock: parseInt(form.minStock, 10),
      price: parseInt(form.price),
    };
    
    console.log("Sending update data:", feedData);
    
    try {
      // Pass feedId separately to match the API endpoint structure
      const response = await updateFeed(feedId, feedData);
      console.log("Update response:", response);
      
      if (response && response.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Data pakan berhasil diperbarui.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        // Update feed state with new data
        setFeed({
          ...feed,
          ...feedData,
          feedType: feedTypes.find(type => type.id === parseInt(form.typeId))
        });
        
        // Exit edit mode
        setIsEditing(false);
        
        // Call the callback function
        if (typeof onFeedUpdated === 'function') {
          onFeedUpdated();
        }
      } else {
        throw new Error(response?.message || "Gagal memperbarui data pakan.");
      }
    } catch (err) {
      console.error("Error updating feed:", err);
      await Swal.fire({
        title: 'Error!',
        text: err.message || "Terjadi kesalahan saat menyimpan data.",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditing ? "Edit Pakan" : "Detail Pakan"}
            </h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2">Memuat data pakan...</p>
              </div>
            ) : isEditing ? (
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
                    onClick={toggleEditMode}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Jenis Pakan</div>
                  <div className="col-md-8">{feed.feedType?.name || "N/A"}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Nama</div>
                  <div className="col-md-8">{feed.name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Protein</div>
                  <div className="col-md-8">{feed.protein}%</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Energi</div>
                  <div className="col-md-8">{feed.energy} kcal/kg</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Serat</div>
                  <div className="col-md-8">{feed.fiber}%</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Stok Minimum</div>
                  <div className="col-md-8">{feed.min_stock}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4 fw-bold">Harga</div>
                  <div className="col-md-8">Rp {feed.price.toLocaleString('id-ID')}</div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={toggleEditMode}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFeedModal;