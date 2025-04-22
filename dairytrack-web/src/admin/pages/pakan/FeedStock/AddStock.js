import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getFeeds, getFeedById } from "../../../../api/pakan/feed";
import { AddFeedStock } from "../../../../api/pakan/feedstock";

const AddFeedStockPage = ({ preFeedId, onStockAdded, onClose }) => {
  const [feedId, setFeedId] = useState(preFeedId || "");
  const [additionalStock, setAdditionalStock] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedName, setSelectedFeedName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preFeedId) {
      const fetchFeed = async () => {
        try {
          const response = await getFeedById(preFeedId);
          if (response.success && response.feed) {
            setSelectedFeedName(response.feed.name);
          }
        } catch (error) {
          console.error("Error fetching feed:", error.message);
        }
      };
      fetchFeed();
    } else {
      const fetchFeeds = async () => {
        try {
          const response = await getFeeds();
          if (response.success && response.feeds) {
            setFeeds(response.feeds);
          }
        } catch (error) {
          console.error("Error fetching feeds:", error.message);
        }
      };
      fetchFeeds();
    }
  }, [preFeedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedId) {
      Swal.fire("Error", "Please select a feed", "error");
      return;
    }
    if (!additionalStock) {
      Swal.fire("Error", "Please enter additional stock", "error");
      return;
    }

    // Konfirmasi sebelum menambah stok
    const confirmation = await Swal.fire({
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menambah ${additionalStock} kg stok pakan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return; // Batalkan jika pengguna memilih "Tidak"
    }

    setLoading(true);
    try {
      const response = await AddFeedStock({ feedId, additionalStock });
      if (response.success) {
        Swal.fire({
          title: "Berhasil",
          text: "Stok pakan berhasil ditambahkan",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          onStockAdded();
          onClose();
        });
      } else {
        Swal.fire({
          title: "Gagal",
          text: response.message || "Gagal menambahkan stok pakan",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat menambahkan stok",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{
        background: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Stok Pakan</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {preFeedId ? (
                <div className="form-group mb-3">
                  <label htmlFor="feedName" className="form-label">
                    Nama Pakan
                  </label>
                  <input
                    type="text"
                    id="feedName"
                    className="form-control"
                    value={selectedFeedName}
                    readOnly
                  />
                </div>
              ) : (
                <div className="form-group mb-3">
                  <label htmlFor="feedId" className="form-label">
                    Nama Pakan
                  </label>
                  <select
                    id="feedId"
                    className="form-control"
                    value={feedId}
                    onChange={(e) => setFeedId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Pakan</option>
                    {feeds.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group mb-3">
                <label htmlFor="additionalStock" className="form-label">
                  Stok yang ditambah (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="additionalStock"
                  className="form-control"
                  value={additionalStock}
                  onChange={(e) => setAdditionalStock(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={loading}
              >
                {loading ? "Saving..." : "Tambah Pakan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeedStockPage;