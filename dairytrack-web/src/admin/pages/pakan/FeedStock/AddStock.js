import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getFeeds, getFeedById } from "../../../../api/pakan/feed";
import { AddFeedStock } from "../../../../api/pakan/feedstock";

const AddFeedStockPage = ({ onStockAdded = () => {} }) => {
  const [searchParams] = useSearchParams();
  const preFeedId = searchParams.get("feedId");
  const [feedId, setFeedId] = useState(preFeedId || "");
  const [additionalStock, setAdditionalStock] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedName, setSelectedFeedName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
    try {
      const response = await AddFeedStock({ feedId, additionalStock });
      if (response.success) {
        Swal.fire({
          title: "Success",
          text: "Stock updated successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          onStockAdded(); // Panggil callback jika ada
          navigate("/admin/pakan/stok"); // Arahkan ke halaman Feed Stock Data setelah berhasil menambah stok
        });
      } else {
        Swal.fire("Error", "Failed to update stock", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update stock: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Stok Pakan</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/feed-stock")} // Arahkan kembali ke halaman Feed Stock Data
              disabled={loading}
            ></button>
            <button className="btn-close" onClick={() => navigate("/admin/pakan/stok")} disabled={loading}></button>
            <button className="btn-close" onClick={() => navigate("/admin/pakan/stok")} disabled={loading}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {preFeedId ? (
                <div className="form-group mb-3">
                  <label htmlFor="feedName" className="form-label">Feed</label>
                  <input type="text" id="feedName" className="form-control" value={selectedFeedName} readOnly />
                </div>
              ) : (
                <div className="form-group mb-3">
                  <label htmlFor="feedId" className="form-label">Feed</label>
                  <select id="feedId" className="form-control" value={feedId} onChange={(e) => setFeedId(e.target.value)} required>
                    <option value="">Select Feed</option>
                    {feeds.map((feed) => (
                      <option key={feed.id} value={feed.id}>{feed.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group mb-3">
                <label htmlFor="additionalStock" className="form-label">Additional Stock (kg)</label>
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
              <button type="submit" className="btn btn-info w-100" disabled={loading}>
                {loading ? "Saving..." : "Add Stock"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeedStockPage;