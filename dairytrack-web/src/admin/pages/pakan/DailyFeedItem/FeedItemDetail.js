import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAlldailyFeedItems,
  updatedailyFeedItem,
  deletedailyFeedItem,
  createdailyFeedItem,
} from "../../../../api/pakan/dailyFeedItem";
import { getFeeds } from "../../../../api/pakan/feed";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import { getCows } from "../../../../api/peternakan/cow";
import { getDailyFeedById } from "../../../../api/pakan/dailyFeed";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const FeedItemDetailEditPage = ({ dailyFeedId, onUpdateSuccess, onClose }) => {
  const [dailyFeed, setDailyFeed] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [feedStocks, setFeedStocks] = useState([]);
  const [cowNames, setCowNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formList, setFormList] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    console.log("Current feeds state:", feeds);
  }, [feeds]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!dailyFeedId || !isMounted) return;

      try {
        setLoading(true);
        setError("");

        const [
          dailyFeedResponse,
          allFeedItemsResponse,
          feedResponse,
          stockResponse,
          cowsResponse,
        ] = await Promise.all([
          getDailyFeedById(dailyFeedId).catch((err) => {
            console.error("getDailyFeedById error:", err);
            return { success: false, data: null };
          }),
          getAlldailyFeedItems().catch((err) => {
            console.error("getAlldailyFeedItems error:", err);
            return { success: false, data: [] };
          }),
          getFeeds().catch((err) => {
            console.error("getFeeds error:", err);
            return { success: false, data: [] };
          }),
          getFeedStock().catch((err) => {
            console.error("getFeedStock error:", err);
            return { success: false, feeds: [] };
          }),
          getCows().catch((err) => {
            console.error("getCows error:", err);
            return [];
          }),
        ]);

        if (!isMounted) return;

        // Handle cow data
        const cowMap = {};
        if (Array.isArray(cowsResponse)) {
          cowsResponse.forEach((cow) => {
            cowMap[cow.id] = cow.name;
          });
        }
        setCowNames(cowMap);

        // Handle daily feed
        if (dailyFeedResponse?.success && dailyFeedResponse.data) {
          setDailyFeed(dailyFeedResponse.data);
        } else {
          setError("Gagal memuat data sesi pakan harian.");
        }

        // Handle feed items
        const feedItemsData = Array.isArray(allFeedItemsResponse?.data)
          ? allFeedItemsResponse.data
          : [];

        const relevantFeedItems = feedItemsData.filter(
          (item) => item.daily_feed_id === parseInt(dailyFeedId)
        );

        setFeedItems(relevantFeedItems);
        setFormList(
          relevantFeedItems.map((item) => ({
            id: item.id,
            feed_id: item.feed_id?.toString() || "",
            quantity: formatQuantityForDisplay(item.quantity),
            daily_feed_id: item.daily_feed_id,
          }))
        );

        // Handle feeds
        if (feedResponse?.success && Array.isArray(feedResponse.data)) {
          const processedFeeds = feedResponse.data.map((feed) => {
            if (!feed.name && feed.FeedType?.name) {
              return { ...feed, name: feed.FeedType.name };
            }
            return feed;
          });
          setFeeds(processedFeeds);
          if (processedFeeds.length === 0) {
            setError(
              "Tidak ada data pakan tersedia. Silakan tambahkan pakan terlebih dahulu."
            );
          }
        } else {
          setFeeds([]);
          setError((prev) => prev + " Gagal memuat data pakan.");
        }

        // Handle feed stocks
        if (stockResponse?.success && Array.isArray(stockResponse.feeds)) {
          const stockEntries = stockResponse.feeds
            .filter((feed) => feed.FeedStock !== null)
            .map((feed) => ({
              feedId: feed.id,
              stock: Number(feed.FeedStock.stock) || 0,
              FeedStock: feed.FeedStock,
            }));
          setFeedStocks(stockEntries);
          console.log("Processed feedStocks:", stockEntries);
          if (stockEntries.length === 0) {
            setError((prev) => prev + " Gagal memuat data stok pakan.");
          }
        } else {
          setFeedStocks([]);
          setError((prev) => prev + " Gagal memuat data stok pakan.");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error);
          setError(error.message || "Gagal mengambil data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dailyFeedId]);

  const formatQuantityForDisplay = (quantity) => {
    if (quantity === null || quantity === undefined) return "";
    const num = Number(quantity);
    return Number.isInteger(num) ? num.toString() : num.toString();
  };

  const formatQuantityForAPI = (quantity) => {
    if (quantity === "") return 0;
    const num = Number(quantity);
    return isNaN(num) ? 0 : num;
  };

  const displayFeedName = (feedId) => {
    if (!feedId) return "-";
    const feed = feeds.find((f) => f.id === parseInt(feedId));
    return feed?.name || `Feed #${feedId}`;
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormList(
        feedItems.map((item) => ({
          id: item.id,
          feed_id: item.feed_id?.toString() || "",
          quantity: formatQuantityForDisplay(item.quantity),
          daily_feed_id: item.daily_feed_id,
        }))
      );
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedFormList = [...formList];
    updatedFormList[index][name] = value;
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
    setFormList([
      ...formList,
      { feed_id: "", quantity: "", daily_feed_id: parseInt(dailyFeedId) },
    ]);
  };

  const handleRemoveFeedItem = async (index) => {
    const updatedFormList = [...formList];
    const removedItem = updatedFormList[index];

    if (removedItem.id) {
      const result = await Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin ingin menghapus item pakan ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        try {
          const response = await deletedailyFeedItem(removedItem.id);
          if (response.success) {
            updatedFormList.splice(index, 1);
            setFormList(updatedFormList);
            setFeedItems(
              feedItems.filter((item) => item.id !== removedItem.id)
            );
            Swal.fire({
              title: "Berhasil!",
              text: "Item pakan berhasil dihapus",
              icon: "success",
              timer: 1500,
            });
          } else {
            throw new Error(response.message || "Gagal menghapus item");
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message || "Gagal menghapus item pakan",
            icon: "error",
          });
        }
      }
    } else {
      updatedFormList.splice(index, 1);
      setFormList(updatedFormList);
    }
  };

  const getAvailableFeedsForRow = (currentIndex) => {
    const selectedFeedIds = formList
      .filter((_, index) => index !== currentIndex)
      .map((item) => parseInt(item.feed_id))
      .filter((id) => !isNaN(id));

    return feeds.filter((feed) => !selectedFeedIds.includes(feed.id));
  };

  const handleSave = async () => {
    try {
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

      if (!result.isConfirmed) return;

      setLoading(true);
      setError("");

      // Validate form
      if (formList.length === 0) {
        throw new Error("Harus ada minimal satu jenis pakan");
      }

      for (const item of formList) {
        if (!item.feed_id || !item.quantity || isNaN(Number(item.quantity))) {
          throw new Error(
            "Semua item pakan harus memiliki jenis dan jumlah yang valid"
          );
        }
      }

      // Check for duplicate feed types
      const feedIdCounts = {};
      formList.forEach((item) => {
        feedIdCounts[item.feed_id] = (feedIdCounts[item.feed_id] || 0) + 1;
      });

      const duplicateFeedIds = Object.keys(feedIdCounts).filter(
        (feedId) => feedIdCounts[feedId] > 1
      );

      if (duplicateFeedIds.length > 0) {
        const duplicateFeedNames = duplicateFeedIds.map((feedId) => {
          const feed = feeds.find((f) => f.id === parseInt(feedId));
          return feed?.name || `Feed ID: ${feedId}`;
        });
        throw new Error(
          `${duplicateFeedNames.join(
            ", "
          )} sudah dipilih lebih dari satu kali. Silakan pilih jenis pakan yang berbeda.`
        );
      }

      // Check stock availability
      for (const item of formList) {
        const availableStock = getFeedStockInfo(parseInt(item.feed_id));
        const requestedQuantity = Number(item.quantity);
        if (requestedQuantity > availableStock) {
          const feedName = displayFeedName(item.feed_id);
          throw new Error(
            `Stok tidak mencukupi untuk ${feedName}: Tersedia ${availableStock} kg, diminta ${requestedQuantity} kg`
          );
        }
      }

      // Prepare data for API
      const newItems = formList.filter((item) => !item.id);
      const updatedItems = formList.filter((item) => item.id);

      let updatedFeedItems = [...feedItems];

      // Create new items
      if (newItems.length > 0) {
        const feedItemsPayload = newItems.map((item) => ({
          feed_id: parseInt(item.feed_id),
          quantity: formatQuantityForAPI(item.quantity),
        }));

        const addPayload = {
          daily_feed_id: parseInt(dailyFeedId),
          feed_items: feedItemsPayload,
        };

        const addResponse = await createdailyFeedItem(addPayload);
        console.log("addResponse from createdailyFeedItem:", addResponse);

        if (addResponse?.success) {
          // Handle different possible response structures
          let newFeedItems = [];

          if (Array.isArray(addResponse.data)) {
            // If data is an array directly
            newFeedItems = addResponse.data.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
            }));
          } else if (Array.isArray(addResponse.data?.feedItems)) {
            // If data.feedItems is an array
            newFeedItems = addResponse.data.feedItems.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
            }));
          } else if (Array.isArray(addResponse.data?.feed_items)) {
            // If data.feed_items is an array (alternative naming)
            newFeedItems = addResponse.data.feed_items.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
            }));
          } else if (Array.isArray(addResponse.data?.DailyFeedItems)) {
            // Handle the current backend structure
            newFeedItems = addResponse.data.DailyFeedItems.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
            }));
          } else {
            throw new Error(
              "Unexpected response structure from createdailyFeedItem"
            );
          }

          updatedFeedItems = [
            ...updatedFeedItems.filter(
              (existingItem) =>
                !newFeedItems.some((newItem) => newItem.id === existingItem.id)
            ),
            ...newFeedItems,
          ];
        } else {
          throw new Error(
            addResponse?.message || "Gagal menambahkan item baru"
          );
        }
      }

      // Update existing items
      if (updatedItems.length > 0) {
        for (const item of updatedItems) {
          const updatePayload = {
            quantity: formatQuantityForAPI(item.quantity),
          };

          const updateResponse = await updatedailyFeedItem(
            item.id,
            updatePayload
          );
          console.log(
            "updateResponse from updatedailyFeedItem:",
            updateResponse
          );

          if (updateResponse?.success && updateResponse.data) {
            updatedFeedItems = updatedFeedItems.map((feedItem) =>
              feedItem.id === item.id
                ? {
                    ...feedItem,
                    quantity: formatQuantityForAPI(item.quantity),
                  }
                : feedItem
            );
          } else {
            throw new Error(
              updateResponse?.message || "Gagal memperbarui item"
            );
          }
        }
      }

      // Update state
      setFeedItems(updatedFeedItems);
      setIsEditing(false);

      await Swal.fire({
        title: "Berhasil!",
        text: "Data pakan harian berhasil diperbarui",
        icon: "success",
        timer: 1500,
      });

      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error("Error saving feed items:", error);
      setError(error.message);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeedStockInfo = (feedId) => {
    if (!feedId) return 0;
    const feedStock = feedStocks.find(
      (stock) => stock.feedId === parseInt(feedId)
    );
    return Number(feedStock?.stock) || 0;
  };

  const formatStockDisplay = (stock) => {
    const num = Number(stock);
    if (isNaN(num)) return "0";
    return Number.isInteger(num) ? num.toString() : num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSession = (session) => {
    if (!session) return "-";
    return session.charAt(0).toUpperCase() + session.slice(1);
  };

  const getCowName = () => {
    if (!dailyFeed) return "-";
    return (
      dailyFeed.cow?.name ||
      dailyFeed.cow_name ||
      (dailyFeed.cow_id && cowNames[dailyFeed.cow_id]) ||
      (dailyFeed.cow_id && `Sapi #${dailyFeed.cow_id}`) ||
      "Tidak Ada Info Sapi"
    );
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
              {t("dailyfeed.daily_feed_details")}
            </h5>
            <button
              className="btn-close"
              onClick={onClose}
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
              <>
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label text-secondary">
                        {t("dailyfeed.date")}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-white"
                        value={formatDate(dailyFeed?.date) || ""}
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
                        value={formatSession(dailyFeed?.session) || ""}
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
                        value={getCowName()}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <>
                    {formList.length === 0 ? (
                      <div className="alert alert-info">
                        Tidak ada item pakan. Tambahkan pakan baru.
                      </div>
                    ) : (
                      formList.map((item, index) => (
                        <div
                          className="row mb-3"
                          key={item.id || `new-${index}`}
                        >
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
                              disabled={item.id}
                            >
                              <option value="">Pilih Pakan</option>
                              {feeds.length > 0 ? (
                                (item.id
                                  ? feeds
                                  : getAvailableFeedsForRow(index)
                                ).map((feed) => (
                                  <option key={feed.id} value={feed.id}>
                                    {feed.name || `Feed #${feed.id}`}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  Memuat pakan...
                                </option>
                              )}
                            </select>
                            {item.feed_id && (
                              <div className="form-text fw-bold fs-5 text-primary">
                                Stok tersedia:{" "}
                                <strong>
                                  {formatStockDisplay(
                                    getFeedStockInfo(parseInt(item.feed_id))
                                  )}{" "}
                                  kg
                                </strong>
                              </div>
                            )}
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
                              Number(item.quantity) >
                                getFeedStockInfo(parseInt(item.feed_id)) && (
                                <small className="form-text text-danger fw-bold">
                                  {t("dailyfeed.insufficient_stock")}:{" "}
                                  {formatStockDisplay(
                                    getFeedStockInfo(parseInt(item.feed_id))
                                  )}{" "}
                                  kg
                                </small>
                              )}
                          </div>
                          <div className="col-md-2 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-danger me-2"
                              onClick={() => handleRemoveFeedItem(index)}
                            >
                              {t("dailyfeed.delete")}
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="mb-4 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={handleAddFeedItem}
                        disabled={formList.length >= 3 || feeds.length === 0}
                      >
                        + {t("dailyfeed.add_feed")}{" "}
                        {formList.length >= 3 ? " (Maksimum)" : ""}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {feedItems.length === 0 ? (
                      <div className="alert alert-info">
                        <i className="ri-information-line me-2"></i>{" "}
                        {t("dailyfeed.no_feed_data_for_session")}
                      </div>
                    ) : (
                      <div className="table-responsive mb-4">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th
                                className="text-center"
                                style={{ width: "5%" }}
                              >
                                No
                              </th>
                              <th style={{ width: "50%" }}>Jenis Pakan</th>
                              <th
                                className="text-center"
                                style={{ width: "20%" }}
                              >
                                {t("dailyfeed.quantity")} (kg)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedItems.map((item, index) => (
                              <tr key={item.id}>
                                <td className="text-center">{index + 1}</td>
                                <td>{displayFeedName(item.feed_id)}</td>
                                <td className="text-center">
                                  {formatStockDisplay(item.quantity)} kg
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    {t("dailyfeed.back")}
                  </button>

                  {isEditing ? (
                    <button
                      type="button"
                      className="btn btn-info text-white"
                      onClick={handleSave}
                      disabled={loading}
                    >
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
                        "Simpan"
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-info text-white"
                      onClick={toggleEditMode}
                      disabled={loading}
                    >
                      {t("dailyfeed.edit")}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedItemDetailEditPage;
