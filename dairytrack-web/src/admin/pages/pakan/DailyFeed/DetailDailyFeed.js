import { useState, useEffect } from "react";
import { getDailyFeedById, updateDailyFeed } from "../../../../api/pakan/dailyFeed";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { getCows } from "../../../../api/peternakan/cow";
import Swal from "sweetalert2";

const DailyFeedDetailEdit = ({ feedId, onClose, onDailyFeedUpdated }) => {
  const [farmers, setFarmers] = useState([]);
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    farmerId: "",
    cowId: "",
    feedDate: "",
    session: "pagi",
    weather: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [farmerError, setFarmerError] = useState(false);
  const [cowError, setCowError] = useState(false);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.warn("onClose prop is not a function or not provided");
      // Fallback to original behavior if needed
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.style.display = "none";
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
        // Fetch feed details and reference data in parallel
        const [feedData, farmersData, cowsData] = await Promise.all([
          getDailyFeedById(feedId),
          getFarmers().catch(err => {
            console.error("Failed to fetch farmers:", err);
            setFarmerError(true);
            return [];
          }),
          getCows().catch(err => {
            console.error("Failed to fetch cows:", err);
            setCowError(true);
            return [];
          })
        ]);

        setFarmers(farmersData);
        setCows(cowsData);
        
        if (farmersData.length === 0) setFarmerError(true);
        if (cowsData.length === 0) setCowError(true);
        
        // Populate form with feed data
        if (feedData && feedData.data) {
          const feed = feedData.data;
          setForm({
            farmerId: feed.farmer_id.toString(),
            cowId: feed.cow_id.toString(),
            feedDate: feed.date,
            session: feed.session,
            weather: feed.weather || ""
          });
        } else {
          throw new Error("Could not retrieve feed data");
        }
        
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Terjadi kesalahan saat memuat data: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [feedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show confirmation dialog before saving
    const confirmResult = await Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin memperbarui data pakan harian ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, perbarui!',
      cancelButtonText: 'Batal'
    });
    
    if (!confirmResult.isConfirmed) {
      return;
    }
    
    setSubmitting(true);
    setError("");

    if (!form.farmerId || !form.cowId || !form.feedDate) {
      setError("Semua kolom wajib diisi!");
      setSubmitting(false);
      return;
    }

    try {
      const dailyFeedData = {
        farmer_id: Number(form.farmerId),
        cow_id: Number(form.cowId),
        date: form.feedDate,
        session: form.session,
        weather: form.weather
      };

      const response = await updateDailyFeed(feedId, dailyFeedData);

      if (response && (response.success || response.data)) {
        // Show success message
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data pakan harian berhasil diperbarui!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true
        });
        
        if (typeof onDailyFeedUpdated === 'function') {
          onDailyFeedUpdated();
        }
        handleClose();
      } else {
        throw new Error(response?.message || "Gagal memperbarui data.");
      }
    } catch (err) {
      console.error("Gagal memperbarui data pakan harian:", err);
      setError(err.message || "Terjadi kesalahan, coba lagi.");
      Swal.fire({
        title: 'Error!',
        text: err.message || "Terjadi kesalahan, coba lagi.",
        icon: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title text-info fw-bold">Detail & Edit Data Pakan Harian</h4>
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

              <div className="mb-3">
                <label className="form-label fw-bold">Sesi</label>
                <select
                  name="session"
                  value={form.session}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="pagi">Pagi</option>
                  <option value="siang">Siang</option>
                  <option value="sore">Sore</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Cuaca</label>
                <select
                  name="weather"
                  value={form.weather}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Pilih Cuaca</option>
                  <option value="cerah">Cerah</option>
                  <option value="berawan">Berawan</option>
                  <option value="hujan">Hujan</option>
                  <option value="hujan deras">Hujan Deras</option>
                </select>
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
  );
};

export default DailyFeedDetailEdit;