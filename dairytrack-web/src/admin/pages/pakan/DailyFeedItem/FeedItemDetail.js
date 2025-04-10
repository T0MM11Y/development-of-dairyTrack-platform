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
          getDailyFeedById(dailyFeedId),
          getAlldailyFeedItems(),
          getFeeds(),
          getFeedStock(),
          getCows(),
        ]);

        if (!isMounted) return;

        setFeeds(feedResponse.success && Array.isArray(feedResponse.feeds) ? feedResponse.feeds : []);
        setFeedStocks(stockResponse.success && Array.isArray(stockResponse.stocks) ? stockResponse.stocks : []);

        const cowMap = {};
        if (Array.isArray(cowsResponse)) {
          cowsResponse.forEach((cow) => (cowMap[cow.id] = cow.name));
        }
        setCowNames(cowMap);

        if (dailyFeedResponse.success) {
          setDailyFeed(dailyFeedResponse.data);
        }

        if (allFeedItemsResponse.success && Array.isArray(allFeedItemsResponse.data)) {
          const relevantFeedItems = allFeedItemsResponse.data.filter(
            (item) => item.daily_feed_id === parseInt(dailyFeedId)
          );
          setFeedItems(relevantFeedItems);
          setFormList(
            relevantFeedItems.map((item) => ({
              id: item.id,
              feed_id: item.feed_id?.toString() || "",
              quantity: item.quantity?.toString() || "",
              daily_feed_id: item.daily_feed_id,
            }))
          );
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

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormList(
        feedItems.map((item) => ({
          id: item.id,
          feed_id: item.feed_id?.toString() || "",
          quantity: item.quantity?.toString() || "",
          daily_feed_id: item.daily_feed_id,
        }))
      );
    }
  };

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
            setFeedItems(feedItems.filter((item) => item.id !== removedItem.id));
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
  
      const uniqueFeedIds = new Set(formList.map((item) => item.feed_id));
      if (uniqueFeedIds.size !== formList.length) {
        setError("Terdapat jenis pakan yang sama dalam permintaan.");
        Swal.fire({
          title: "Jenis Pakan Duplikat",
          text: "Terdapat jenis pakan yang sama dalam permintaan.",
          icon: "warning",
        });
        setLoading(false);
        return;
      }
  
      const newItems = formList.filter((item) => !item.id);
      const updatedItems = formList.filter((item) => item.id);
      let updatedFeedItems = [...feedItems];
  
      // Add new items in bulk
      if (newItems.length > 0) {
        const feedItemsPayload = newItems.map((item) => ({
          feed_id: parseInt(item.feed_id),
          quantity: parseFloat(item.quantity),
        }));
        const addPayload = {
          daily_feed_id: parseInt(dailyFeedId),
          feed_items: feedItemsPayload,
        };
        console.log("Add Payload:", addPayload);
        const addResponse = await createdailyFeedItem(addPayload);
        console.log("Add Response:", addResponse);
        if (addResponse.success && addResponse.data) {
          updatedFeedItems = [
            ...updatedFeedItems,
            ...addResponse.data.feedItems.map((item) => ({
              id: item.id,
              daily_feed_id: parseInt(dailyFeedId),
              feed_id: item.feed_id,
              quantity: item.quantity,
              feed: item.feed,
            })),
          ];
        } else {
          throw new Error(addResponse.message || "Gagal menambahkan item baru");
        }
      }
  
      // Update existing items individually
      if (updatedItems.length > 0) {
        for (const item of updatedItems) {
          const updatePayload = {
            quantity: parseFloat(item.quantity),
          };
          console.log(`Update Payload for ID ${item.id}:`, updatePayload);
          const updateResponse = await updatedailyFeedItem(item.id, updatePayload);
          console.log(`Update Response for ID ${item.id}:`, updateResponse);
          if (updateResponse.success && updateResponse.data) {
            updatedFeedItems = updatedFeedItems.map((feedItem) =>
              feedItem.id === item.id
                ? {
                    ...feedItem,
                    quantity: parseFloat(item.quantity),
                    feed: feeds.find((f) => f.id === parseInt(item.feed_id)),
                  }
                : feedItem
            );
          } else {
            throw new Error(updateResponse.message || "Gagal memperbarui item");
          }
        }
      }
  
      setFeedItems(updatedFeedItems);
      setFormList(
        updatedFeedItems.map((item) => ({
          id: item.id,
          feed_id: item.feed_id.toString(),
          quantity: item.quantity.toString(),
          daily_feed_id: item.daily_feed_id,
        }))
      );
      setIsEditing(false);
  
      // Alert setelah berhasil menyimpan
      await Swal.fire({
        title: "Berhasil!",
        text: "Data pakan harian berhasil diperbarui",
        icon: "success",
        timer: 1500,
      });
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error("Error saving feed items:", error);
      setError(error.message || "Terjadi kesalahan saat menyimpan data");
      Swal.fire({
        title: "Error",
        text: error.message || "Terjadi kesalahan saat menyimpan data",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateFeedItems = () => {
    if (formList.length === 0) {
      setError("Harus ada minimal satu jenis pakan");
      Swal.fire({
        title: "Perhatian",
        text: "Harus ada minimal satu jenis pakan",
        icon: "warning",
      });
      return false;
    }

    const invalidItems = formList.filter(
      (item) => !item.feed_id || !item.quantity || parseFloat(item.quantity) <= 0
    );
    if (invalidItems.length > 0) {
      setError("Semua item pakan harus memiliki jenis dan jumlah yang valid");
      Swal.fire({
        title: "Form Tidak Lengkap",
        text: "Semua item pakan harus memiliki jenis dan jumlah yang valid",
        icon: "warning",
      });
      return false;
    }

    const insufficientStockItems = formList.filter(
      (item) => parseFloat(item.quantity) > getFeedStockInfo(parseInt(item.feed_id))
    );
    if (insufficientStockItems.length > 0) {
      const messages = insufficientStockItems.map(
        (item) =>
          `- ${feeds.find((f) => f.id === parseInt(item.feed_id))?.name}: Tersedia ${getFeedStockInfo(
            parseInt(item.feed_id)
          )} kg, diminta ${item.quantity} kg`
      );
      setError(`Stok tidak mencukupi:\n${messages.join("\n")}`);
      Swal.fire({
        title: "Stok Tidak Mencukupi",
        html: `Stok tidak mencukupi:<br>${messages.join("<br>")}`,
        icon: "error",
      });
      return false;
    }

    return true;
  };

  const getFeedStockInfo = (feedId) =>
    feedStocks.find((stock) => stock.feed?.id === feedId)?.stock || 0;

  const renderStockAvailability = (feedId) =>
    feedId ? (
      <div className="form-text fw-bold fs-5 text-primary">
        Stok tersedia: <strong>{getFeedStockInfo(parseInt(feedId))} kg</strong>
      </div>
    ) : null;

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const formatSession = (session) =>
    session ? session.charAt(0).toUpperCase() + session.slice(1) : "-";

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
              Detail Pakan Harian
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
                      <label className="form-label text-secondary">
                        Sesi
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
                        Sapi
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
                            {feeds.map((feed) => (
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
                          <button
                            type="button"
                            className="btn btn-danger me-2"
                            onClick={() => handleRemoveFeedItem(index)}
                          >
                            Hapus
                          </button>
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
                        + Tambah Pakan {formList.length >= 3 ? " (Maksimum)" : ""}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {feedItems.length === 0 ? (
                      <div className="alert alert-info">
                        <i className="ri-information-line me-2"></i> Tidak ada data pakan untuk sesi ini.
                      </div>
                    ) : (
                      <div className="table-responsive mb-4">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th className="text-center" style={{ width: "5%" }}>No</th>
                              <th style={{ width: "50%" }}>Jenis Pakan</th>
                              <th className="text-center" style={{ width: "20%" }}>Jumlah (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedItems.map((item, index) => (
                              <tr key={item.id}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                  {item.feed?.name ||
                                    feeds.find((f) => f.id === item.feed_id)?.name ||
                                    "-"}
                                </td>
                                <td className="text-center">{item.quantity} kg</td>
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
                    Kembali
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