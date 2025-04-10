import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getFeedStockById, updateFeedStock } from "../../../../api/pakan/feedstock";

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

const EditFeedStockPage = ({ stockId, feedId, onClose, onStockUpdated }) => {
  const [stockData, setStockData] = useState({
    feed: { name: "" },
    stock: ""
  });
  const [newStock, setNewStock] = useState("");
  const [formattedNewStock, setFormattedNewStock] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!stockId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await getFeedStockById(stockId);
        if (response.success && response.stock) {
          setStockData(response.stock);
          setNewStock(response.stock.stock);
          setFormattedNewStock(formatNumber(response.stock.stock));
        } else {
          Swal.fire({
            title: "Error", 
            text: "Failed to load stock data", 
            icon: "error"
          });
          if (onClose) {
            onClose();
          } else {
            navigate("/admin/pakan/stok");
          }
        }
      } catch (error) {
        console.error("Error fetching stock data:", error.message);
        Swal.fire({
          title: "Error", 
          text: "Failed to load stock data: " + error.message, 
          icon: "error"
        });
        if (onClose) {
          onClose();
        } else {
          navigate("/admin/pakan/stok");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stockId, navigate, onClose]);

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
      setNewStock(rawValue);
      
      // Format for display if it's a valid number
      if (rawValue && !isNaN(parseFloat(rawValue))) {
        setFormattedNewStock(formatNumber(rawValue));
      } else {
        setFormattedNewStock(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newStock === "" && newStock !== "0") {
      Swal.fire({
        title: "Error", 
        text: "Please enter stock amount", 
        icon: "error"
      });
      return;
    }
    
    // Confirmation before updating
    Swal.fire({
      title: "Konfirmasi",
      text: `Yakin ingin mengubah stok pakan "${stockData.feed?.name}" menjadi ${formatNumber(newStock)} kg?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, ubah",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSubmitting(true);
        try {
          const response = await updateFeedStock(stockId, { stock: newStock });
          
          if (response.success) {
            Swal.fire({
              title: "Berhasil",
              text: "Stock berhasil diperbarui",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              if (onStockUpdated) {
                onStockUpdated();
              } else {
                navigate("/admin/pakan/stok");
              }
            });
          } else {
            Swal.fire({
              title: "Error", 
              text: "Gagal memperbarui stok", 
              icon: "error"
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error", 
            text: "Gagal memperbarui stok: " + error.message, 
            icon: "error"
          });
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // When input loses focus, ensure it's properly formatted
  const handleBlur = () => {
    if (newStock) {
      setFormattedNewStock(formatNumber(newStock));
    }
  };

  // When input gets focus, show raw value for easier editing
  const handleFocus = (e) => {
    e.target.select();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/admin/pakan/stok");
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-warning fw-bold">Edit Stok Pakan</h4>
            <button
              className="btn-close"
              onClick={handleClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-warning" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading stock data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="feedName" className="form-label">Feed</label>
                  <input 
                    type="text" 
                    id="feedName" 
                    className="form-control" 
                    value={stockData.feed?.name || ""} 
                    readOnly 
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="currentStock" className="form-label">Current Stock (kg)</label>
                  <input
                    type="text"
                    id="currentStock"
                    className="form-control"
                    value={formatNumber(stockData.stock)}
                    readOnly
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="newStock" className="form-label">New Stock (kg)</label>
                  <input
                    type="text"
                    id="newStock"
                    className="form-control"
                    value={formattedNewStock}
                    onChange={handleStockChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    required
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>
                <button type="submit" className="btn btn-warning w-100" disabled={submitting}>
                  {submitting ? "Saving..." : "Update Stock"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFeedStockPage;