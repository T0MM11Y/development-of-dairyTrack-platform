import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getRawMilks,
  deleteRawMilk,
  createRawMilk,
  updateRawMilk,
  exportFarmersPDF,
  exportFarmersExcel,
  getRawMilkById,
} from "../../../../api/produktivitas/rawMilk";
import Swal from "sweetalert2";

import "jspdf-autotable";
import { getCowById, updateCow, getCows } from "../../../../api/peternakan/cow";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "./Modal";
import RawMilkTable from "./RawMilkTable";
const DataProduksiSusu = () => {
  // State management
  const [rawMilks, setRawMilks] = useState([]);
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [selectedRawMilk, setSelectedRawMilk] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter states
  const [selectedCow, setSelectedCow] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form data state with initial values
  const [formData, setFormData] = useState({
    cow_id: "",
    production_time: "",
    volume_liters: "",
    previous_volume: 0,
    status: "fresh",
    lactation_status: false,
    lactation_phase: "Dry",
  });

  // Cache for cow data to avoid repeated API calls
  const cowCache = useMemo(() => ({}), []);

  // Memoized filtered cows (only females)
  const filteredCows = useMemo(
    () => cows.filter((cow) => cow.gender !== "male"),
    [cows]
  );

  // Main data fetching function
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [milkData, cowData] = await Promise.all([getRawMilks(), getCows()]);
      setRawMilks(milkData);
      setCows(cowData);

      // Pre-populate cow cache
      cowData.forEach((cow) => {
        cowCache[cow.id] = cow;
      });
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      Swal.fire("Error", "Failed to fetch data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [cowCache]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized filtered raw milks based on search/filters
  const filteredRawMilks = useMemo(() => {
    if (!rawMilks.length) return [];

    const searchLower = searchQuery.toLowerCase();
    const selectedCowId = selectedCow ? parseInt(selectedCow, 10) : null;
    const selectedDateString = selectedDate?.toDateString();

    return rawMilks.filter((milk) => {
      const milkDate = new Date(milk.production_time).toDateString();

      return (
        (!selectedCowId || milk.cow?.id === selectedCowId) &&
        (!selectedDateString || milkDate === selectedDateString) &&
        (!selectedSession || milk.session === parseInt(selectedSession, 10)) &&
        (milk.cow?.name?.toLowerCase().includes(searchLower) ||
          milk.production_time?.toLowerCase().includes(searchLower) ||
          milk.volume_liters?.toString().includes(searchLower) ||
          milk.status?.toLowerCase().includes(searchLower))
      );
    });
  }, [rawMilks, searchQuery, selectedCow, selectedDate, selectedSession]);

  const handleExport = useCallback(async (type) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to export the ${type.toUpperCase()} file?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, export to ${type.toUpperCase()}!`,
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setExportLoading(true);
    try {
      if (type === "excel") {
        await exportFarmersExcel();
      } else if (type === "pdf") {
        await exportFarmersPDF();
      } else {
        throw new Error("Unsupported export type");
      }

      await Swal.fire("Success!", `File exported successfully.`, "success");
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      Swal.fire("Error!", `Failed to export: ${error.message}`, "error");
    } finally {
      setExportLoading(false);
    }
  }, []);

  // CRUD operations
  const handleDelete = useCallback(async () => {
    if (!selectedRawMilk) return;

    setIsProcessing(true);
    try {
      await deleteRawMilk(selectedRawMilk.id);
      await fetchData();
      setModalType(null);
      Swal.fire("Deleted!", "Record has been deleted.", "success");
    } catch (error) {
      console.error("Failed to delete:", error.message);
      Swal.fire("Error!", `Failed to delete: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
      setSelectedRawMilk(null);
    }
  }, [selectedRawMilk, fetchData]);

  const handleCowChange = useCallback(
    async (cowId) => {
      setFormData((prev) => ({ ...prev, cow_id: cowId }));
      if (!cowId) return;

      try {
        let cowData = cowCache[cowId] || (await getCowById(cowId));
        cowCache[cowId] = cowData;

        setFormData((prev) => ({
          ...prev,
          lactation_status: cowData.lactation_status || false,
          lactation_phase: cowData.lactation_phase || "Early",
        }));
      } catch (error) {
        console.error("Failed to fetch cow data:", error.message);
      }
    },
    [cowCache]
  );

  const validateForm = useCallback(() => {
    return ["cow_id", "production_time", "volume_liters"].every((field) =>
      formData[field]?.toString().trim()
    );
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Swal.fire("Warning", "Please fill all required fields", "warning");
      return;
    }

    setIsProcessing(true);
    try {
      if (modalType === "create") {
        await createRawMilk(formData);
      } else {
        await updateRawMilk(selectedRawMilk.id, formData);
      }

      if (formData.cow_id) {
        await updateCow(formData.cow_id, {
          lactation_status: formData.lactation_status,
          lactation_phase: formData.lactation_phase,
        });
        cowCache[formData.cow_id] = {
          ...cowCache[formData.cow_id],
          lactation_status: formData.lactation_status,
          lactation_phase: formData.lactation_phase,
        };
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
        lactation_phase: "Dry",
      });
      Swal.fire("Success!", "Record saved successfully.", "success");
    } catch (error) {
      console.error("Failed to save:", error.message);
      Swal.fire("Error!", `Failed to save: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  }, [modalType, formData, selectedRawMilk, fetchData, cowCache, validateForm]);

  const openModal = useCallback(
    async (type, rawMilkId = null) => {
      setModalType(type);

      if (type === "delete" && rawMilkId) {
        setSelectedRawMilk(rawMilks.find((milk) => milk.id === rawMilkId));
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
          if (rawMilk.cow_id) await handleCowChange(rawMilk.cow_id);
        } catch (error) {
          console.error("Failed to fetch raw milk:", error.message);
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
          lactation_phase: "Dry",
        });
      }
    },
    [rawMilks, handleCowChange]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  }, [fetchData]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3 d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center">
            <i className="bi bi-droplet-half me-2"></i> Milk Production Logs
          </span>
          <button
            className="btn btn-outline-primary p-2 rounded-circle"
            onClick={handleRefresh}
            title="Refresh Table"
            disabled={isRefreshing}
          >
            <i
              className="bi bi-arrow-clockwise"
              style={{
                transition: "transform 0.5s ease",
                transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
              }}
            ></i>
          </button>
        </h2>
      </div>

      {/* Filter Section */}
      <div className="card p-3 mb-4 bg-light">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-2">
            <label className="form-label">Filter by Cow</label>
            <select
              className="form-select"
              value={selectedCow}
              onChange={(e) => setSelectedCow(e.target.value)}
            >
              <option value="">All Cows</option>
              {filteredCows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-1">
            <label className="form-label">by Session</label>
            <select
              className="form-select"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="">All Sessions</option>
              <option value="1">Session 1</option>
              <option value="2">Session 2</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Filter by Date</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-calendar-event"></i>
              </span>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                placeholderText="Select Date"
                className="form-control"
                isClearable
              />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4 d-flex gap-2 justify-content-end">
            <button
              onClick={() => openModal("create")}
              className="btn btn-info d-flex align-items-center gap-1"
              disabled={isLoading}
            >
              <i className="bi bi-plus-circle"></i> Add Record
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="btn btn-success"
              disabled={exportLoading || !filteredRawMilks.length}
            >
              {exportLoading ? (
                "Exporting..."
              ) : (
                <>
                  <i className="ri-file-excel-2-line"></i> Export to Excel
                </>
              )}
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="btn btn-secondary"
              disabled={exportLoading || !filteredRawMilks.length}
            >
              {exportLoading ? (
                "Exporting..."
              ) : (
                <>
                  <i className="ri-file-pdf-line"></i> Export to PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Table */}
      <div className="card p-3">
        <RawMilkTable
          rawMilks={filteredRawMilks}
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
          cows={filteredCows}
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
