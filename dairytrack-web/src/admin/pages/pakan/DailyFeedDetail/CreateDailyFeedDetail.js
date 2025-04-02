import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDailyFeedDetailById, createDailyFeedDetail, updateDailyFeedDetail } from "../../../../api/pakan/dailyFeedDetail";
import { getDailyFeedSession } from "../../../../api/pakan/session";
import { getFeeds } from "../../../../api/pakan/feed";

const DailyFeedDetailFormPage = ({ onDailyFeedDetailAdded, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [form, setForm] = useState({
    daily_feed_session_id: "",
    feed_id: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate("/admin/pakan/detail");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [sessionsResponse, feedsResponse] = await Promise.all([
          getDailyFeedSession(),
          getFeeds()
        ]);

        if (isMounted) {
          setSessions(sessionsResponse?.data || []);
          setFeeds(feedsResponse?.data || []);
        }

        if (isEdit && isMounted) {
          const detailResponse = await getDailyFeedDetailById(id);
          if (detailResponse?.success && detailResponse.data) {
            setForm(detailResponse.data);
          } else {
            setError("Gagal memuat data detail pakan");
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        if (isMounted) setError("Terjadi kesalahan saat memuat data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [id, isEdit]);

  const handleRetry = async () => {
    setError("");
    setLoading(true);
    
    try {
      const [sessionsResponse, feedsResponse] = await Promise.all([
        getDailyFeedSession(),
        getFeeds()
      ]);

      setSessions(sessionsResponse?.data || []);
      setFeeds(feedsResponse?.data || []);

      if (isEdit) {
        const detailResponse = await getDailyFeedDetailById(id);
        if (detailResponse?.success && detailResponse.data) {
          setForm(detailResponse.data);
        } else {
          setError("Gagal memuat data detail pakan");
        }
      }
    } catch (error) {
      console.error("Error in retry:", error);
      setError("Gagal memuat ulang data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      if (isEdit) {
        await updateDailyFeedDetail(id, form);
      } else {
        await createDailyFeedDetail(form);
      }
      onDailyFeedDetailAdded();
      handleClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              {isEdit ? "Edit" : "Tambah"} Data Detail Pakan Harian
            </h4>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose} 
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleRetry}
                >
                  Coba Lagi
                </button>
              </div>
            )}
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
                  <label className="form-label">Sesi Pakan Harian</label>
                  <select 
                    name="daily_feed_session_id" 
                    className="form-control" 
                    value={form.daily_feed_session_id} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Sesi</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Pakan</label>
                  <select 
                    name="feed_id" 
                    className="form-control" 
                    value={form.feed_id} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Pakan</option>
                    {feeds.map(feed => (
                      <option key={feed.id} value={feed.id}>{feed.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Jumlah</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    className="form-control" 
                    value={form.quantity} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyFeedDetailFormPage;
