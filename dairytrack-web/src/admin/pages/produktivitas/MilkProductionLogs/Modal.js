import React, { useEffect, useCallback } from "react";
import {
  checkRawMilkExpired,
  getRawMilksByCowId,
} from "../../../../api/produktivitas/rawMilk";

const Modal = ({
  modalType,
  formData,
  setFormData,
  cows,
  handleSubmit,
  handleDelete,
  setModalType,
  selectedRawMilk,
  isProcessing,
  handleCowChange,
}) => {
  const fetchPreviousVolume = useCallback(
    async (cowId) => {
      if (!cowId) return;

      try {
        const rawMilks = await getRawMilksByCowId(cowId);
        const lastMilkData = rawMilks?.[0];
        setFormData((prev) => ({
          ...prev,
          previous_volume: lastMilkData?.volume_liters || 0,
        }));
      } catch (error) {
        console.error("Error fetching previous volume:", error.message);
        setFormData((prev) => ({
          ...prev,
          previous_volume: 0,
        }));
      }
    },
    [setFormData]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cow_id) {
        fetchPreviousVolume(formData.cow_id);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cow_id, fetchPreviousVolume]);

  const resetForm = useCallback(() => {
    setFormData({
      cow_id: "",
      production_time: "",
      volume_liters: "",
      previous_volume: 0,
      status: "fresh",
      lactation_status: false,
      lactation_phase: "Dry",
    });
  }, [setFormData]);

  return (
    <div
      className="modal fade show d-block"
      style={{
        background: isProcessing ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
      role="dialog"
      onClick={() => !isProcessing && setModalType(null)}
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
              onClick={() => {
                setModalType(null);
                resetForm();
              }}
              disabled={isProcessing}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {isProcessing ? (
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="mb-3">
                  <label htmlFor="cow-select" className="form-label">
                    Cow
                  </label>
                  <select
                    id="cow-select"
                    className="form-control"
                    value={formData.cow_id}
                    onChange={(e) => handleCowChange(e.target.value)}
                    disabled={isProcessing || modalType === "edit"} // Nonaktifkan saat edit
                    required
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
                  <label htmlFor="production-time" className="form-label">
                    Production Time
                  </label>
                  <input
                    id="production-time"
                    type="datetime-local"
                    className="form-control"
                    value={formData.production_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        production_time: e.target.value,
                      })
                    }
                    disabled={isProcessing || modalType === "edit"} // Nonaktifkan saat edit
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="volume-liters" className="form-label">
                    Volume (Liters)
                  </label>
                  <input
                    id="volume-liters"
                    type="number"
                    className="form-control"
                    value={formData.volume_liters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volume_liters: e.target.value,
                      })
                    }
                    disabled={isProcessing} // Tetap dapat diedit
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="previous-volume" className="form-label">
                    Previous Volume
                  </label>
                  <input
                    id="previous-volume"
                    type="number"
                    className="form-control"
                    value={formData.previous_volume || 0}
                    readOnly
                    disabled={true} // Selalu nonaktif
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="lactation-phase" className="form-label">
                    Lactation Phase
                  </label>
                  <select
                    id="lactation-phase"
                    className="form-control"
                    value={formData.lactation_phase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lactation_phase: e.target.value,
                      })
                    }
                    disabled={!formData.lactation_status || isProcessing} // Disabled when lactation_status is unchecked
                  >
                    {!formData.lactation_status && (
                      <option value="Dry">Dry</option>
                    )}{" "}
                    {/* Show Dry only if lactation_status is unchecked */}
                    {formData.lactation_status && (
                      <>
                        <option value="Early">Early</option>
                        <option value="Mid">Mid</option>
                        <option value="Late">Late</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="mb-3 d-flex align-items-center">
                  <div className="form-check">
                    <input
                      id="lactation-status"
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={formData.lactation_status}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData({
                          ...formData,
                          lactation_status: isChecked,
                          lactation_phase: isChecked ? "Early" : "Dry", // Reset lactation_phase based on checkbox
                        });
                      }}
                      disabled={isProcessing} // Tetap dapat diedit
                    />
                    <label
                      htmlFor="lactation-status"
                      className="form-check-label"
                    >
                      Lactation Status
                    </label>
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
                setModalType(null);
                resetForm();
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
            {modalType === "delete" ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                Delete
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
