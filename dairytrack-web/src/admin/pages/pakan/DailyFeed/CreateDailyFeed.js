import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDailyFeedDetail } from "../../../../api/pakan/dailyFeedDetail";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { getCows } from "../../../../api/peternakan/cow";

const DailyFeedFormPage = ({ onDailyFeedAdded, onClose }) => {
  const [form, setForm] = useState({
    farmer_id: "",
    cow_id: "",
    date: "",
    session: ""
  });
  const [farmers, setFarmers] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmerData = await getFarmers();
        const cowData = await getCows();
        setFarmers(farmerData);
        setCows(cowData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate("/admin/pakan");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await createDailyFeedDetail(form);
      onDailyFeedAdded();
      handleClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Data Pakan Harian</h4>
            <button type="button" className="btn-close" onClick={handleClose} disabled={loading} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Peternak</label>
                <select name="farmer_id" className="form-control" value={form.farmer_id} onChange={handleChange} required>
                  <option value="">Pilih Peternak</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Sapi</label>
                <select name="cow_id" className="form-control" value={form.cow_id} onChange={handleChange} required>
                  <option value="">Pilih Sapi</option>
                  {cows.map((cow) => (
                    <option key={cow.id} value={cow.id}>{cow.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Tanggal</label>
                <input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Sesi</label>
                <input type="text" name="session" className="form-control" value={form.session} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyFeedFormPage;
