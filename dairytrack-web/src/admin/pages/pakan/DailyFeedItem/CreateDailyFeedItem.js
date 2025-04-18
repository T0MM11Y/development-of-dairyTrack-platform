import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createdailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getFeeds } from "../../../../api/pakan/feed";
import { getAllDailyFeedDetails } from "../../../../api/pakan/dailyFeedDetail";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import { getAlldailyFeedItems } from "../../../../api/pakan/dailyFeedItem";
import { getCows } from "../../../../api/peternakan/cow";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";


const FeedItemFormPage = ({ onFeedItemAdded, onClose }) => {
  const [formList, setFormList] = useState([{ feed_id: "", quantity: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
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
          feedItemsResponse,
          cowsResponse,
        ] = await Promise.all([
          getAllDailyFeedDetails(),
          getFeeds(),
          getFeedStock(),
          getAlldailyFeedItems(),
          getCows(),
        ]);

        console.log("Daily Feed Response:", dailyFeedResponse);
        console.log("Feed Items Response:", feedItemsResponse);
        console.log("Cows Response:", cowsResponse);

        const cowMap = {};
        if (Array.isArray(cowsResponse)) {
          cowsResponse.forEach((cow) => {
            cowMap[cow.id] = cow.name;
          });
        }
        setCowNames(cowMap);

        if (dailyFeedResponse.success && Array.isArray(dailyFeedResponse.data)) {
          setDailyFeeds(dailyFeedResponse.data);
        } else {
          throw new Error("Invalid daily feed data received");
        }

        if (feedItemsResponse.success && Array.isArray(feedItemsResponse.data)) {
          setFeedItems(feedItemsResponse.data);
        } else {
          console.error("Invalid feed items data received");
          setFeedItems([]);
        }

        if (stockResponse.success && Array.isArray(stockResponse.stocks)) {
          setFeedStocks(stockResponse.stocks);
        } else {
          throw new Error("Invalid feed stock data received");
        }

        if (feedResponse.success && Array.isArray(feedResponse.feeds)) {
          setFeeds(feedResponse.feeds);
        } else {
          throw new Error("Invalid feed data received");
        }

        filterAvailableDailyFeeds(dailyFeedResponse.data, feedItemsResponse.data, cowMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch required data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterAvailableDailyFeeds = (dailyFeedsData, feedItemsData, cowMap) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const feedItemCounts = {};
      if (Array.isArray(feedItemsData)) {
        feedItemsData.forEach((item) => {
          const dailyFeedId = item.daily_feed_id;
          if (!feedItemCounts[dailyFeedId]) {
            feedItemCounts[dailyFeedId] = 0;
          }
          feedItemCounts[dailyFeedId]++;
        });
      }

      console.log("Feed Item Counts:", feedItemCounts);

      const validDailyFeeds = dailyFeedsData.filter((feed) => {
        const feedDate = new Date(feed.date).toISOString().split("T")[0];
        const isValidDate = feedDate >= today;
        const itemCount = feedItemCounts[feed.id] || 0;
        const hasSpaceForMore = itemCount < 3;

        const cowName =
          feed.cow && feed.cow.name
            ? feed.cow.name
            : feed.cow_id && cowMap[feed.cow_id]
            ? cowMap[feed.cow_id]
            : feed.cow_id
            ? `Sapi #${feed.cow_id}`
            : "Tidak Ada Info Sapi";

        console.log(
          `Feed ID: ${feed.id}, Date: ${feedDate}, Items: ${itemCount}/3, Cow: ${cowName}, Valid: ${isValidDate && hasSpaceForMore}`
        );

        return isValidDate && hasSpaceForMore;
      });

      console.log("Valid Daily Feeds:", validDailyFeeds);

      const enhancedDailyFeeds = validDailyFeeds.map((feed) => {
        const cowName =
          feed.cow && feed.cow.name
            ? feed.cow.name
            : feed.cow_id && cowMap[feed.cow_id]
            ? cowMap[feed.cow_id]
            : feed.cow_id
            ? `Sapi #${feed.cow_id}`
            : "Tidak Ada Info Sapi";
        const itemCount = feedItemCounts[feed.id] || 0;

        return {
          ...feed,
          cowName,
          itemCount,
        };
      });

      setAvailableDailyFeeds(enhancedDailyFeeds);
    } catch (error) {
      console.error("Error filtering daily feeds:", error);
      setAvailableDailyFeeds([]);
    }
  };

  useEffect(() => {
    if (selectedDailyFeedId) {
      const details = availableDailyFeeds.find((feed) => feed.id === selectedDailyFeedId);
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

  // New function to get available feeds for a given row
  const getAvailableFeedsForRow = (currentIndex) => {
    // Get feed_ids selected in other rows
    const selectedFeedIds = formList
      .map((item, index) => (index !== currentIndex && item.feed_id ? parseInt(item.feed_id) : null))
      .filter((id) => id !== null);

    // Return feeds that are not selected in other rows
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

      // Check for duplicate feed items (optional, since dropdowns prevent duplicates)
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

      // Handle backend duplicate feed error
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
            <h5 className="modal-title fw-bold text-info">{t('dailyfeed.add_daily_feed_button')}
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
                <p className="mt-2">{t('dailyfeed.loading_data')}
                ...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold">{t('dailyfeed.daily_feed_session')}
                  </label>
                  <select
                    className="form-select"
                    value={selectedDailyFeedId}
                    onChange={(e) => setSelectedDailyFeedId(e.target.value)}
                    required
                  >
                    <option value="">{t('dailyfeed.select_daily_feed_session')}
                    </option>
                    {availableDailyFeeds.length === 0 ? (
                      <option value="" disabled>
                        {t('dailyfeed.no_session_available')}

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
                  {t('dailyfeed.session_info')}

                  </small>
                </div>

                {selectedDailyFeedDetails && (
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label text-secondary">{t('dailyfeed.date')}
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
                        <label className="form-label text-secondary">{t('dailyfeed.session')}
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
                        <label className="form-label text-secondary">{t('dailyfeed.cow')}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-white"
                          value={selectedDailyFeedDetails.cowName || "Tidak Ada Info Sapi"}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formList.map((item, index) => (
                  <div className="row mb-3" key={index}>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">{t('dailyfeed.feed_type')}
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
                      <label className="form-label fw-bold">{t('dailyfeed.quantity')}
                      (kg)</label>
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
                            {t('dailyfeed.insufficient_stock')}
                            : {getFeedStockInfo(item.feed_id)} kg
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
                          {t('dailyfeed.delete')}

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
                    + {t('dailyfeed.add_feed')}
                    {formList.length >= 3 ? " (Maksimum)" : ""}
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