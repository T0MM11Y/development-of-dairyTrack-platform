import { useEffect, useState } from "react";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import { getFeeds } from "../../../../api/pakan/feed";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AddFeedStockPage from "./AddStock";
import EditFeedStockPage from "./EditStock";

// Function to format numbers with thousand separator and remove trailing zeros
const formatNumber = (value) => {
  // Convert to number, fix to 2 decimal places, then remove trailing zeros
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  
  // Format with thousand separator
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Remove trailing zeros in decimal part
  if (parts[1]) {
    parts[1] = parts[1].replace(/0+$/, '');
    return parts[1].length > 0 ? parts.join(',') : parts[0];
  }
  
  return parts[0];
};

const FeedStockPage = () => {
  const [feedStock, setFeedStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditStock, setShowEditStock] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const feedsResponse = await getFeeds();
      const allFeeds = feedsResponse.success ? feedsResponse.feeds : [];

      const stockResponse = await getFeedStock();
      const stocks = stockResponse.success ? stockResponse.stocks : [];

      const stockMap = {};
      stocks.forEach((stock) => {
        if (stock.feed && stock.feed.id) {
          stockMap[stock.feed.id] = stock;
        }
      });

      const combinedData = allFeeds.map((feed) => {
        if (stockMap[feed.id]) {
          return stockMap[feed.id];
        } else {
          return {
            id: `temp-${feed.id}`,
            feed: feed,
            stock: 0,
          };
        }
      });

      setFeedStock(combinedData);
    } catch (error) {
      console.error("Gagal mengambil data feed stock:", error.message);
      Swal.fire({
        title: "Error",
        text: "Gagal mengambil data feed stock: " + error.message,
        icon: "error"
      });
      setFeedStock([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (feedId) => {
    setSelectedFeedId(feedId);
    setShowAddStock(true);
  };

  const handleEditStock = (stockId, feedId) => {
    if (typeof stockId === "string" && stockId.startsWith("temp-")) {
      handleAddStock(feedId);
    } else {
      setSelectedStockId(stockId);
      setSelectedFeedId(feedId);
      setShowEditStock(true);
    }
  };

  const handleCloseAddStock = () => {
    setShowAddStock(false);
    setSelectedFeedId(null);
  };

  const handleStockUpdated = () => {
    fetchData();
    setShowAddStock(false);
    setShowEditStock(false);
    setSelectedFeedId(null);
    setSelectedStockId(null);
  };

  const handleCloseEditStock = () => {
    setShowEditStock(false);
    setSelectedStockId(null);
    setSelectedFeedId(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Feed Stock Data</h2>
        <button
          onClick={() => handleAddStock(null)}
          className="btn btn-success waves-effect waves-light"
        >
          + Add Stock
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading feed stock data...</p>
        </div>
      ) : feedStock.length === 0 ? (
        <p className="text-gray-500">No feed stock data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Feed Stock Data</h4>
              <p className="card-title-desc">
                This table provides a list of feed stock currently available.
              </p>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "5%" }}>
                        #
                      </th>
                      <th style={{ width: "50%" }}>Name</th>
                      <th style={{ width: "25%" }}>Stock (kg)</th>
                      <th className="text-center" style={{ width: "20%" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedStock.map((item, index) => (
                      <tr key={item.id}>
                        <th scope="row" className="text-center">
                          {index + 1}
                        </th>
                        <td>{item.feed?.name || "Unknown"}</td>
                        <td>{formatNumber(item.stock)}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center">
                            <button
                              className="btn btn-warning waves-effect waves-light me-3"
                              onClick={() =>
                                handleEditStock(item.id, item.feed?.id)
                              }
                              title="Edit Stock"
                            >
                              <i className="ri-pencil-line"></i>
                            </button>
                            <button
                              onClick={() => handleAddStock(item.feed?.id)}
                              className="btn btn-success waves-effect waves-light"
                              title="Add Stock"
                            >
                              <i
                                className="ri-add-line"
                                style={{ fontSize: "1.2rem" }}
                              ></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddStock && (
        <AddFeedStockPage
          feedId={selectedFeedId}
          onClose={handleCloseAddStock}
          onStockAdded={handleStockUpdated}
        />
      )}

      {showEditStock && (
        <EditFeedStockPage
          stockId={selectedStockId}
          feedId={selectedFeedId}
          onClose={handleCloseEditStock}
          onStockUpdated={handleStockUpdated}
        />
      )}
    </div>
  );
};

export default FeedStockPage;