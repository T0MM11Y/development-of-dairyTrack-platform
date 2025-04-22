import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getFeedStockById, updateFeedStock } from "../../../../api/pakan/feedstock";

// Function to format numbers with thousand separator and remove trailing zeros
const formatNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  const parts = num.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (parts[1]) {
    parts[1] = parts[1].replace(/0+$/, "");
    return parts[1].length > 0 ? parts.join(",") : parts[0];
  }

  return parts[0];
};

// Function to parse formatted number input
const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return "";
  return formattedValue.replace(/\./g, "").replace(",", ".");
};

const EditFeedStockPage = ({ stockId, onStockUpdated, onClose }) => {
  const [stockData, setStockData] = useState({
    feed: { name: "" },
    stock: "",
  });
  const [newStock, setNewStock] = useState("");
  const [formattedNewStock, setFormattedNewStock] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!stockId) {
        Swal.fire({
          title: "Error",
          text: "Stock ID is required",
          icon: "error",
        });
        onClose();
        return;
      }

      try {
        setLoading(true);
        const response = await getFeedStockById(stockId);
        if (response.success && response.stock) {
          setStockData({
            feed: response.stock.feed || { name: "" },
            stock: response.stock.stock || 0,
          });
          setNewStock(response.stock.stock || "");
          setFormattedNewStock(formatNumber(response.stock.stock || 0));
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to load stock data",
            icon: "error",
          });
          onClose();
        }
      } catch (error) {
        console.error("Error fetching stock data:", error.message);
        Swal.fire({
          title: "Error",
          text: "Failed to load stock data: " + error.message,
          icon: "error",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stockId, onClose]);

  const handleStockChange = (e) => {
    const value = e.target.value;

    const regex = /^[0-9.,]*$/;
    if (value !== "" && !regex.test(value)) {
      return;
    }

    const rawValue = parseFormattedNumber(value);

    if (rawValue === "" || !isNaN(parseFloat(rawValue))) {
      setNewStock(rawValue);

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
        icon: "error",
      });
      return;
    }

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
              onStockUpdated();
              onClose();
            });
          } else {
            Swal.fire({
              title: "Error",
              text: "Gagal memperbarui stok",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Gagal memperbarui stok: " + error.message,
            icon: "error",
          });
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleBlur = () => {
    if (newStock) {
      setFormattedNewStock(formatNumber(newStock));
    }
  };

  const handleFocus = (e) => {
    e.target.select();
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
            <h4 className="modal-title text-warning fw-bold">
              Edit Stok Pakan
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
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
                  <label htmlFor="feedName" className="form-label">
                    Feed
                  </label>
                  <input
                    type="text"
                    id="feedName"
                    className="form-control"
                    value={stockData.feed?.name || ""}
                    readOnly
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="currentStock" className="form-label">
                    Current Stock (kg)
                  </label>
                  <input
                    type="text"
                    id="currentStock"
                    className="form-control"
                    value={formatNumber(stockData.stock || 0)}
                    readOnly
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="newStock" className="form-label">
                    New Stock (kg)
                  </label>
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
                <button
                  type="submit"
                  className="btn btn-warning w-100"
                  disabled={submitting}
                >
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