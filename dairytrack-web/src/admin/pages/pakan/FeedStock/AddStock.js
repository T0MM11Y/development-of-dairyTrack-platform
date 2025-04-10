import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getFeeds, getFeedById } from "../../../../api/pakan/feed";
import { AddFeedStock } from "../../../../api/pakan/feedstock";

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

// Function to parse formatted number input
const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return "";
  // Replace thousand separator and convert comma to dot for decimal
  return formattedValue.replace(/\./g, "").replace(",", ".");
};

const AddFeedStockPage = ({ feedId: preFeedId, onClose, onStockAdded }) => {
  const [feedId, setFeedId] = useState(preFeedId || "");
  const [additionalStock, setAdditionalStock] = useState("");
  const [formattedStock, setFormattedStock] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedName, setSelectedFeedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFeeds, setFetchingFeeds] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setFetchingFeeds(true);
      try {
        if (preFeedId) {
          const response = await getFeedById(preFeedId);
          if (response.success && response.feed) {
            setSelectedFeedName(response.feed.name);
            setFeedId(preFeedId);
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to fetch feed data",
              icon: "error"
            });
          }
        } else {
          const response = await getFeeds();
          if (response.success && response.feeds) {
            setFeeds(response.feeds);
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to fetch feeds data",
              icon: "error"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        Swal.fire({
          title: "Error",
          text: "Failed to fetch data: " + error.message,
          icon: "error"
        });
      } finally {
        setFetchingFeeds(false);
      }
    };
    
    fetchData();
  }, [preFeedId]);

  const handleStockChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers, comma, dot, and empty string
    const regex = /^[0-9.,]*$/;
    if (value !== "" && !regex.test(value)) {
      return; // Reject non-numeric input
    }
    
    // Remove formatting to store raw value
    const rawValue = parseFormattedNumber(value);
    
    // Make sure it's a valid number or empty
    if (rawValue === "" || !isNaN(parseFloat(rawValue))) {
      setAdditionalStock(rawValue);
      
      // Format for display if it's a valid number
      if (rawValue && !isNaN(parseFloat(rawValue))) {
        setFormattedStock(formatNumber(rawValue));
      } else {
        setFormattedStock(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedId) {
      Swal.fire({
        title: "Error", 
        text: "Please select a feed", 
        icon: "error"
      });
      return;
    }
    if (!additionalStock || parseFloat(additionalStock) <= 0) {
      Swal.fire({
        title: "Error", 
        text: "Please enter valid additional stock", 
        icon: "error"
      });
      return;
    }

    // Confirmation before adding stock
    const feedName = preFeedId ? selectedFeedName : feeds.find(f => f.id === feedId)?.name || "Selected feed";
    
    Swal.fire({
      title: "Konfirmasi",
      text: `Yakin ingin menambah stok pakan "${feedName}" sebanyak ${formatNumber(additionalStock)} kg?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, tambahkan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await AddFeedStock({ feedId, additionalStock });
          if (response.success) {
            Swal.fire({
              title: "Berhasil",
              text: "Stok berhasil ditambahkan",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              if (onStockAdded) {
                onStockAdded();
              }
            });
          } else {
            Swal.fire({
              title: "Error", 
              text: "Gagal menambahkan stok", 
              icon: "error"
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error", 
            text: "Gagal menambahkan stok: " + error.message, 
            icon: "error"
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // When input loses focus, ensure it's properly formatted
  const handleBlur = () => {
    if (additionalStock) {
      setFormattedStock(formatNumber(additionalStock));
    }
  };

  // When input gets focus, show raw value for easier editing
  const handleFocus = (e) => {
    e.target.select();
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
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
            {fetchingFeeds ? (
              <div className="text-center p-4">
                <div className="spinner-border text-info" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading feed data...</p>
              </div>
            ) : (
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
                    type="text"
                    id="additionalStock"
                    className="form-control"
                    value={formattedStock}
                    onChange={handleStockChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    required
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>
                <button type="submit" className="btn btn-info w-100" disabled={loading}>
                  {loading ? "Saving..." : "Add Stock"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeedStockPage;