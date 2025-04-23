import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createdailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getFeeds } from "../../../../api/pakan/feed";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import { getCows } from "../../../../api/peternakan/cow";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

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
  const [cowNames, setCowNames] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          dailyFeedResponse,
          feedResponse,
          stockResponse,
          cowsResponse,
        ] = await Promise.all([
          getAllDailyFeeds().catch((err) => {
            console.error("getAllDailyFeeds error:", err);
            return { success: false, data: [] };
          }),
          getFeeds().catch((err) => {
            console.error("getFeeds error:", err);
            return { success: false, feeds: [] };
          }),
          getFeedStock().catch((err) => {
            console.error("getFeedStock error:", err);
            return { success: false, stocks: [] };
          }),
          getCows().catch((err) => {
            console.error("getCows error:", err);
            return [];
          }),
        ]);

        console.log("Daily Feed Response:", dailyFeedResponse);
        console.log("Feed Response:", feedResponse);
        console.log("Feed Stock Response:", stockResponse);
        console.log("Cows Response:", cowsResponse);

        // Handle cow data
        const cowMap = Object.fromEntries(
          cowsResponse.map((cow) => [cow.id, cow.name])
        );
        setCowNames(cowMap);
        console.log("cowMap:", cowMap);

        // Handle daily feeds
        let validDailyFeeds = [];
        if (dailyFeedResponse.success && Array.isArray(dailyFeedResponse.data)) {
          // Use all daily feeds, even if cow_id is invalid (we'll handle cow names later)
          validDailyFeeds = dailyFeedResponse.data;
          console.log("validDailyFeeds:", validDailyFeeds);

          if (validDailyFeeds.length === 0) {
            console.warn("No daily feeds found.");
            setDailyFeeds([]);
            setError("Tidak ada sesi pakan harian yang tersedia. Silakan buat sesi pakan harian terlebih dahulu.");
          } else {
            setDailyFeeds(validDailyFeeds);
          }

          // Check for missing cow_ids and log a warning
          const missingCowIds = [...new Set(validDailyFeeds.map(feed => feed.cow_id))]
            .filter(cowId => !cowMap.hasOwnProperty(cowId));
          if (missingCowIds.length > 0) {
            console.warn("Some daily feeds have cow_ids not found in cowMap:", missingCowIds);
            setError("Beberapa sesi pakan harian memiliki ID sapi yang tidak ditemukan. Pastikan data sapi tersedia untuk ID: " + missingCowIds.join(", "));
          }
        } else {
          console.error("Invalid daily feed data received");
          setDailyFeeds([]);
          setError("Gagal memuat data sesi pakan harian.");
        }

        // Handle feed stocks
        if (stockResponse.success && Array.isArray(stockResponse.stocks)) {
          setFeedStocks(stockResponse.stocks);
        } else {
          console.error("Invalid feed stock data received");
          setFeedStocks([]);
        }

        // Handle feeds
        if (feedResponse.success && Array.isArray(feedResponse.feeds)) {
          setFeeds(feedResponse.feeds);
        } else {
          console.error("Invalid feed data received");
          setFeeds([]);
        }

        // Filter available daily feeds
        filterAvailableDailyFeeds(validDailyFeeds, cowMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Gagal memuat data yang diperlukan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterAvailableDailyFeeds = (dailyFeedsData, cowMap) => {
    try {
      // Normalize today's date to YYYY-MM-DD format
      const today = new Date();
      const todayISO = today.toISOString().split("T")[0]; // e.g., "2025-04-23"
      console.log("Today ISO:", todayISO);

      // Count feed items per daily feed using DailyFeedItems from the response
      const feedItemCounts = {};
      dailyFeedsData.forEach((feed) => {
        const itemCount = Array.isArray(feed.DailyFeedItems) ? feed.DailyFeedItems.length : 0;
        feedItemCounts[feed.id] = itemCount;
      });
      console.log("Feed Item Counts:", feedItemCounts);

      // Filter daily feeds
      const validDailyFeeds = dailyFeedsData.filter((feed) => {
        // Normalize feed date to YYYY-MM-DD format
        let feedDateISO;
        try {
          const feedDate = new Date(feed.date);
          if (isNaN(feedDate.getTime())) {
            throw new Error("Invalid date format");
          }
          feedDateISO = feedDate.toISOString().split("T")[0]; // e.g., "2025-04-23"
        } catch (err) {
          console.error(`Invalid date for feed ID ${feed.id}:`, feed.date);
          return false; // Skip this feed if the date is invalid
        }

        console.log(`Feed ID: ${feed.id}, Feed Date ISO: ${feedDateISO}`);

        const isValidDate = feedDateISO >= todayISO;
        const itemCount = feedItemCounts[feed.id] || 0;
        const hasSpaceForMore = itemCount < 3;

        const cowName = cowMap[feed.cow_id] || `Sapi ID: ${feed.cow_id}`;

        console.log(
          `Feed ID: ${feed.id}, Date: ${feedDateISO}, Items: ${itemCount}/3, Cow: ${cowName}, Date Valid: ${isValidDate}, Space Valid: ${hasSpaceForMore}`
        );

        return isValidDate && hasSpaceForMore;
      });

      console.log("Valid Daily Feeds after filtering:", validDailyFeeds);

      // Enhance daily feeds with cow names and item counts
      const enhancedDailyFeeds = validDailyFeeds.map((feed) => {
        const cowName = cowMap[feed.cow_id] || `Sapi ID: ${feed.cow_id}`;
        const itemCount = feedItemCounts[feed.id] || 0;

        return {
          ...feed,
          cowName,
          itemCount,
        };
      });

      setAvailableDailyFeeds(enhancedDailyFeeds);

      if (enhancedDailyFeeds.length === 0 && !error) {
        setError(
          "Tidak ada sesi pakan harian yang tersedia untuk tanggal saat ini atau masa depan dengan kurang dari 3 pakan. Silakan buat sesi pakan harian terlebih dahulu."
        );
      }
    } catch (error) {
      console.error("Error filtering daily feeds:", error);
      setAvailableDailyFeeds([]);
      setError("Gagal memfilter sesi pakan harian yang tersedia.");
    }
  };

  useEffect(() => {
    if (selectedDailyFeedId) {
      const details = availableDailyFeeds.find(
        (feed) => feed.id === parseInt(selectedDailyFeedId)
      );
      setSelectedDailyFeedDetails(details);
    } else {
      setSelectedDailyFeedDetails(null);
    }
  }, [selectedDailyFeedId, availableDailyFeeds]);

  const handleChange = (e, index) => {
    const updatedFormList = [...formList];
    updatedFormList[index][e.target.name] = e.target.value;
    setFormList(updatedFormList);
  };

  const handleAddFeedItem = () => {
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

  const getFeedStockInfo = (feedId) => {
    const feedStock = feedStocks.find((stock) => stock.feed?.id === parseInt(feedId));
    return feedStock?.stock || 0;
  };

  const getAvailableFeedsForRow = (currentIndex) => {
    const selectedFeedIds = formList
      .map((item, index) => (index !== currentIndex && item.feed_id ? parseInt(item.feed_id) : null))
      .filter((id) => id !== null);
    return feeds.filter((feed) => !selectedFeedIds.includes(feed.id));
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

      const insufficientStockItems = feedItemsWithStock.filter(
        (item) => item.requestedQuantity > item.availableStock
      );

      if (insufficientStockItems.length > 0) {
        const insufficientMessages = insufficientStockItems.map((item) => {
          const feedName =
            feeds.find((f) => f.id === item.feedId)?.name || `Feed ID: ${item.feedId}`;
          return `- ${feedName}: Tersedia ${item.availableStock} kg, diminta ${item.requestedQuantity} kg`;
        });

        setError(
          `Stok tidak mencukupi untuk beberapa pakan:\n${insufficientMessages.join("\n")}`
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

      const payload = {
        daily_feed_id: parseInt(selectedDailyFeedId),
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

      if (error.message.includes("Beberapa jenis pakan sudah ada dalam sesi ini")) {
        setError(error.message);
        Swal.fire({
          title: "Pakan Sudah Ada",
          text: error.message,
          icon: "warning",
        });
      } else {
        setError(error.message || "Failed to save feed items");
        Swal.fire({
          title: "Error",
          text: error.message || "Gagal menyimpan data pakan",
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStockAvailability = (feedId) => {
    if (!feedId) return null;

    const stock = getFeedStockInfo(feedId);
    return (
      <div className="form-text fw-bold fs-5 text-primary">
        Stok tersedia: <strong>{stock} kg</strong>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatSession = (session) => {
    if (!session) return "-";
    return session.charAt(0).toUpperCase() + session.slice(1);
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-info">
              {t("dailyfeed.add_daily_feed_button")}
            </h5>
            <button
              className="btn-close"
              onClick={() => onClose?.() || navigate("/admin/item-pakan-harian")}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">{t("dailyfeed.loading_data")}...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    {t("dailyfeed.daily_feed_session")}
                  </label>
                  <select
                    className="form-select"
                    value={selectedDailyFeedId}
                    onChange={(e) => setSelectedDailyFeedId(e.target.value)}
                    required
                  >
                    <option value="">{t("dailyfeed.select_daily_feed_session")}</option>
                    {availableDailyFeeds.length === 0 ? (
                      <option value="" disabled>
                        Tidak ada sesi yang tersedia - buat sesi pakan harian terlebih dahulu
                      </option>
                    ) : (
                      availableDailyFeeds.map((df) => (
                        <option key={df.id} value={df.id}>
                          {formatDate(df.date)} - Sesi {formatSession(df.session)} - {df.cowName} (
                          {df.itemCount}/3 pakan)
                        </option>
                      ))
                    )}
                  </select>
                  <small className="form-text text-muted">
                    {t("dailyfeed.session_info")}
                  </small>
                </div>

                {selectedDailyFeedDetails && (
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label text-secondary">
                          {t("dailyfeed.date")}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-white"
                          value={formatDate(selectedDailyFeedDetails.date) || ""}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label text-secondary">
                          {t("dailyfeed.session")}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-white"
                          value={formatSession(selectedDailyFeedDetails.session) || ""}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label text-secondary">
                          {t("dailyfeed.cow")}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-white"
                          value={selectedDailyFeedDetails.cowName}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formList.map((item, index) => (
                  <div className="row mb-3" key={index}>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        {t("dailyfeed.feed_type")}
                      </label>
                      <select
                        name="feed_id"
                        className="form-select"
                        value={item.feed_id}
                        onChange={(e) => handleChange(e, index)}
                        required
                      >
                        <option value="">Pilih Pakan</option>
                        {getAvailableFeedsForRow(index).map((feed) => (
                          <option key={feed.id} value={feed.id}>
                            {feed.name}
                          </option>
                        ))}
                      </select>
                      {item.feed_id && renderStockAvailability(item.feed_id)}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        {t("dailyfeed.quantity")} (kg)
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
                        parseFloat(item.quantity) > getFeedStockInfo(item.feed_id) && (
                          <small className="form-text text-danger fw-bold">
                            {t("dailyfeed.insufficient_stock")}: {getFeedStockInfo(item.feed_id)} kg
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
                          {t("dailyfeed.delete")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="mb-4 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={handleAddFeedItem}
                    disabled={formList.length >= 3}
                  >
                    + {t("dailyfeed.add_feed")} {formList.length >= 3 ? " (Maksimum)" : ""}
                  </button>
                </div>

                <button type="submit" className="btn btn-info w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Menyimpan...
                    </>
                  ) : (
                    "Tambah"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedItemFormPage;