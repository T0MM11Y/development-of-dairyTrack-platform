import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFeedById, updateFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import Swal from "sweetalert2";

const FeedDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        const feedResponse = await getFeedById(id);
        if (feedResponse.success && feedResponse.feed) {
          setFeed(feedResponse.feed);
          // Set form data with feed data
          setForm({
            typeId: feedResponse.feed.typeId || "",
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
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validasi form kosong
    if (
      !form.typeId || !form.name || !form.protein ||
      !form.energy || !form.fiber || !form.minStock || !form.price
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
      id: parseInt(id),
      typeId: Number(form.typeId),
      name: form.name,
      protein: parseFloat(form.protein),
      energy: parseFloat(form.energy),
      fiber: parseFloat(form.fiber),
      min_stock: parseInt(form.minStock, 10),
      price: parseFloat(form.price),
    };
    
    try {
      const response = await updateFeed(feedData);
      
      if (response.success) {
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
          feedType: feedTypes.find(type => type.id === Number(form.typeId))
        });
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        throw new Error(response.message || "Gagal memperbarui data pakan.");
      }
    } catch (err) {
      console.error("Error:", err);
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

  const handleBack = () => {
    navigate("/admin/peternakan/pakan");
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading feed data...</p>
      </div>
    );
  }

  if (error && !feed) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? "Edit Pakan" : "Detail Pakan"}
        </h2>
        <div>
          <button
            className="btn btn-secondary me-2"
            onClick={handleBack}
          >
            Kembali
          </button>
          {!isEditing && (
            <button
              className="btn btn-primary"
              onClick={toggleEditMode}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Protein (%)</label>
                  <input
                    type="number"
                    name="protein"
                    value={form.protein}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Energi (kcal/kg)</label>
                  <input
                    type="number"
                    name="energy"
                    value={form.energy}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Serat (%)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={form.fiber}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Stok Minimum</label>
                  <input
                    type="number"
                    name="minStock"
                    value={form.minStock}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Harga</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="btn btn-success me-2" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
                <div className="col-md-3 fw-bold">Jenis Pakan</div>
                <div className="col-md-9">{feed.feedType?.name || "N/A"}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Nama</div>
                <div className="col-md-9">{feed.name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Protein</div>
                <div className="col-md-9">{feed.protein}%</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Energi</div>
                <div className="col-md-9">{feed.energy} kcal/kg</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Serat</div>
                <div className="col-md-9">{feed.fiber}%</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Stok Minimum</div>
                <div className="col-md-9">{feed.min_stock}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Harga</div>
                <div className="col-md-9">Rp {feed.price.toLocaleString('id-ID')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedDetailPage;