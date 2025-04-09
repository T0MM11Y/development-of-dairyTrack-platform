import React, { useEffect, useState, useCallback } from "react";
import {
  getRawMilks,
  deleteRawMilk,
  createRawMilk,
  updateRawMilk,
  getRawMilkById,
  getRawMilksByCowId,
} from "../../../../api/produktivitas/rawMilk";
import { getCowById, updateCow } from "../../../../api/peternakan/cow";
import { getCows } from "../../../../api/peternakan/cow";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "./Modal";
import RawMilkTable from "./RawMilkTable";

const DataProduksiSusu = () => {
  const [rawMilks, setRawMilks] = useState([]);
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [selectedRawMilk, setSelectedRawMilk] = useState(null);
  const [selectedCow, setSelectedCow] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    cow_id: "",
    production_time: "",
    volume_liters: "",
    previous_volume: 0,
    status: "fresh",
    lactation_status: false,
    lactation_phase: "Early",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [milkData, cowData] = await Promise.all([getRawMilks(), getCows()]);
      setRawMilks(milkData);
      setCows(cowData);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async () => {
    if (!selectedRawMilk) return;

    setIsProcessing(true);
    try {
      await deleteRawMilk(selectedRawMilk.id);
      await fetchData();
      setModalType(null);
    } catch (error) {
      console.error("Failed to delete raw milk:", error.message);
      alert("Failed to delete raw milk: " + error.message);
    } finally {
      setIsProcessing(false);
      setSelectedRawMilk(null);
    }
  }, [selectedRawMilk, fetchData]);

  const handleCowChange = async (cowId) => {
    setFormData((prev) => ({ ...prev, cow_id: cowId }));

    if (!cowId) return;

    try {
      const cowData = await getCowById(cowId);
      setFormData((prev) => ({
        ...prev,
        lactation_status: cowData.lactation_status || false,
        lactation_phase: cowData.lactation_phase || "Early",
      }));
    } catch (error) {
      console.error("Failed to fetch cow data:", error.message);
    }
  };

  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (modalType === "create") {
        await createRawMilk(formData);
      } else if (modalType === "edit") {
        await updateRawMilk(selectedRawMilk.id, formData);
      }

      if (formData.cow_id) {
        await updateCow(formData.cow_id, {
          lactation_status: formData.lactation_status,
          lactation_phase: formData.lactation_phase,
        });
      }

      await fetchData();
      setModalType(null);
      setFormData({
        cow_id: "",
        production_time: "",
        volume_liters: "",
        previous_volume: 0,
        status: "fresh",
        lactation_status: false,
        lactation_phase: "Early",
      });
    } catch (error) {
      console.error("Failed to save raw milk:", error.message);
      alert("Failed to save raw milk: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [modalType, formData, selectedRawMilk, fetchData]);

  const validateForm = () => {
    const requiredFields = ["cow_id", "production_time", "volume_liters"];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        return false;
      }
    }
    return true;
  };

  const openModal = useCallback(
    async (type, rawMilkId = null) => {
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
            lactation_status: rawMilk.lactation_status ?? false,
            lactation_phase: rawMilk.lactation_phase ?? "Early",
          });

          // Panggil handleCowChange dengan cow_id yang sedang diedit
          if (rawMilk.cow_id) {
            await handleCowChange(rawMilk.cow_id);
          }
        } catch (error) {
          console.error("Failed to fetch raw milk data:", error.message);
        }
      } else {
        setSelectedRawMilk(null);
        setFormData({
          cow_id: "",
          production_time: "",
          volume_liters: "",
          previous_volume: 0,
          status: "fresh",
          lactation_status: false,
          lactation_phase: "Early",
        });
      }
    },
    [rawMilks, handleCowChange]
  );

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">
          <i className="bi bi-droplet-half"></i> Raw Milk Production
        </h2>
        <button
          onClick={() => openModal("create")}
          className="btn btn-info d-flex align-items-center gap-1"
          disabled={isLoading}
        >
          <i className="bi bi-plus-circle"></i> Add Record
        </button>
      </div>

      {/* Filter Section */}
      <div className="card p-3 mb-4 bg-light">
        <div className="row g-3 align-items-center">
          {/* Filter Cow Dropdown */}
          <div className="col-md-1 d-flex flex-column">
            <label className="form-label">by Cow</label>
            <select
              className="form-select"
              value={selectedCow}
              onChange={(e) => setSelectedCow(e.target.value)}
            >
              <option value="">All Cows</option>
              {cows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.name}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div className="col-md-1 d-flex flex-column">
            <label className="form-label">by Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="📅 Date"
              className="form-control"
              calendarClassName="custom-calendar"
              dayClassName={(date) =>
                date.getDay() === 0 || date.getDay() === 6
                  ? "weekend-day"
                  : undefined
              }
            />
          </div>

          {/* Search Field */}
          <div className="col-md-3 d-flex flex-column">
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder=" 🔍 Search..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Clear All Filters Button */}
          <div
            className="col-md-1 d-flex flex-column align-items-end"
            style={{ marginTop: "auto" }}
          >
            <label className="form-label d-none">&nbsp;</label>
            <button
              className="btn btn-danger waves-effect waves-light w-70"
              onClick={() => {
                setSelectedCow("");
                setSelectedDate(null);
                setSearchQuery("");
              }}
            >
              <i class="ri-close-line align-middle me-2"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Table */}
      <div className="card p-3">
        <RawMilkTable
          rawMilks={rawMilks.filter((milk) => {
            const searchLower = searchQuery.toLowerCase();
            const selectedCowId = selectedCow
              ? parseInt(selectedCow, 10)
              : null;
            const cowNameMatch =
              !selectedCowId || milk.cow?.id === selectedCowId;
            const dateMatch =
              !selectedDate ||
              new Date(milk.production_time).toDateString() ===
                selectedDate.toDateString();
            const searchMatch =
              milk.cow?.name?.toLowerCase().includes(searchLower) ||
              milk.production_time?.toLowerCase().includes(searchLower) ||
              milk.volume_liters
                ?.toString()
                .toLowerCase()
                .includes(searchLower) ||
              milk.previous_volume
                ?.toString()
                .toLowerCase()
                .includes(searchLower) ||
              milk.status?.toLowerCase().includes(searchLower);

            return cowNameMatch && dateMatch && searchMatch;
          })}
          openModal={openModal}
          isLoading={isLoading}
        />
      </div>

      {/* Modal */}
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
          isProcessing={isProcessing}
          handleCowChange={handleCowChange}
        />
      )}
    </div>
  );
};

export default DataProduksiSusu;
