import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getFeeds, getFeedById } from "../../../../api/pakan/feed"; // API untuk feed
import { AddFeedStock } from "../../../../api/pakan/feedstock"; // Sesuai dengan API frontend

const AddFeedStockPage = () => {
  const [searchParams] = useSearchParams();
  const preFeedId = searchParams.get("feedId"); // jika ada feedId di query
  const [feedId, setFeedId] = useState(preFeedId || "");
  const [additionalStock, setAdditionalStock] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedName, setSelectedFeedName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Jika feedId ada, ambil data feed tersebut, kalau tidak ambil daftar feed
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
      const response = await AddFeedStock({ feedId, additionalStock }); // Menggunakan AddFeedStock yang sesuai
      if (response.success) {
        Swal.fire("Success", "Stock updated successfully", "success").then(() => {
          navigate("/feedstock");
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
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add Feed Stock</h2>
      <form onSubmit={handleSubmit}>
        {preFeedId ? (
          // Jika feedId sudah tersedia di URL, tampilkan nama feed secara read-only
          <div className="form-group mb-3">
            <label htmlFor="feedName" className="form-label">Feed</label>
            <input
              type="text"
              id="feedName"
              className="form-control"
              value={selectedFeedName}
              readOnly
            />
          </div>
        ) : (
          // Jika tidak, tampilkan dropdown untuk memilih feed
          <div className="form-group mb-3">
            <label htmlFor="feedId" className="form-label">Feed</label>
            <select
              id="feedId"
              className="form-control"
              value={feedId}
              onChange={(e) => setFeedId(e.target.value)}
              required
            >
              <option value="">Select Feed</option>
              {feeds.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name}
                </option>
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Add Stock"}
        </button>
        <button
          type="button"
          className="btn btn-secondary ml-2"
          onClick={() => navigate("/feedstock")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddFeedStockPage;
