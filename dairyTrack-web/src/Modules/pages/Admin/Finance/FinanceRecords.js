import React, { useState, useEffect } from "react";
import {
  Card,
  Spinner,
  Button,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { format } from "date-fns";
import financeController from "../../../controllers/financeController.js";
import usePermissions from "../Permission/usePermission.js";
import FinanceRecordsStats from "./FinanceRecordsStats";
import FinanceRecordsFilters from "./FinanceRecordsFilters";
import FinanceRecordsTable from "./FinanceRecordsTable";
import FinanceRecordsModals from "./FinanceRecordsModals";

const FinanceRecords = () => {
  const {
    currentUser: permissionsUser,
    disableIfSupervisor,
    restrictSupervisorAction,
    error: permissionsError,
  } = usePermissions();

  const [records, setRecords] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showEditIncomeModal, setShowEditIncomeModal] = useState(false);
  const [showViewIncomeModal, setShowViewIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showViewExpenseModal, setShowViewExpenseModal] = useState(false);
  const [showIncomeTypeModal, setShowIncomeTypeModal] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newIncome, setNewIncome] = useState({
    amount: "",
    income_type: "",
    transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: "",
    created_by: "",
  });
  const [newExpense, setNewExpense] = useState({
    amount: "",
    expense_type: "",
    transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: "",
    created_by: "",
  });
  const recordsPerPage = 8;

  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(parseFloat(value)))
      return "Rp 0,00";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.user_id) {
        const userId = parseInt(userData.user_id);
        if (isNaN(userId)) {
          throw new Error("Invalid user ID in localStorage.");
        }
        setCurrentUser({ ...userData, user_id: userId });
        setNewIncome((prev) => ({ ...prev, created_by: userId }));
        setNewExpense((prev) => ({ ...prev, created_by: userId }));
      } else {
        setError("User not logged in. Please log in to continue.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User not logged in. Please log in to continue.",
        });
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setError("Failed to load user data. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load user data. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          incomeResponse,
          expenseResponse,
          incomeTypesResponse,
          expenseTypesResponse,
        ] = await Promise.all([
          financeController.getIncomes(),
          financeController.getExpenses(),
          financeController.getIncomeTypes(),
          financeController.getExpenseTypes(),
        ]);

        if (!incomeResponse.success) throw new Error(incomeResponse.message);
        if (!expenseResponse.success) throw new Error(expenseResponse.message);
        if (!incomeTypesResponse.success)
          throw new Error(incomeTypesResponse.message);
        if (!expenseTypesResponse.success)
          throw new Error(expenseTypesResponse.message);

        const incomes = incomeResponse.incomes.map((item) => ({
          ...item,
          type: "income",
          category: item.income_type_detail?.name || "Unknown",
          created_by: item.created_by
            ? {
                ...item.created_by,
                id: item.created_by.id ? parseInt(item.created_by.id) : null,
              }
            : null,
          updated_by: item.updated_by
            ? {
                ...item.updated_by,
                id: item.updated_by.id ? parseInt(item.updated_by.id) : null,
              }
            : null,
        }));
        const expenses = expenseResponse.expenses.map((item) => ({
          ...item,
          type: "expense",
          category: item.expense_type_detail?.name || "Unknown",
          created_by: item.created_by
            ? {
                ...item.created_by,
                id: item.created_by.id ? parseInt(item.created_by.id) : null,
              }
            : null,
          updated_by: item.updated_by
            ? {
                ...item.updated_by,
                id: item.created_by.id ? parseInt(item.created_by.id) : null,
              }
            : null,
        }));

        setRecords([...incomes, ...expenses]);
        setIncomeTypes(incomeTypesResponse.incomeTypes);
        setExpenseTypes(expenseTypesResponse.expenseTypes);
        setError(null);
      } catch (error) {
        console.error("Error fetching finance data:", error);
        setError("Failed to fetch finance data. Please try again.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      setError("User not logged in or invalid user ID.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    const incomeData = {
      amount: parseFloat(newIncome.amount),
      income_type: parseInt(newIncome.income_type),
      transaction_date: new Date(newIncome.transaction_date).toISOString(),
      description: newIncome.description,
      created_by: parseInt(currentUser.user_id),
    };

    try {
      const response = await financeController.createIncome(incomeData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Income added successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await financeController.getIncomes();
        if (refreshedResponse.success) {
          const updatedIncomes = refreshedResponse.incomes.map((item) => ({
            ...item,
            type: "income",
            category: item.income_type_detail?.name || "Unknown",
            created_by: item.created_by
              ? {
                  ...item.created_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
            updated_by: item.updated_by
              ? {
                  ...item.updated_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
          }));
          setRecords((prev) => [
            ...prev.filter((r) => r.type !== "income"),
            ...updatedIncomes,
          ]);
        }
        setShowAddIncomeModal(false);
        setNewIncome({
          amount: "",
          income_type: "",
          transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          description: "",
          created_by: currentUser.user_id,
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
      console.error("Error adding income:", error);
      setError("An unexpected error occurred while adding the income.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while adding the income.",
      });
    }
  };

  const handleEditIncome = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      setError("User not logged in or invalid user ID.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    const incomeData = {
      amount: parseFloat(selectedRecord.amount),
      income_type: parseInt(selectedRecord.income_type),
      transaction_date: new Date(selectedRecord.transaction_date).toISOString(),
      description: selectedRecord.description,
      created_by:
        selectedRecord.created_by?.id || parseInt(currentUser.user_id),
      updated_by: parseInt(currentUser.user_id),
    };

    try {
      const response = await financeController.updateIncome(
        selectedRecord.id,
        incomeData
      );
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Income updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await financeController.getIncomes();
        if (refreshedResponse.success) {
          const updatedIncomes = refreshedResponse.incomes.map((item) => ({
            ...item,
            type: "income",
            category: item.income_type_detail?.name || "Unknown",
            created_by: item.created_by
              ? {
                  ...item.created_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
            updated_by: item.updated_by
              ? {
                  ...item.updated_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
          }));
          setRecords((prev) => [
            ...prev.filter((r) => r.type !== "income"),
            ...updatedIncomes,
          ]);
        }
        setShowEditIncomeModal(false);
        setSelectedRecord(null);
      } else {
        setError(response.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    } catch (error) {
      console.error("Error editing income:", error);
      setError("An unexpected error occurred while editing the income.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while editing the income.",
      });
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    const record = records.find(
      (r) => r.id === incomeId && r.type === "income"
    );
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete income "${record?.description}". This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await financeController.deleteIncome(incomeId);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Income deleted successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
          setRecords((prev) =>
            prev.filter((r) => !(r.id === incomeId && r.type === "income"))
          );
        } else {
          setError(response.message);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      } catch (error) {
        console.error("Error deleting income:", error);
        setError("An unexpected error occurred while deleting the income.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while deleting the income.",
        });
      }
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      setError("User not logged in or invalid user ID.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    const expenseData = {
      amount: parseFloat(newExpense.amount),
      expense_type: parseInt(newExpense.expense_type),
      transaction_date: new Date(newExpense.transaction_date).toISOString(),
      description: newExpense.description,
      created_by: parseInt(currentUser.user_id),
    };

    try {
      const response = await financeController.createExpense(expenseData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Expense added successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await financeController.getExpenses();
        if (refreshedResponse.success) {
          const updatedExpenses = refreshedResponse.expenses.map((item) => ({
            ...item,
            type: "expense",
            category: item.expense_type_detail?.name || "Unknown",
            created_by: item.created_by
              ? {
                  ...item.created_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
            updated_by: item.updated_by
              ? {
                  ...item.updated_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
          }));
          setRecords((prev) => [
            ...prev.filter((r) => r.type !== "expense"),
            ...updatedExpenses,
          ]);
        }
        setShowAddExpenseModal(false);
        setNewExpense({
          amount: "",
          expense_type: "",
          transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          description: "",
          created_by: currentUser.user_id,
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
      console.error("Error adding expense:", error);
      setError("An unexpected error occurred while adding the expense.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while adding the expense.",
      });
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      setError("User not logged in or invalid user ID.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    const expenseData = {
      amount: parseFloat(selectedRecord.amount),
      expense_type: parseInt(selectedRecord.expense_type),
      transaction_date: new Date(selectedRecord.transaction_date).toISOString(),
      description: selectedRecord.description,
      created_by:
        selectedRecord.created_by?.id || parseInt(currentUser.user_id),
      updated_by: parseInt(currentUser.user_id),
    };

    try {
      const response = await financeController.updateExpense(
        selectedRecord.id,
        expenseData
      );
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Expense updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await financeController.getExpenses();
        if (refreshedResponse.success) {
          const updatedExpenses = refreshedResponse.expenses.map((item) => ({
            ...item,
            type: "expense",
            category: item.expense_type_detail?.name || "Unknown",
            created_by: item.created_by
              ? {
                  ...item.created_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
            updated_by: item.updated_by
              ? {
                  ...item.updated_by,
                  id: item.created_by.id ? parseInt(item.created_by.id) : null,
                }
              : null,
          }));
          setRecords((prev) => [
            ...prev.filter((r) => r.type !== "expense"),
            ...updatedExpenses,
          ]);
        }
        setShowEditExpenseModal(false);
        setSelectedRecord(null);
      } else {
        setError(response.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    } catch (error) {
      console.error("Error editing expense:", error);
      setError("An unexpected error occurred while editing the expense.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while editing the expense.",
      });
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const record = records.find(
      (r) => r.id === expenseId && r.type === "expense"
    );
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete expense "${record?.description}". This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await financeController.deleteExpense(expenseId);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Expense deleted successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
          setRecords((prev) =>
            prev.filter((r) => !(r.id === expenseId && r.type === "expense"))
          );
        } else {
          setError(response.message);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
        setError("An unexpected error occurred while deleting the expense.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while deleting the expense.",
        });
      }
    }
  };

  const handleIncomeTypeSave = async (incomeTypeData, isEdit, incomeTypeId) => {
    try {
      const cleanedData = {
        name: incomeTypeData.name,
        description: incomeTypeData.description,
        created_by: parseInt(incomeTypeData.created_by),
        updated_by: parseInt(incomeTypeData.updated_by),
      };

      let response;
      if (isEdit) {
        response = await financeController.updateIncomeType(
          incomeTypeId,
          cleanedData
        );
      } else {
        response = await financeController.createIncomeType(cleanedData);
      }
      if (response.success) {
        const refreshedResponse = await financeController.getIncomeTypes();
        if (refreshedResponse.success) {
          setIncomeTypes(refreshedResponse.incomeTypes);
        }
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
        return false;
      }
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} income type:`,
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `An unexpected error occurred while ${
          isEdit ? "updating" : "creating"
        } the income type.`,
      });
      return false;
    }
  };

  const handleIncomeTypeDelete = async (incomeTypeId) => {
    try {
      const response = await financeController.deleteIncomeType(incomeTypeId);
      if (response.success) {
        const refreshedResponse = await financeController.getIncomeTypes();
        if (refreshedResponse.success) {
          setIncomeTypes(refreshedResponse.incomeTypes);
        }
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting income type:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while deleting the income type.",
      });
      return false;
    }
  };

  const handleExpenseTypeSave = async (
    expenseTypeData,
    isEdit,
    expenseTypeId
  ) => {
    try {
      const cleanedData = {
        name: expenseTypeData.name,
        description: expenseTypeData.description,
        created_by: parseInt(expenseTypeData.created_by),
        updated_by: parseInt(expenseTypeData.updated_by),
      };

      let response;
      if (isEdit) {
        response = await financeController.updateExpenseType(
          expenseTypeId,
          cleanedData
        );
      } else {
        response = await financeController.createExpenseType(cleanedData);
      }
      if (response.success) {
        const refreshedResponse = await financeController.getExpenseTypes();
        if (refreshedResponse.success) {
          setExpenseTypes(refreshedResponse.expenseTypes);
        }
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
        return false;
      }
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} expense type:`,
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `An unexpected error occurred while ${
          isEdit ? "updating" : "creating"
        } the expense type.`,
      });
      return false;
    }
  };

  const handleExpenseTypeDelete = async (expenseTypeId) => {
    try {
      const response = await financeController.deleteExpenseType(expenseTypeId);
      if (response.success) {
        const refreshedResponse = await financeController.getExpenseTypes();
        if (refreshedResponse.success) {
          setExpenseTypes(refreshedResponse.expenseTypes);
        }
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting expense type:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while deleting the expense type.",
      });
      return false;
    }
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    if (record.type === "income") {
      setShowViewIncomeModal(true);
    } else if (record.type === "expense") {
      setShowViewExpenseModal(true);
    }
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    if (record.type === "income") {
      setShowEditIncomeModal(true);
    } else if (record.type === "expense") {
      setShowEditExpenseModal(true);
    }
  };

  const handleDeleteRecord = (record) => {
    if (record.type === "income") {
      handleDeleteIncome(record.id);
    } else if (record.type === "expense") {
      handleDeleteExpense(record.id);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || permissionsError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          {error || permissionsError}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-sm border-0 rounded">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4
            className="mb-0"
            style={{
              color: "#3D90D7",
              fontSize: "25px",
              fontFamily: "Roboto, Monospace",
              letterSpacing: "1.4px",
            }}
          >
            <i className="fas fa-wallet me-2" /> Finance Records Management
          </h4>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-end mb-3 gap-2">
            <Button
              variant="primary"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                if (
                  !restrictSupervisorAction(
                    () => setShowAddIncomeModal(true),
                    "add income"
                  )
                ) {
                  setShowAddIncomeModal(true);
                }
              }}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
                ...disableIfSupervisor.style,
              }}
              {...disableIfSupervisor}
            >
              <i className="fas fa-plus me-2" /> Add Income
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                if (
                  !restrictSupervisorAction(
                    () => setShowAddExpenseModal(true),
                    "add expense"
                  )
                ) {
                  setShowAddExpenseModal(true);
                }
              }}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
                ...disableIfSupervisor.style,
              }}
              {...disableIfSupervisor}
            >
              <i className="fas fa-plus me-2" /> Add Expense
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                if (
                  !restrictSupervisorAction(
                    () => setShowIncomeTypeModal(true),
                    "manage income types"
                  )
                ) {
                  setShowIncomeTypeModal(true);
                }
              }}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
                ...disableIfSupervisor.style,
              }}
              {...disableIfSupervisor}
            >
              <i className="fas fa-list me-2" /> Manage Income Types
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                if (
                  !restrictSupervisorAction(
                    () => setShowExpenseTypeModal(true),
                    "manage expense types"
                  )
                ) {
                  setShowExpenseTypeModal(true);
                }
              }}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
                ...disableIfSupervisor.style,
              }}
              {...disableIfSupervisor}
            >
              <i className="fas fa-list me-2" /> Manage Expense Types
            </Button>
          </div>
          <FinanceRecordsStats records={records} formatRupiah={formatRupiah} />
          <FinanceRecordsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            setCurrentPage={setCurrentPage}
          />
          <FinanceRecordsTable
            records={records}
            searchTerm={searchTerm}
            selectedType={selectedType}
            currentPage={currentPage}
            recordsPerPage={recordsPerPage}
            setCurrentPage={setCurrentPage}
            openViewModal={openViewModal}
            openEditModal={(record) => {
              if (
                !restrictSupervisorAction(
                  () => openEditModal(record),
                  "edit record"
                )
              ) {
                openEditModal(record);
              }
            }}
            handleDeleteRecord={(record) => {
              if (
                !restrictSupervisorAction(
                  () => handleDeleteRecord(record),
                  "delete record"
                )
              ) {
                handleDeleteRecord(record);
              }
            }}
            formatRupiah={formatRupiah}
            disableIfSupervisor={disableIfSupervisor}
          />
          <FinanceRecordsModals
            showAddIncomeModal={showAddIncomeModal}
            setShowAddIncomeModal={setShowAddIncomeModal}
            showEditIncomeModal={showEditIncomeModal}
            setShowEditIncomeModal={setShowEditIncomeModal}
            showViewIncomeModal={showViewIncomeModal}
            setShowViewIncomeModal={setShowViewIncomeModal}
            showAddExpenseModal={showAddExpenseModal}
            setShowAddExpenseModal={setShowAddExpenseModal}
            showEditExpenseModal={showEditExpenseModal}
            setShowEditExpenseModal={setShowEditExpenseModal}
            showViewExpenseModal={showViewExpenseModal}
            setShowViewExpenseModal={setShowViewExpenseModal}
            showIncomeTypeModal={showIncomeTypeModal}
            setShowIncomeTypeModal={setShowIncomeTypeModal}
            showExpenseTypeModal={showExpenseTypeModal}
            setShowExpenseTypeModal={setShowExpenseTypeModal}
            newIncome={newIncome}
            setNewIncome={setNewIncome}
            newExpense={newExpense}
            setNewExpense={setNewExpense}
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            incomeTypes={incomeTypes}
            expenseTypes={expenseTypes}
            currentUser={currentUser}
            handleAddIncome={handleAddIncome}
            handleEditIncome={handleEditIncome}
            handleAddExpense={handleAddExpense}
            handleEditExpense={handleEditExpense}
            handleIncomeTypeSave={handleIncomeTypeSave}
            handleIncomeTypeDelete={handleIncomeTypeDelete}
            handleExpenseTypeSave={handleExpenseTypeSave}
            handleExpenseTypeDelete={handleExpenseTypeDelete}
            formatRupiah={formatRupiah}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default FinanceRecords;