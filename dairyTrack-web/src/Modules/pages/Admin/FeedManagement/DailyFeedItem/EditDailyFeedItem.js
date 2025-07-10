import React, { useState, useEffect } from "react";
import {
  getAllFeedItems,
  updateFeedItem,
  deleteFeedItem,
  addFeedItem,
  getFeedItemsByDailyFeedId,
} from "../../../../controllers/feedItemController";
import { listFeeds } from "../../../../controllers/feedController";
import { getAllFeedStocks } from "../../../../controllers/feedStockController";
import { listCows } from "../../../../controllers/cowsController";
import { getDailyFeedById } from "../../../../controllers/feedScheduleController";
import Swal from "sweetalert2";

const FeedItemDetailEditPage = ({ dailyFeedId, onUpdateSuccess, onClose }) => {
  const [dailyFeed, setDailyFeed] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [feedStocks, setFeedStocks] = useState([]);
  const [cowNames, setCowNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [itemErrors, setItemErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formList, setFormList] = useState([]);

  // Function to format numbers without trailing zeros
  const formatNumber = (number) => {
    if (Number.isNaN(number) || number === null || number === undefined)
      return "0";
    const num = parseFloat(number);
    return num % 1 === 0
      ? num.toString()
      : num.toFixed(2).replace(/\.?0+$/, "");
  };

  useEffect(() => {
    console.log("Current feeds state:", feeds);
  }, [feeds]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Check for user token
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user.token || null;
      if (!token) {
        localStorage.removeItem("user");
        window.location.href = "/";
        return;
      }

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
          getAllFeedItems().catch((err) => {
            console.error("getAllFeedItems error:", err);
            return [];
          }),
          listFeeds().catch((err) => {
            console.error("listFeeds error:", err);
            return { success: false, feeds: [] };
          }),
          getAllFeedStocks().catch((err) => {
            console.error("getAllFeedStocks error:", err);
            return { success: false, data: [] };
          }),
          listCows().catch((err) => {
            console.error("listCows error:", err);
            return [];
          }),
        ]);

        if (!isMounted) return;

        console.log("Daily Feed ID:", dailyFeedId, typeof dailyFeedId);
        console.log("Daily Feed Data:", dailyFeedResponse?.data);
        console.log("All Feed Items Response:", allFeedItemsResponse);

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
        const feedItemsData = Array.isArray(allFeedItemsResponse)
          ? allFeedItemsResponse.filter(
              (item) => item.daily_feed_id == dailyFeedId
            )
          : Array.isArray(allFeedItemsResponse?.data)
          ? allFeedItemsResponse.data.filter(
              (item) => item.daily_feed_id == dailyFeedId
            )
          : [];
        console.log("Feed Items Data:", feedItemsData);
        setFeedItems(feedItemsData);
        setFormList(
          feedItemsData.map((item) => ({
            id: item.id,
            feed_id: item.feed_id?.toString() || "",
            quantity: formatNumber(item.quantity),
            daily_feed_id: item.daily_feed_id,
          }))
        );

        if (feedItemsData.length === 0) {
          console.warn(`No feed items found for dailyFeedId: ${dailyFeedId}`);
        }

        // Handle feeds
        if (feedResponse?.success && Array.isArray(feedResponse.feeds)) {
          const processedFeeds = feedResponse.feeds.map((feed) => ({
            ...feed,
            name: feed.name || feed.type_name || `Feed #${feed.id}`,
          }));
          setFeeds(processedFeeds);
          if (processedFeeds.length === 0) {
            setError("Tidak ada data pakan tersedia.");
          }
        } else {
          setFeeds([]);
          setError("Gagal memuat data pakan.");
        }

        // Handle feed stocks
        if (stockResponse?.success && Array.isArray(stockResponse.data)) {
          const stockEntries = stockResponse.data
            .filter((feed) => feed.stock !== null)
            .map((feed) => ({
              feedId: feed.id,
              stock: parseFloat(feed.stock.stock) || 0,
              unit: feed.stock.unit || "kg",
              FeedStock: feed.stock,
            }));
          setFeedStocks(stockEntries);
          if (stockEntries.length === 0) {
            setError("Tidak ada stok pakan tersedia.");
          }
        } else {
          setFeedStocks([]);
          setError("Gagal memuat data stok pakan.");
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
    return formatNumber(quantity);
  };

  const formatQuantityForAPI = (quantity) => {
    if (quantity === "") return 0;
    const num = parseFloat(quantity);
    return isNaN(num) ? 0 : num;
  };

  const displayFeedName = (feedId) => {
    if (!feedId) return "-";
    const feed = feeds.find((f) => f.id === parseInt(feedId));
    return feed?.name || `Feed #${feedId}`;
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setItemErrors({});
    if (!isEditing) {
      setFormList(
        feedItems.map((item) => ({
          id: item.id,
          feed_id: item.feed_id?.toString() || "",
          quantity: formatNumber(item.quantity),
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

    // Real-time stock validation
    if (name === "quantity" && updatedFormList[index].feed_id) {
      const feedId = parseInt(updatedFormList[index].feed_id);
      const quantity = parseFloat(value);
      const availableStock = getFeedStockInfo(feedId);
      if (quantity > availableStock) {
        setItemErrors((prev) => ({
          ...prev,
          [index]: `Jumlah melebihi stok: ${formatNumber(availableStock)} kg`,
        }));
      } else {
        setItemErrors((prev) => {
          const { [index]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handleAddFeedItem = () => {
    setFormList([
      ...formList,
      { feed_id: "", quantity: "", daily_feed_id: parseInt(dailyFeedId) },
    ]);
  };

  const handleRemoveFeedItem = async (index) => {
    setActionLoading(true);
    const updatedFormList = [...formList];
    const removedItem = updatedFormList[index];
    const feedName = displayFeedName(removedItem.feed_id);

    try {
      if (removedItem.id) {
        const result = await Swal.fire({
          title: "Konfirmasi",
          text: `Apakah Anda yakin ingin menghapus pakan "${feedName}"?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ya, hapus!",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          const response = await deleteFeedItem(removedItem.id);
          if (response.success) {
            updatedFormList.splice(index, 1);
            setFormList(updatedFormList);
            setFeedItems(
              feedItems.filter((item) => item.id !== removedItem.id)
            );
            Swal.fire({
              title: "Berhasil!",
              text: `Pakan "${feedName}" berhasil dihapus`,
              icon: "success",
              timer: 1500,
            });
          } else {
            throw new Error(response.message || "Gagal menghapus item");
          }
        }
      } else {
        updatedFormList.splice(index, 1);
        setFormList(updatedFormList);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Gagal menghapus item pakan",
        icon: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getAvailableFeedsForRow = (currentIndex) => {
    const selectedFeedIds = formList
      .filter((_, index) => index !== currentIndex)
      .map((item) => parseInt(item.feed_id))
      .filter((id) => !isNaN(id));

    return feeds
      .filter((feed) => !selectedFeedIds.includes(feed.id))
      .filter((feed) => getFeedStockInfo(feed.id) > 0);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setItemErrors({});

      // Validate form
      if (formList.length === 0) {
        throw new Error("Harus ada minimal satu jenis pakan");
      }

      const errors = {};
      for (let i = 0; i < formList.length; i++) {
        const item = formList[i];
        if (!item.feed_id) {
          errors[i] = "Pilih jenis pakan";
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors[i] = "Masukkan jumlah yang valid";
        }
        const availableStock = getFeedStockInfo(parseInt(item.feed_id));
        if (parseFloat(item.quantity) > availableStock) {
          errors[i] = `Jumlah melebihi stok: ${formatNumber(
            availableStock
          )} kg`;
        }
      }

      if (Object.keys(errors).length > 0) {
        setItemErrors(errors);
        throw new Error("Periksa input pakan");
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
        const duplicateFeedNames = duplicateFeedIds.map((feedId) =>
          displayFeedName(feedId)
        );
        throw new Error(
          `${duplicateFeedNames.join(", ")} dipilih lebih dari sekali.`
        );
      }

      // Prepare confirmation
      const feedDetails = formList
        .map(
          (item) =>
            `${displayFeedName(item.feed_id)} ${formatNumber(item.quantity)} kg`
        )
        .join(", ");
      const cowName = getCowName();
      const date = formatDate(dailyFeed?.date);
      const session = formatSession(dailyFeed?.session);

      const result = await Swal.fire({
        title: "Konfirmasi",
        text: `Simpan data ${feedDetails} untuk sapi ${cowName} pada ${date} sesi ${session}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, simpan!",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

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

        const addResponse = await addFeedItem(addPayload);
        console.log("addResponse:", addResponse);

        if (addResponse?.success) {
          let newFeedItems = [];
          if (Array.isArray(addResponse.data)) {
            newFeedItems = addResponse.data.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
            }));
          } else if (addResponse.data?.feed_items) {
            newFeedItems = addResponse.data.feed_items.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
            }));
          } else {
            throw new Error("Struktur respons tidak valid");
          }

          updatedFeedItems = [
            ...updatedFeedItems.filter(
              (existingItem) =>
                !newFeedItems.some((newItem) => newItem.id === existingItem.id)
            ),
            ...newFeedItems,
          ];
        } else {
          throw new Error(addResponse?.message || "Gagal menambahkan item");
        }
      }

      // Update existing items
      if (updatedItems.length > 0) {
        for (const item of updatedItems) {
          const updatePayload = {
            quantity: formatQuantityForAPI(item.quantity),
          };

          const updateResponse = await updateFeedItem(item.id, updatePayload);
          console.log("updateResponse:", updateResponse);

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

      Swal.fire({
        title: "Berhasil!",
        text: "Data pakan harian berhasil diperbarui",
        icon: "success",
        timer: 1500,
      });

      if (onUpdateSuccess) onUpdateSuccess();
      if (onClose) onClose();
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
    return parseFloat(feedStock?.stock) || 0;
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
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold text-info">Detail Pakan Harian</h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading || actionLoading}
            ></button>
          </div>
          <div className="modal-body p-4">
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
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label text-secondary">
                        Tanggal
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
                      <label className="form-label text-secondary">Sesi</label>
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
                      <label className="form-label text-secondary">Sapi</label>
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
                          <div className="col-md-5 d-flex flex-column">
                            <label className="form-label fw-bold">
                              Jenis Pakan
                            </label>
                            <select
                              name="feed_id"
                              className="form-select mb-1"
                              value={item.feed_id}
                              onChange={(e) => handleChange(e, index)}
                              required
                              disabled={item.id || actionLoading}
                            >
                              <option value="">Pilih Pakan</option>
                              {getAvailableFeedsForRow(index).length > 0 ? (
                                getAvailableFeedsForRow(index).map((feed) => (
                                  <option key={feed.id} value={feed.id}>
                                    {feed.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  Tidak ada pakan tersedia
                                </option>
                              )}
                            </select>
                            {item.feed_id && (
                              <div className="form-text text-primary">
                                Stok tersedia:{" "}
                                {formatNumber(
                                  getFeedStockInfo(parseInt(item.feed_id))
                                )}{" "}
                                kg
                              </div>
                            )}
                          </div>
                          <div className="col-md-4 d-flex flex-column">
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
                              disabled={actionLoading}
                            />
                            {itemErrors[index] && (
                              <small className="form-text text-danger mt-1">
                                {itemErrors[index]}
                              </small>
                            )}
                          </div>
                          <div className="col-md-3 d-flex">
                            <button
                              type="button"
                              className="btn btn-danger mt-auto ms-auto"
                              onClick={() => handleRemoveFeedItem(index)}
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                "Hapus"
                              )}
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
                        disabled={feeds.length === 0 || actionLoading}
                      >
                        + Tambah Pakan
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {feedItems.length === 0 ? (
                      <div className="alert alert-info">
                        <i className="ri-information-line me-2"></i> Tidak ada
                        data item pakan untuk sesi ini (Daily Feed ID:{" "}
                        {dailyFeedId}). Klik tombol 'Edit' untuk menambahkan
                        pakan.
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
                                Jumlah (kg)
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "25%" }}
                              >
                                Stok Tersedia (kg)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedItems.map((item, index) => (
                              <tr key={item.id}>
                                <td className="text-center">{index + 1}</td>
                                <td>{displayFeedName(item.feed_id)}</td>
                                <td className="text-center">
                                  {formatNumber(item.quantity)} kg
                                </td>
                                <td className="text-center">
                                  {formatNumber(getFeedStockInfo(item.feed_id))}{" "}
                                  kg
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
                    disabled={loading || actionLoading}
                  >
                    Kembali
                  </button>

                  {isEditing ? (
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-2"
                        onClick={toggleEditMode}
                        disabled={loading || actionLoading}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        className="btn btn-info text-white"
                        onClick={handleSave}
                        disabled={loading || actionLoading}
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
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-info text-white"
                      onClick={toggleEditMode}
                      disabled={loading || actionLoading}
                    >
                      Edit
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