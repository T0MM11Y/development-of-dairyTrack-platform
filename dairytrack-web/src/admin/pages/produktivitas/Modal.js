import React, { useEffect, useState } from "react";
import {
  getRawMilksByCowId,
  getTodayLastSessionbyCowID,
} from "../../../api/produktivitas/rawMilk";

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
  const [isLoading, setIsLoading] = useState(false);

  // Reset formData setiap kali modalType berubah
  useEffect(() => {
    if (modalType) {
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
      });
    } else {
      // Reset formData saat modal ditutup
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
      });
    }
  }, [modalType, setFormData]);
  const fetchPreviousVolume = async (cowId) => {
    if (!cowId) return;

    setIsLoading(true); // Set loading to true
    try {
      // Panggil API untuk mendapatkan data susu terakhir
      const rawMilks = await getRawMilksByCowId(cowId);
      const lastMilkData = rawMilks?.[0]; // Ambil data susu terakhir

      // Panggil API untuk mendapatkan session terakhir hari ini
      const lastSession = await getTodayLastSessionbyCowID(cowId);

      // Update formData dengan previous_volume dan last_session
      setFormData((prev) => ({
        ...prev,
        previous_volume: lastMilkData?.volume_liters || 0,
        last_session: lastSession.session || 0, // Update last_session
      }));
    } catch (error) {
      console.error(
        "Error fetching previous volume or last session:",
        error.message
      );

      // Jika terjadi error, set previous_volume dan last_session ke 0
      setFormData((prev) => ({
        ...prev,
        previous_volume: 0,
        last_session: 0,
      }));
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    if (formData.cow_id) {
      fetchPreviousVolume(formData.cow_id); // Panggil ulang fungsi saat cow_id berubah
    } else {
      // Reset previous_volume dan last_session jika cow_id kosong
      setFormData((prev) => ({
        ...prev,
        previous_volume: 0,
        last_session: 0,
      }));
    }
  }, [formData.cow_id]); // Tambahkan dependensi cow_id
  return (
    <div
      className="modal fade show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
      onClick={() => setModalType(null)}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {modalType === "create"
                ? "Add Raw Milk for session " + (formData.last_session + 1)
                : modalType === "edit"
                ? "Edit Raw Milk"
                : "Delete Confirmation"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setModalType(null); // Menutup modal
                setFormData({
                  cow_id: "",
                  production_time: "",
                  volume_liters: "",
                  previous_volume: 0,
                  status: "fresh",
                }); // Mereset formData
              }}
              disabled={submitting || isLoading}
            ></button>
          </div>
          <div className="modal-body">
            {submitting || isLoading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>{submitting ? "Processing..." : "Loading data..."}</p>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Volume (Liters)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.volume_liters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volume_liters: e.target.value,
                      })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Previous Volume</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.previous_volume || 0}
                    readOnly
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <div className="d-flex align-items-center">
                    <select
                      className="form-control"
                      value={formData.status}
                      disabled
                    >
                      <option value="fresh">Fresh</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </form>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setModalType(null); // Menutup modal
                setFormData({
                  cow_id: "",
                  production_time: "",
                  volume_liters: "",
                  previous_volume: 0,
                  status: "fresh",
                }); // Mereset formData
              }}
              disabled={submitting || isLoading}
            >
              Cancel
            </button>
            {modalType === "delete" ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting || isLoading}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || isLoading}
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
