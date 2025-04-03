import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createdailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getFeeds } from "../../../../api/pakan/feed";
import { getAllDailyFeedDetails } from "../../../../api/pakan/dailyFeedDetail";

const FeedItemFormPage = ({ onFeedItemAdded, onClose }) => {
  const [formList, setFormList] = useState([{ feed_id: "", quantity: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [selectedDailyFeedId, setSelectedDailyFeedId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feedResponse = await getFeeds();
        if (feedResponse.success && Array.isArray(feedResponse.feeds)) {
          setFeeds(feedResponse.feeds);
        } else {
          throw new Error("Invalid feed data received");
        }

        const dailyFeedResponse = await getAllDailyFeedDetails();
        if (dailyFeedResponse.success && Array.isArray(dailyFeedResponse.data)) {
          setDailyFeeds(dailyFeedResponse.data);
        } else {
          throw new Error("Invalid daily feed data received");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch required data");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e, index) => {
    const updatedFormList = [...formList];
    updatedFormList[index][e.target.name] = e.target.value;
    setFormList(updatedFormList);
  };

  const handleAddFeedItem = () => {
    setFormList([...formList, { feed_id: "", quantity: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedDailyFeedId) {
      setError("Please select a daily feed session.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        daily_feed_id: selectedDailyFeedId,
        feed_items: formList.map(({ feed_id, quantity }) => ({
          feed_id: Number(feed_id),
          quantity: Number(quantity)
        }))
      };
      
      await createdailyFeedItem(payload);
      onFeedItemAdded?.();
      onClose?.() || navigate("/admin/item-pakan");
    } catch (error) {
      console.error("Error submitting feed items:", error);
      setError(error.message || "Failed to save feed items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Add Feed Item</h4>
            <button
              type="button"
              className="btn-close"
              onClick={() => onClose?.() || navigate("/admin/item-pakan")}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label className="form-label">Daily Feed Session</label>
              <select
                className="form-control mb-3"
                value={selectedDailyFeedId}
                onChange={(e) => setSelectedDailyFeedId(e.target.value)}
                required
              >
                <option value="">Select Daily Feed</option>
                {dailyFeeds.map((df) => (
                  <option key={df.id} value={df.id}>
                    {df.date} - {df.session} (ID: {df.id})
                  </option>
                ))}
              </select>
              {formList.map((form, index) => (
                <div key={index} className="mb-3">
                  <label className="form-label">Feed</label>
                  <select
                    className="form-control"
                    name="feed_id"
                    value={form.feed_id}
                    onChange={(e) => handleChange(e, index)}
                    required
                  >
                    <option value="">Select Feed</option>
                    {feeds.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.name} (ID: {feed.id})
                      </option>
                    ))}
                  </select>
                  <label className="form-label mt-2">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={form.quantity}
                    onChange={(e) => handleChange(e, index)}
                    required
                    min="1"
                  />
                </div>
              ))}
              <button type="button" className="btn btn-secondary mb-3" onClick={handleAddFeedItem}>
                Add Another Feed Item
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedItemFormPage;