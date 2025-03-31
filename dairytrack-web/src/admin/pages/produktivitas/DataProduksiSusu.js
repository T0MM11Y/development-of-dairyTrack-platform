import { useEffect, useState } from "react";
import {
  getRawMilks,
  deleteRawMilk,
  createRawMilk,
  updateRawMilk,
} from "../../../api/produktivitas/rawMilk";
import { getCows } from "../../../api/peternakan/cow";
import RawMilkTable from "./RawMilkTable";
import Modal from "./Modal";

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
    last_session: 0,
    status: "fresh",
    formDataHidden: "", // Properti baru untuk menyimpan nilai tersembunyi
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
        session_description: formData.formDataHidden, // Gunakan formDataHidden
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
        last_session: 0,
        status: "fresh",
        formDataHidden: "", // Reset formDataHidden
      });
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      formDataHidden: "Add Raw Milk for session " + (prev.last_session + 1),
    }));
    fetchData();
    fetchCows();
  }, [formData.last_session]);

  const openModal = (type, rawMilk = null) => {
    setModalType(type);
    setSelectedRawMilk(rawMilk);
    if (type === "edit" && rawMilk) {
      setFormData({
        cow_id: rawMilk.cow_id,
        production_time: new Date(rawMilk.production_time)
          .toISOString()
          .slice(0, 16),
        volume_liters: rawMilk.volume_liters,
        previous_volume: rawMilk.previous_volume,
        status: rawMilk.status,
      });
    } else {
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: "",
        status: "fresh",
      });
    }
  };

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
        <RawMilkTable rawMilks={rawMilks} openModal={openModal} />
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
