import { useState, useEffect } from "react";
import { createdailyFeed } from "../../../../api/pakan/dailyFeed";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { getCows } from "../../../../api/peternakan/cow";

const CreateDailyFeedPage = ({ onDailyFeedAdded, onClose }) => {
  const [farmers, setFarmers] = useState([]);
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    farmerId: "",
    cowId: "",
    feedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [farmerError, setFarmerError] = useState(false);
  const [cowError, setCowError] = useState(false);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose(); // This will trigger the close function passed down as a prop
    } else {
      console.warn("onClose prop is not a function or not provided");
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.style.display = "none"; // Manually hide modal if no onClose prop is provided
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setFarmerError(false);
      setCowError(false);
      
      try {
        let farmersData = [];
        try {
          farmersData = await getFarmers();
          if (!farmersData || !Array.isArray(farmersData) || farmersData.length === 0) {
            console.error("Invalid farmers data format:", farmersData);
            setFarmerError(true);
          } else {
            setFarmers(farmersData);
          }
        } catch (err) {
          console.error("Failed to fetch farmers:", err);
          setFarmerError(true);
        }
        
        let cowsData = [];
        try {
          cowsData = await getCows();
          if (!cowsData || !Array.isArray(cowsData) || cowsData.length === 0) {
            console.error("Invalid cows data format:", cowsData);
            setCowError(true);
          } else {
            setCows(cowsData);
          }
        } catch (err) {
          console.error("Failed to fetch cows:", err);
          setCowError(true);
        }
        
        if (farmerError || cowError) {
          setError("Gagal mengambil data petani atau sapi.");
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [farmerError, cowError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.farmerId || !form.cowId || !form.feedDate) {
      setError("Semua kolom wajib diisi!");
      setSubmitting(false);
      return;
    }

    const confirmSubmit = window.confirm("Apakah Anda yakin ingin menambah data pakan harian ini?");
    if (!confirmSubmit) {
      setSubmitting(false);
      return;
    }

    try {
      const dailyFeedData = {
        farmer_id: Number(form.farmerId),
        cow_id: Number(form.cowId),
        date: form.feedDate,
      };

      console.log("Mengirim data pakan harian:", dailyFeedData);

      const response = await createdailyFeed(dailyFeedData);

      if (response && response.success) {
        alert("Data pakan harian berhasil ditambahkan!");
        if (typeof onDailyFeedAdded === 'function') {
          onDailyFeedAdded();
        }
        handleClose(); // Close modal after successful submission
        window.location.href = "/admin/pakan-harian"; // Redirect to the pakan-harian page
      } else {
        throw new Error((response && response.message) || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("Gagal membuat data pakan harian:", err);
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
            <h4 className="modal-title text-info fw-bold">Tambah Data Pakan Harian</h4>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose} 
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Petani</label>
                  <select 
                    name="farmerId" 
                    value={form.farmerId} 
                    onChange={handleChange} 
                    className={`form-select ${farmerError ? 'is-invalid' : ''}`} 
                    required
                    disabled={farmerError || farmers.length === 0}
                  >
                    <option value="">Pilih Petani</option>
                    {farmers.map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.first_name} {farmer.last_name}
                      </option>
                    ))}
                  </select>
                  {farmerError && (
                    <div className="invalid-feedback d-block">
                      Gagal memuat data petani. Silakan coba lagi.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Sapi</label>
                  <select 
                    name="cowId" 
                    value={form.cowId} 
                    onChange={handleChange} 
                    className={`form-select ${cowError ? 'is-invalid' : ''}`} 
                    required
                    disabled={cowError || cows.length === 0}
                  >
                    <option value="">Pilih Sapi</option>
                    {cows.map((cow) => (
                      <option key={cow.id} value={cow.id}>
                        {cow.name}
                      </option>
                    ))}
                  </select>
                  {cowError && (
                    <div className="invalid-feedback d-block">
                      Gagal memuat data sapi. Silakan coba lagi.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Tanggal</label>
                  <input 
                    type="date" 
                    name="feedDate" 
                    value={form.feedDate} 
                    onChange={handleChange} 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-info" 
                    disabled={submitting || farmerError || cowError}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Menyimpan...
                      </>
                    ) : "SIMPAN"}
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

export default CreateDailyFeedPage;
