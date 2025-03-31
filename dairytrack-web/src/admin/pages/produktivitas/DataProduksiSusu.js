import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  getRawMilks,
  deleteRawMilk,
  createRawMilk,
  updateRawMilk,
  getRawMilkById,
  getRawMilksByCowId,
} from "../../../api/produktivitas/rawMilk";
import { getCows } from "../../../api/peternakan/cow";

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

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.cow_id) {
        fetchPreviousVolume(formData.cow_id);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData.cow_id]);

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
                setFormData({
                  cow_id: "",
                  production_time: "",
                  volume_liters: "",
                  previous_volume: 0,
                  status: "fresh",
                });
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
                setModalType(null);
                setFormData({
                  cow_id: "",
                  production_time: "",
                  volume_liters: "",
                  previous_volume: 0,
                  status: "fresh",
                });
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

const RawMilkTable = ({ rawMilks, openModal, loading }) => {
  const [updatedRawMilks, setUpdatedRawMilks] = useState([]);

  useEffect(() => {
    const calculateTimeLeft = (expirationTime) => {
      const now = new Date();
      const expiration = new Date(expirationTime);
      const diff = expiration - now;

      if (diff <= 0) return "Expired";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    const interval = setInterval(() => {
      const updated = rawMilks.map((rawMilk) => ({
        ...rawMilk,
        timeLeft: calculateTimeLeft(rawMilk.expiration_time),
      }));
      setUpdatedRawMilks(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [rawMilks]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading raw milk data...</p>
      </div>
    );
  }

  return (
    <div className="col-lg-12">
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Raw Milk Data</h4>
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cow Name</th>
                  <th>Production Time</th>
                  <th>Volume (Liters)</th>
                  <th>Previous Volume</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {updatedRawMilks.map((rawMilk, index) => (
                  <tr key={rawMilk.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{rawMilk.cow?.name || "Unknown"}</td>
                    <td>
                      {rawMilk.production_time
                        ? format(new Date(rawMilk.production_time), "PPpp")
                        : "N/A"}
                    </td>
                    <td>
                      {rawMilk.volume_liters || 0} L
                      <br />
                      <small style={{ fontSize: "10px", color: "gray" }}>
                        ({(rawMilk.volume_liters || 0) * 1000} mL)
                      </small>
                    </td>
                    <td>
                      {rawMilk.previous_volume || 0} L
                      <br />
                      <small style={{ fontSize: "10px", color: "gray" }}>
                        ({(rawMilk.previous_volume || 0) * 1000} mL)
                      </small>
                    </td>
                    <td>
                      {rawMilk.status === "fresh" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          Fresh
                          <br />
                          <small style={{ fontSize: "10px", color: "gray" }}>
                            {rawMilk.timeLeft}
                          </small>
                        </span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          Expired
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => openModal("edit", rawMilk.id)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => openModal("delete", rawMilk.id)}
                        className="btn btn-danger"
                      >
                        <i className="ri-delete-bin-6-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataProduksiSusu = () => {
  const [rawMilks, setRawMilks] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [selectedRawMilk, setSelectedRawMilk] = useState(null);
  const [formData, setFormData] = useState({
    cow_id: "",
    production_time: "",
    volume_liters: "",
    previous_volume: 0,
    status: "fresh",
    formDataHidden: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getRawMilks();
      setRawMilks(data);
    } catch (error) {
      console.error("Failed to fetch raw milk data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCows = async () => {
    try {
      const data = await getCows();
      setCows(data);
    } catch (error) {
      console.error("Failed to fetch cows data:", error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedRawMilk) return;

    setSubmitting(true);
    try {
      await deleteRawMilk(selectedRawMilk.id);
      fetchData();
      setModalType(null);
    } catch (error) {
      console.error("Failed to delete raw milk:", error.message);
      alert("Failed to delete raw milk: " + error.message);
    } finally {
      setSubmitting(false);
      setSelectedRawMilk(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updatedFormData = {
        ...formData,
      };

      if (modalType === "create") {
        await createRawMilk(updatedFormData);
      } else if (modalType === "edit") {
        await updateRawMilk(selectedRawMilk.id, updatedFormData);
      }
      fetchData();
      setModalType(null);
    } catch (error) {
      console.error("Failed to save raw milk:", error.message);
      alert("Failed to save raw milk: " + error.message);
    } finally {
      setSubmitting(false);
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
        formDataHidden: "",
      });
    }
  };

  const openModal = async (type, rawMilkId = null) => {
    setModalType(type);

    if (type === "delete" && rawMilkId) {
      const rawMilk = rawMilks.find((milk) => milk.id === rawMilkId);
      setSelectedRawMilk(rawMilk);
    } else if (type === "edit" && rawMilkId) {
      try {
        const rawMilk = await getRawMilkById(rawMilkId);
        setSelectedRawMilk(rawMilk);

        setFormData({
          cow_id: rawMilk.cow_id ?? "",
          production_time: rawMilk.production_time
            ? new Date(rawMilk.production_time).toISOString().slice(0, 16)
            : "",
          volume_liters: rawMilk.volume_liters ?? "",
          previous_volume: rawMilk.previous_volume ?? 0,
          status: rawMilk.status ?? "fresh",
        });
      } catch (error) {
        console.error("Failed to fetch raw milk by ID:", error.message);
      }
    } else {
      setSelectedRawMilk(null);
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
      });
    }
  };

  useEffect(() => {
    fetchData();
    fetchCows();
    if (modalType === "edit" && selectedRawMilk) {
      setFormData({
        cow_id: selectedRawMilk.cow_id || "",
        production_time: selectedRawMilk.production_time
          ? new Date(selectedRawMilk.production_time).toISOString().slice(0, 16)
          : "",
        volume_liters: selectedRawMilk.volume_liters || "",
        previous_volume: selectedRawMilk.previous_volume || 0,
        status: selectedRawMilk.status || "fresh",
      });
    } else if (modalType === "create") {
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
      });
    } else {
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
      });
    }
  }, [modalType, selectedRawMilk]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Raw Milk Data</h2>
        <button onClick={() => openModal("create")} className="btn btn-info">
          + Add Raw Milk
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading raw milk data...</p>
        </div>
      ) : (
        <RawMilkTable
          rawMilks={rawMilks}
          openModal={openModal}
          loading={loading}
        />
      )}

      {modalType && (
        <Modal
          modalType={modalType}
          formData={formData}
          setFormData={setFormData}
          cows={cows}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
          setModalType={setModalType}
          selectedRawMilk={selectedRawMilk}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default DataProduksiSusu;
