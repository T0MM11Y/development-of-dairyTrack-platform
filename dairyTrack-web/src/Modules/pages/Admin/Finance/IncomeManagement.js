// src/pages/IncomeManagementPage.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import financeController from "../controllers/financeController";
import IncomeTable from "../components/IncomeTable";
import AddIncomeModal from "../components/AddIncomeModal";
import EditIncomeModal from "../components/EditIncomeModal";

const IncomeManagementPage = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    const number = parseFloat(value.toString());
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incomeResponse, incomeTypesResponse] = await Promise.all([
        financeController.getIncomes(),
        financeController.getIncomeTypes(),
      ]);

      if (!incomeResponse.success) throw new Error(incomeResponse.message);
      if (!incomeTypesResponse.success)
        throw new Error(incomeTypesResponse.message);

      setIncomeData(incomeResponse.incomes || []);
      setIncomeTypes(incomeTypesResponse.incomeTypes || []);
      setError("");
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setError(
        "Failed to fetch incomes. Please ensure the API server is active."
      );
      setIncomeData([]);
      setIncomeTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (newIncome) => {
    try {
      const response = await financeController.createIncome(newIncome);
      if (response.success) {
        setIncomeData([...incomeData, response.income]);
        setShowAddModal(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Income added successfully!",
        });
      } else {
        setError(response.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    } catch (error) {
      const errorMessage = "Failed to save income: " + error.message;
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleEditIncome = async (updatedIncome) => {
    try {
      const response = await financeController.updateIncome(
        selectedIncome.id,
        updatedIncome
      );
      if (response.success) {
        setIncomeData(
          incomeData.map((income) =>
            income.id === selectedIncome.id ? response.income : income
          )
        );
        setShowEditModal(false);
        setSelectedIncome(null);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Income updated successfully!",
        });
      } else {
        setError(response.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    } catch (error) {
      const errorMessage = "Failed to update income: " + error.message;
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleDeleteIncome = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This income will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        const response = await financeController.deleteIncome(id);
        if (response.success) {
          setIncomeData(incomeData.filter((income) => income.id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Income deleted successfully!",
          });
        } else {
          setError(response.message);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      } catch (error) {
        const errorMessage = "Failed to delete income: " + error.message;
        setError(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !incomeData.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error && !incomeData.length) {
    return (
      <div className="container mx-auto mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-2xl font-nunito font-semibold flex items-center">
            <i className="fas fa-arrow-up mr-2"></i> Income Management
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bx bx-plus mr-1"></i> Add Income
            </button>
          </div>
          <IncomeTable
            incomes={incomeData}
            formatRupiah={formatRupiah}
            onEdit={(income) => {
              setSelectedIncome(income);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteIncome}
            loading={loading}
          />
          <AddIncomeModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSaved={handleAddIncome}
            incomeTypes={incomeTypes}
          />
          <EditIncomeModal
            show={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedIncome(null);
            }}
            onSaved={handleEditIncome}
            income={selectedIncome}
            incomeTypes={incomeTypes}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeManagementPage;
