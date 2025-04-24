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
    Feed: { name: "" },
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
          timer: 1500,
          showConfirmButton: false,
        });
        onClose();
        return;
      }

      try {
        setLoading(true);
        const response = await getFeedStockById(stockId);
        console.log("getFeedStockById Response:", response);

        if (response.success && response.stock) {
          setStockData({
            Feed: response.stock.Feed || { name: "Unknown" },
            stock: response.stock.stock || 0,
          });
          setNewStock(response.stock.stock || "");
          setFormattedNewStock(formatNumber(response.stock.stock || 0));
        } else {
          Swal.fire({
            title: "Gagal",
            text: response.message || "Gagal memuat data stok pakan.",
            icon: "error",
            confirmButtonText: "OK",
          });
          onClose();
        }
      } catch (error) {
        console.error("Error fetching stock data:", error.message);
        Swal.fire({
          title: "Gagal",
          text: error.message || "Terjadi kesalahan saat memuat data stok pakan.",
          icon: "error",
          confirmButtonText: "OK",
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

    // Allow only numbers, dots, and commas
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
        title: "Gagal",
        text: "Masukkan jumlah stok pakan.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const newStockValue = parseFloat(newStock);
    if (newStockValue < 0) {
      Swal.fire({
        title: "Gagal",
        text: "Jumlah stok tidak boleh negatif.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    Swal.fire({
      title: "Konfirmasi",
      text: `Yakin ingin mengubah stok pakan "${stockData.Feed?.name}" menjadi ${formatNumber(newStock)} kg?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, ubah",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSubmitting(true);
        try {
          const response = await updateFeedStock(stockId, { stock: newStockValue });

          if (response.success) {
            Swal.fire({
              title: "Berhasil",
              text: "Stok pakan berhasil diperbarui.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              onStockUpdated();
              onClose();
            });
          } else {
            Swal.fire({
              title: "Gagal",
              text: response.message || "Gagal memperbarui stok pakan.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } catch (error) {
          console.error("Error updating stock:", error);
          Swal.fire({
            title: "Gagal",
            text: error.message || "Terjadi kesalahan saat memperbarui stok pakan.",
            icon: "error",
            confirmButtonText: "OK",
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
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-warning" role="status">
                  <span className="sr-only">Memuat...</span>
                </div>
                <p className="mt-2">Memuat data stok...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="feedName" className="form-label">
                    Pakan
                  </label>
                  <input
                    type="text"
                    id="feedName"
                    className="form-control"
                    value={stockData.Feed?.name || ""}
                    readOnly
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="currentStock" className="form-label">
                    Stok Saat Ini (kg)
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
                    Stok Baru (kg)
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
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-warning w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : null}
                  Update Stok
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
