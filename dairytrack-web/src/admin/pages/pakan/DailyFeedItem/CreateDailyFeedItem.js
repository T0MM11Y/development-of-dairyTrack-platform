import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createdailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getFeeds } from "../../../../api/pakan/feed";
import { getAllDailyFeedDetails } from "../../../../api/pakan/dailyFeedDetail";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import Swal from "sweetalert2";

const FeedItemFormPage = ({ onFeedItemAdded, onClose }) => {
  const [formList, setFormList] = useState([{ feed_id: "", quantity: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [availableDailyFeeds, setAvailableDailyFeeds] = useState([]);
  const [selectedDailyFeedId, setSelectedDailyFeedId] = useState("");
  const [selectedDailyFeedDetails, setSelectedDailyFeedDetails] = useState(null);
  const [feedStocks, setFeedStocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Fetch all daily feeds
        const dailyFeedResponse = await getAllDailyFeedDetails();
        console.log("Daily Feed Response:", dailyFeedResponse);
        
        if (dailyFeedResponse.success && Array.isArray(dailyFeedResponse.data)) {
          setDailyFeeds(dailyFeedResponse.data);
  
          const today = new Date().toISOString().split('T')[0];
  
          // Process daily feeds and filter valid ones
          const validDailyFeeds = dailyFeedResponse.data.filter((feed) => {
            // Check if the date is today or later
            const feedDate = new Date(feed.date).toISOString().split('T')[0];
            const isValidDate = feedDate >= today;
            
            // Get feed items count with better validation
            let feedItemCount = 0;
            if (feed.feed_items) {
              // Make sure feed_items is an array and count its length
              feedItemCount = Array.isArray(feed.feed_items) ? feed.feed_items.length : 0;
              
              // Additional check if feed_items is not null but might be a string or object
              if (!Array.isArray(feed.feed_items) && feed.feed_items) {
                try {
                  // Try parsing if it's potentially a JSON string
                  const parsedItems = typeof feed.feed_items === 'string' 
                    ? JSON.parse(feed.feed_items) 
                    : feed.feed_items;
                  
                  feedItemCount = Array.isArray(parsedItems) ? parsedItems.length : 0;
                } catch (e) {
                  console.error("Error parsing feed_items:", e);
                  feedItemCount = 0;
                }
              }
            }
            
            // Debug logging to track values
            console.log(`Feed ID: ${feed.id}, Date: ${feedDate}, Items: ${feedItemCount}, Cow: ${feed.cow?.name || 'No Cow Info'}`);
  
            // Only include feeds with less than 3 items
            const hasSpaceForMore = feedItemCount < 3;
  
            return isValidDate && hasSpaceForMore;
          });
          
          console.log("Valid Daily Feeds:", validDailyFeeds);
          setAvailableDailyFeeds(validDailyFeeds);
        } else {
          throw new Error("Invalid daily feed data received");
        }
  
        // Fetch feed stock data
        const stockResponse = await getFeedStock();
        if (stockResponse.success && Array.isArray(stockResponse.stocks)) {
          setFeedStocks(stockResponse.stocks);
        } else {
          throw new Error("Invalid feed stock data received");
        }
  
        // Fetch feed options
        const feedResponse = await getFeeds();
        if (feedResponse.success && Array.isArray(feedResponse.feeds)) {
          setFeeds(feedResponse.feeds);
        } else {
          throw new Error("Invalid feed data received");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch required data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Update selected daily feed details when selection changes
  useEffect(() => {
    if (selectedDailyFeedId) {
      const details = dailyFeeds.find(
        (feed) => feed.id === selectedDailyFeedId
      );
      setSelectedDailyFeedDetails(details);
    } else {
      setSelectedDailyFeedDetails(null);
    }
  }, [selectedDailyFeedId, dailyFeeds]);

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
        icon: "warning",
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

  // Get stock information for a feed
  const getFeedStockInfo = (feedId) => {
    const feedStock = feedStocks.find(
      (stock) => stock.feed?.id === parseInt(feedId)
    );
    return feedStock?.stock || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedDailyFeedId) {
      setError("Silakan pilih sesi pakan harian terlebih dahulu.");
      setLoading(false);
      return;
    }

    try {
      // Check stock availability for each feed item
      const feedItemsWithStock = formList.map((item) => {
        const feedId = parseInt(item.feed_id);
        const requestedQuantity = parseFloat(item.quantity);
        const availableStock = getFeedStockInfo(feedId);

        return {
          ...item,
          feedId,
          requestedQuantity,
          availableStock,
        };
      });

      // Check if any feed items exceed available stock
      const insufficientStockItems = feedItemsWithStock.filter(
        (item) => item.requestedQuantity > item.availableStock
      );

      if (insufficientStockItems.length > 0) {
        // Create error message for insufficient stock
        const insufficientMessages = insufficientStockItems.map((item) => {
          const feedName =
            feeds.find((f) => f.id === item.feedId)?.name ||
            `Feed ID: ${item.feedId}`;
          return `- ${feedName}: Tersedia ${item.availableStock} kg, diminta ${item.requestedQuantity} kg`;
        });

        setError(
          `Stok tidak mencukupi untuk beberapa pakan:\n${insufficientMessages.join(
            "\n"
          )}`
        );
        setLoading(false);
        Swal.fire({
          title: "Stok Tidak Mencukupi",
          html: `Stok tidak mencukupi untuk beberapa pakan:<br>${insufficientMessages
            .map((msg) => msg.replace("- ", ""))
            .join("<br>")}`,
          icon: "error",
        });
        return;
      }

      // Check for duplicate feed types
      const uniqueFeedIds = new Set(formList.map((item) => item.feed_id));
      if (uniqueFeedIds.size !== formList.length) {
        setError(
          "Terdapat jenis pakan yang sama dalam permintaan. Pilih jenis pakan yang berbeda."
        );
        setLoading(false);
        Swal.fire({
          title: "Jenis Pakan Duplikat",
          text: "Terdapat jenis pakan yang sama dalam permintaan. Pilih jenis pakan yang berbeda.",
          icon: "warning",
        });
        return;
      }

      const payload = {
        daily_feed_id: selectedDailyFeedId,
        feed_items: formList.map(({ feed_id, quantity }) => ({
          feed_id: Number(feed_id),
          quantity: Number(quantity),
        })),
      };

      const response = await createdailyFeedItem(payload);

      if (response.success) {
        Swal.fire({
          title: "Berhasil!",
          text: "Data pakan harian berhasil ditambahkan",
          icon: "success",
          timer: 1500,
        });
        onFeedItemAdded?.();
        onClose?.() || navigate("/admin/item-pakan-harian");
      } else {
        // Improved error handling for the '3 feeds max' case
        if (response.message && response.message.includes("3 jenis pakan")) {
          Swal.fire({
            title: "Batas Maksimum",
            text: response.message,
            icon: "warning",
          });
        } else {
          throw new Error(response.message || "Failed to save feed items");
        }
      }
    } catch (error) {
      console.error("Error submitting feed items:", error);
      setError(error.message || "Failed to save feed items");
      Swal.fire({
        title: "Error",
        text: error.message || "Gagal menyimpan data pakan",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to display stock availability for selected feed
  const renderStockAvailability = (feedId) => {
    if (!feedId) return null;

    const stock = getFeedStockInfo(feedId);
    const feedName = feeds.find((f) => f.id === parseInt(feedId))?.name || "";

    return (
      <div className="form-text fw-bold fs-5 text-primary">
        Stok tersedia: <strong>{stock} kg</strong>
      </div>
    );
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h4 className="modal-title fw-bold">Tambah Pakan Harian</h4>
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                onClose?.() || navigate("/admin/item-pakan-harian")
              }
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
              <form onSubmit={handleSubmit}>
                <div className="card mb-4 bg-light border-0">
                  <div className="card-body">
                    <h5 className="card-title mb-3 border-bottom pb-2">
                      Informasi Pakan Harian
                    </h5>

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Sesi Pakan Harian
                      </label>
                      <select
                        className="form-select"
                        value={selectedDailyFeedId}
                        onChange={(e) => setSelectedDailyFeedId(e.target.value)}
                        required
                      >
                        <option value="">Pilih Sesi Pakan</option>
                        {availableDailyFeeds.length === 0 ? (
                          <option value="" disabled>
                            Tidak ada sesi pakan yang tersedia
                          </option>
                        ) : (
                          availableDailyFeeds.map((df) => {
                            // Always display cow name correctly
                            const cowName = df.cow?.name || "Tidak Ada Info Sapi";
                            // Ensure feed_items is properly accessed
                            const feedItemCount = df.feed_items && Array.isArray(df.feed_items) 
                              ? df.feed_items.length 
                              : 0;
                              
                            return (
                              <option key={df.id} value={df.id}>
                                {df.date} - Sesi {df.session} - {cowName} ({feedItemCount}/3 pakan)
                              </option>
                            );
                          })
                        )}
                      </select>
                      <small className="form-text text-muted">
                        Hanya menampilkan sesi pakan untuk hari ini dan
                        setelahnya yang belum memiliki 3 jenis pakan
                      </small>
                    </div>

                    {selectedDailyFeedDetails && (
                      <div className="row mt-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label text-secondary">
                              Tanggal
                            </label>
                            <input
                              type="text"
                              className="form-control bg-white"
                              value={selectedDailyFeedDetails.date || ""}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label text-secondary">
                              Sesi
                            </label>
                            <input
                              type="text"
                              className="form-control bg-white"
                              value={selectedDailyFeedDetails.session || ""}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label text-secondary">
                              Sapi
                            </label>
                            <input
                              type="text"
                              className="form-control bg-white"
                              value={
                                selectedDailyFeedDetails.cow?.name ||
                                "Tidak Ada Info Sapi"
                              }
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h5 className="card-title mb-3 border-bottom pb-2">
                      Detail Pakan
                    </h5>

                    {formList.map((item, index) => (
                      <div className="row mb-3" key={index}>
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
                          >
                            <option value="">Pilih Pakan</option>
                            {feeds.map((feed) => (
                              <option key={feed.id} value={feed.id}>
                                {feed.name}
                              </option>
                            ))}
                          </select>
                          {item.feed_id &&
                            renderStockAvailability(item.feed_id)}
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
                            parseFloat(item.quantity) >
                              getFeedStockInfo(item.feed_id) && (
                              <small className="form-text text-danger fw-bold">
                                Stok tidak mencukupi! Tersedia:{" "}
                                {getFeedStockInfo(item.feed_id)} kg
                              </small>
                            )}
                        </div>

                        <div className="col-md-2 d-flex align-items-end">
                          {formList.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger me-2"
                              onClick={() => handleRemoveFeedItem(index)}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={handleAddFeedItem}
                        disabled={formList.length >= 3}
                      >
                        + Tambah Pakan
                        {formList.length >= 3 ? " (Maksimum)" : ""}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-info text-white"
                    disabled={loading}
                  >
                    Simpan
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

export default FeedItemFormPage;