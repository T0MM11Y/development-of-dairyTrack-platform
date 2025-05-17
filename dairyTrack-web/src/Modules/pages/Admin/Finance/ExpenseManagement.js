// src/pages/ExpenseManagementPage.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import financeController from "../controllers/financeController";
import ExpenseTable from "../components/ExpenseTable";

const ExpenseManagementPage = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const expenseResponse = await financeController.getExpenses();
      if (!expenseResponse.success) throw new Error(expenseResponse.message);

      setExpenseData(expenseResponse.expenses || []);
      setError("");
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError(
        "Failed to fetch expenses. Please ensure the API server is active."
      );
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !expenseData.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error && !expenseData.length) {
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
            <i className="fas fa-arrow-down mr-2"></i> Expense Management
          </h2>
        </div>
        <div className="p-6">
          <ExpenseTable
            expenses={expenseData}
            formatRupiah={formatRupiah}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagementPage;
