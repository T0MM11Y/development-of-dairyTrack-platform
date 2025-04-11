import React, { useState, useEffect } from "react";
import { getdailyFeedItemById, updatedailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getFeeds } from "../../../../api/pakan/feed";
import Swal from "sweetalert2";

const FeedItemDetailEditPage = ({ dailyFeedId, onClose, onUpdateSuccess }) => {
  const [formList, setFormList] = useState([{ feed_id: "", quantity: "" }]);
  const [feeds, setFeeds] = useState([]);
  const [dailyFeed, setDailyFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch feed options
        const feedResponse = await getFeeds();
        if (feedResponse.success && Array.isArray(feedResponse.feeds)) {
          setFeeds(feedResponse.feeds);
        } else {
          throw new Error("Invalid feed data received");
        }
        
        // Fetch current feed items for this daily feed
        const response = await getdailyFeedItemById(dailyFeedId);
        
        if (response.success) {
          setDailyFeed(response.dailyFeed);
          
          // If there are feed items, format them for the form
          if (response.feedItems && Array.isArray(response.feedItems)) {
            if (response.feedItems.length > 0) {
              setFormList(response.feedItems.map(item => ({
                id: item.id,
                feed_id: item.feed_id.toString(),
                quantity: item.quantity.toString()
              })));
            } else {
              // If no items, start with one empty form item
              setFormList([{ feed_id: "", quantity: "" }]);
            }
          } else {
            setFormList([{ feed_id: "", quantity: "" }]);
          }
        } else {
          throw new Error("Failed to fetch feed item details");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load feed item details");
      } finally {
        setLoading(false);
      }
    };

    if (dailyFeedId) {
      fetchData();
    }
  }, [dailyFeedId]);

  const handleChange = (e, index) => {
    const updatedFormList = [...formList];
    updatedFormList[index][e.target.name] = e.target.value;
    setFormList(updatedFormList);
  };

  const handleAddFeedItem = () => {
    // Check if we already have 3 feed items (maximum allowed)
    if (formList.length >= 3) {
      Swal.fire({
        title: "Perhatian",
        text: "Maksimal 3 jenis pakan untuk satu sesi",
        icon: "warning"
      });
      return;
    }
    setFormList([...formList, { feed_id: "", quantity: "" }]);
  };

  const handleRemoveFeedItem = (index) => {
    if (formList.length > 1) {
      const updatedFormList = [...formList];
      updatedFormList.splice(index, 1);
      setFormList(updatedFormList);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        daily_feed_id: dailyFeedId,
        feed_items: formList.map(({ id, feed_id, quantity }) => ({
          id: id || undefined, // Include ID only if it exists (for existing items)
          feed_id: Number(feed_id),
          quantity: Number(quantity)
        }))
      };
      
      const response = await updatedailyFeedItem(payload);
      
      if (response.success) {
        Swal.fire({
          title: "Berhasil!",
          text: "Data pakan harian berhasil diperbarui",
          icon: "success",
          timer: 1500
        });
        onUpdateSuccess && onUpdateSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Failed to update feed items");
      }
    } catch (error) {
      console.error("Error updating feed items:", error);
      setError(error.message || "Failed to update feed items");
    } finally {
      setSubmitting(false);
    }
  };

  // For debug only - remove in production
  const logDailyFeed = () => {
    console.log("Daily Feed Data:", dailyFeed);
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h4 className="modal-title fw-bold">Detail & Edit Pakan Harian</h4>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit}>
                  <div className="card mb-4 bg-light border-0">
                    <div className="card-body">
                      <h5 className="card-title mb-3 border-bottom pb-2">Informasi Pakan Harian</h5>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <div className="form-group">
                            <label className="form-label fw-bold text-secondary">Tanggal</label>
                            <input 
                              type="text" 
                              className="form-control"
                              value={dailyFeed?.date || "-"}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="form-group">
                            <label className="form-label fw-bold text-secondary">Peternak</label>
                            <input
                              type="text"
                              className="form-control"
                              value={dailyFeed?.farmer_name || "-"}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 className="fw-bold mb-3">Daftar Pakan</h5>
                  {formList.map((item, index) => (
                    <div className="row mb-3" key={index}>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Jenis Pakan</label>
                        <select
                          name="feed_id"
                          className="form-select"
                          value={item.feed_id}
                          onChange={(e) => handleChange(e, index)}
                          required
                        >
                          <option value="">-- Pilih Pakan --</option>
                          {feeds.map((feed) => (
                            <option key={feed.id} value={feed.id}>
                              {feed.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Jumlah (kg)</label>
                        <input
                          type="number"
                          name="quantity"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleChange(e, index)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        {formList.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveFeedItem(index)}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddFeedItem}
                    >
                      + Tambah Pakan
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={submitting}
                    >
                      {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedItemDetailEditPage;
