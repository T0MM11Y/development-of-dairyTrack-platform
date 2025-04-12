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
  const [feedItems, setFeedItems] = useState([]);
  const [isEditing, setIsEditing] = useState(true);

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
              setFeedItems(response.feedItems);
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

  const getAvailableFeedsForRow = (currentIndex) => {
    // Get feed_ids selected in other rows
    const selectedFeedIds = formList
      .map((item, index) => (index !== currentIndex && item.feed_id ? parseInt(item.feed_id) : null))
      .filter((id) => id !== null);

    // Return feeds that are not selected in other rows
    return feeds.filter((feed) => !selectedFeedIds.includes(feed.id));
  };

  const validateFeedItems = () => {
    // Check if at least one feed item is specified
    if (formList.length === 0) {
      setError("Silakan tambahkan minimal satu jenis pakan");
      Swal.fire({
        title: "Perhatian",
        text: "Silakan tambahkan minimal satu jenis pakan",
        icon: "warning"
      });
      return false;
    }

    // Check if all required fields are filled
    const hasEmptyFields = formList.some(item => 
      !item.feed_id || !item.quantity || parseFloat(item.quantity) <= 0
    );

    if (hasEmptyFields) {
      setError("Silakan lengkapi semua data pakan dan pastikan jumlah pakan lebih dari 0");
      Swal.fire({
        title: "Perhatian",
        text: "Silakan lengkapi semua data pakan dan pastikan jumlah pakan lebih dari 0",
        icon: "warning"
      });
      return false;
    }

    return true;
  };

  const getFeedStockInfo = (feedId) => {
    const feed = feeds.find(f => f.id === feedId);
    return feed ? feed.stock_quantity || 0 : 0;
  };

  const renderStockAvailability = (feedId) => {
    if (!feedId) return null;
    
    const feedIdNum = parseInt(feedId);
    const feed = feeds.find(f => f.id === feedIdNum);
    
    if (!feed) return null;
    
    return (
      <small className="form-text text-info">
        Stok tersedia: {feed.stock_quantity || 0} kg
      </small>
    );
  };

  const handleSave = async () => {
    try {
      // Tambahkan konfirmasi sebelum menyimpan
      const result = await Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin ingin menyimpan perubahan pada data pakan harian?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, simpan!",
        cancelButtonText: "Batal",
      });
  
      // Jika pengguna memilih "Batal", keluar dari fungsi
      if (!result.isConfirmed) {
        return;
      }
  
      setLoading(true);
      setError("");
  
      if (!validateFeedItems()) {
        setLoading(false);
        return;
      }
  
      // Check for duplicate feed items
      const feedIdCounts = {};
      formList.forEach((item) => {
        const feedId = item.feed_id;
        feedIdCounts[feedId] = (feedIdCounts[feedId] || 0) + 1;
      });
  
      const duplicateFeedIds = Object.keys(feedIdCounts).filter(
        (feedId) => feedIdCounts[feedId] > 1 && feedId !== ""
      );
  
      if (duplicateFeedIds.length > 0) {
        const duplicateFeedNames = duplicateFeedIds
          .map((feedId) => {
            const feed = feeds.find((f) => f.id === parseInt(feedId));
            return feed ? feed.name : `Feed ID: ${feedId}`;
          })
          .filter((name) => name);
  
        const errorMessage = `${duplicateFeedNames.join(
          ", "
        )} sudah dipilih lebih dari satu kali. Silakan pilih jenis pakan yang berbeda.`;
  
        setError(errorMessage);
        setLoading(false);
        Swal.fire({
          title: "Pakan Duplikat",
          text: errorMessage,
          icon: "warning",
        });
        return;
      }
  
      const newItems = formList.filter((item) => !item.id);
      const updatedItems = formList.filter((item) => item.id);
      let updatedFeedItems = [...feedItems];
  
      // Update processing code would go here
      // This function is replaced by handleSubmit in the actual implementation
      setLoading(false);
    } catch (error) {
      console.error("Error in handleSave:", error);
      setError(error.message || "Error saving feed items");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!validateFeedItems()) {
        setSubmitting(false);
        return;
      }

      // Check for duplicate feed items
      const feedIdCounts = {};
      formList.forEach((item) => {
        const feedId = item.feed_id;
        feedIdCounts[feedId] = (feedIdCounts[feedId] || 0) + 1;
      });

      const duplicateFeedIds = Object.keys(feedIdCounts).filter(
        (feedId) => feedIdCounts[feedId] > 1 && feedId !== ""
      );

      if (duplicateFeedIds.length > 0) {
        const duplicateFeedNames = duplicateFeedIds
          .map((feedId) => {
            const feed = feeds.find((f) => f.id === parseInt(feedId));
            return feed ? feed.name : `Feed ID: ${feedId}`;
          })
          .filter((name) => name);

        const errorMessage = `${duplicateFeedNames.join(
          ", "
        )} sudah dipilih lebih dari satu kali. Silakan pilih jenis pakan yang berbeda.`;

        setError(errorMessage);
        setSubmitting(false);
        Swal.fire({
          title: "Pakan Duplikat",
          text: errorMessage,
          icon: "warning",
        });
        return;
      }

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

                {isEditing ? (
                  <>
                    {formList.map((item, index) => (
                      <div className="row mb-3" key={item.id || `new-${index}`}>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            Jenis Pakan
                          </label>
                          <select
                            name="feed_id"
                            className="form-select"
                            value={item.feed_id}
                            onChange={(e) => handleChange(e, index)}
                            required
                            disabled={item.id} // Disable changing feed_id for existing items
                          >
                            <option value="">Pilih Pakan</option>
                            {(item.id ? feeds : getAvailableFeedsForRow(index)).map((feed) => (
                              <option key={feed.id} value={feed.id}>
                                {feed.name}
                              </option>
                            ))}
                          </select>
                          {renderStockAvailability(item.feed_id)}
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-bold">
                            Jumlah (kg)
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            className="form-control"
                            value={item.quantity}
                            onChange={(e) => handleChange(e, index)}
                            min="0.01"
                            step="0.01"
                            required
                          />
                          {item.feed_id &&
                            item.quantity &&
                            parseFloat(item.quantity) > getFeedStockInfo(parseInt(item.feed_id)) && (
                              <small className="form-text text-danger fw-bold">
                                Stok tidak mencukupi! Tersedia: {getFeedStockInfo(parseInt(item.feed_id))} kg
                              </small>
                            )}
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
                  </>
                ) : (
                  <>
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
                  </>
                )}

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