import React, { useEffect, useState } from "react";

const Modal = ({
  modalType,
  formData,
  setFormData,
  cows,
  handleSubmit,
  handleDelete,
  setModalType,
  selectedRawMilk,
  submitting,
}) => {
  const [timeLeft, setTimeLeft] = useState("");

  // Fungsi untuk menghitung sisa waktu
  const calculateTimeLeft = () => {
    const productionTime = new Date(formData.production_time);
    const currentTime = new Date();
    const diffInMs =
      productionTime.getTime() + 8 * 60 * 60 * 1000 - currentTime.getTime(); // 8 jam dalam milidetik

    if (diffInMs <= 0) {
      // Jika sudah lebih dari 8 jam, ubah status menjadi expired
      setFormData({ ...formData, status: "expired" });
      return "Expired";
    }

    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Perbarui sisa waktu setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000); // Perbarui setiap 1 detik

    // Hitung waktu saat pertama kali render
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(interval); // Bersihkan interval saat komponen unmount
  }, [formData.production_time]);

  return (
    <div
      className="modal fade show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
      role="dialog"
      onClick={() => setModalType(null)}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {modalType === "create"
                ? "Add Raw Milk"
                : modalType === "edit"
                ? "Edit Raw Milk"
                : "Delete Confirmation"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setModalType(null)}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {submitting ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Processing...</p>
              </div>
            ) : modalType === "delete" ? (
              <p>
                Are you sure you want to delete raw milk record{" "}
                <strong>{selectedRawMilk?.cow?.name || "this"}</strong>? This
                action cannot be undone.
              </p>
            ) : (
              <form>
                <div className="mb-3">
                  <label className="form-label">Cow</label>
                  <select
                    className="form-control"
                    value={formData.cow_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cow_id: e.target.value })
                    }
                  >
                    <option value="">Select Cow</option>
                    {cows.map((cow) => (
                      <option key={cow.id} value={cow.id}>
                        {cow.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Production Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.production_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        production_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Volume (Liters)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.volume_liters}
                    step="0.01"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volume_liters: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Previous Volume</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.previous_volume}
                    step="0.01"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previous_volume: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Status</label>
                  <div className="d-flex align-items-center">
                    <select
                      className="form-control"
                      value={formData.status}
                      disabled
                      style={{
                        color: formData.status === "fresh" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      <option value="fresh">Fresh</option>
                      <option value="expired">Expired</option>
                    </select>
                    <span
                      className="ms-4"
                      style={{
                        color: formData.status === "fresh" ? "green" : "red",
                        fontWeight: "bold",
                        fontSize: "0.8rem", // Ukuran font lebih kecil
                      }}
                    >
                      {formData.status === "fresh"
                        ? `(${timeLeft} left)`
                        : "Expired"}
                    </span>
                  </div>
                </div>
              </form>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalType(null)}
              disabled={submitting}
            >
              Cancel
            </button>
            {modalType === "delete" ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
