import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spinner,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  FormControl,
  Modal,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { format } from "date-fns";
import financeController from "../../../controllers/financeController.js";
import usePermissions from "../Permission/usePermission.js";

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

  // Define openViewModal
  const openViewModal = (record) => {
    setSelectedRecord(record);
    if (record.type === "income") {
      setShowViewIncomeModal(true);
    } else if (record.type === "expense") {
      setShowViewExpenseModal(true);
    }
  };

  // Define openEditModal
  const openEditModal = (record) => {
    setSelectedRecord(record);
    if (record.type === "income") {
      setShowEditIncomeModal(true);
    } else if (record.type === "expense") {
      setShowEditExpenseModal(true);
    }
  };

  // Define handleDeleteRecord
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

const FinanceRecordsStats = ({ records, formatRupiah }) => {
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const totalExpense = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    return { totalRecords, totalIncome, totalExpense };
  }, [records]);

  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Records</h6>
                <h2 className="mt-2 mb-0">{stats.totalRecords}</h2>
              </div>
              <div>
                <i className="fas fa-list fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-success text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Income</h6>
                <h2 className="mt-2 mb-0">{formatRupiah(stats.totalIncome)}</h2>
              </div>
              <div>
                <i className="fas fa-arrow-up fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="bg-danger text-white mb-3 shadow-sm opacity-75">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title mb-0">Total Expense</h6>
                <h2 className="mt-2 mb-0">
                  {formatRupiah(stats.totalExpense)}
                </h2>
              </div>
              <div>
                <i className="fas fa-arrow-down fa-3x opacity-50"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

const FinanceRecordsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  setCurrentPage,
}) => {
  return (
    <Row className="mb-4">
      <Col md={6} lg={5}>
        <InputGroup className="shadow-sm mb-3">
          <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              <i className="bi bi-x-lg" />
            </Button>
          )}
        </InputGroup>
      </Col>
      <Col md={6} lg={5}>
        <Form.Group className="mb-3">
          <Form.Select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6} lg={2}>
        <Button
          variant="outline-primary"
          size="sm"
          className="mt-2 w-100"
          onClick={() => {
            setSearchTerm("");
            setSelectedType("");
            setCurrentPage(1);
          }}
          style={{ letterSpacing: "0.5px" }}
        >
          <i className="fas fa-sync-alt me-2"></i> Reset Filters
        </Button>
      </Col>
    </Row>
  );
};

const FinanceRecordsTable = ({
  records,
  searchTerm,
  selectedType,
  currentPage,
  recordsPerPage,
  setCurrentPage,
  openViewModal,
  openEditModal,
  handleDeleteRecord,
  formatRupiah,
  disableIfSupervisor,
}) => {
  const filteredAndPaginatedRecords = useMemo(() => {
    let filtered = records.filter((r) => {
      const matchesSearch = r.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = selectedType ? r.type === selectedType : true;
      return matchesSearch && matchesType;
    });

    filtered = [...filtered].sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + recordsPerPage
    );

    return {
      filteredRecords: filtered,
      currentRecords: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [records, searchTerm, selectedType, currentPage, recordsPerPage]);

  return (
    <>
      <div className="table-responsive">
        <table
          className="table table-hover border rounded shadow-sm"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <thead className="bg-gradient-light">
            <tr
              style={{
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: "0.4px",
              }}
            >
              <th
                className="py-3 text-center"
                style={{
                  width: "5%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                #
              </th>
              <th
                className="py-3"
                style={{
                  width: "25%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Description
              </th>
              <th
                className="py-3"
                style={{
                  width: "20%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Category
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Type
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Amount
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Date
              </th>
              <th
                className="py-3 text-center"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndPaginatedRecords.currentRecords.map((record, index) => (
              <tr
                key={`${record.type}-${record.id}`}
                className="align-middle"
                style={{ transition: "all 0.2s" }}
              >
                <td className="fw-bold text-center">
                  {(currentPage - 1) * recordsPerPage + index + 1}
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {record.description || "N/A"}
                  </span>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {record.category}
                </td>
                <td>
                  <Badge
                    bg={record.type === "income" ? "success" : "danger"}
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {formatRupiah(record.amount)}
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {new Date(record.transaction_date).toLocaleString("id-ID")}
                </td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>View Details</Tooltip>}
                    >
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                        }}
                        onClick={() => openViewModal(record)}
                      >
                        <i className="fas fa-eye" />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit Record</Tooltip>}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                          ...disableIfSupervisor.style,
                        }}
                        {...disableIfSupervisor}
                        onClick={() => openEditModal(record)}
                      >
                        <i className="fas fa-edit" />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Delete Record</Tooltip>}
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                          ...disableIfSupervisor.style,
                        }}
                        {...disableIfSupervisor}
                        onClick={() => handleDeleteRecord(record)}
                      >
                        <i className="fas fa-trash-alt" />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndPaginatedRecords.totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No finance records found matching your criteria.
          </p>
        </div>
      )}

      {filteredAndPaginatedRecords.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
            {Math.min(
              currentPage * recordsPerPage,
              filteredAndPaginatedRecords.totalItems
            )}{" "}
            of {filteredAndPaginatedRecords.totalItems} entries
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(1)}>
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {[...Array(filteredAndPaginatedRecords.totalPages).keys()].map(
                (page) => {
                  const pageNumber = page + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === filteredAndPaginatedRecords.totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          currentPage === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <li key={pageNumber} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                }
              )}
              <li
                className={`page-item ${
                  currentPage === filteredAndPaginatedRecords.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === filteredAndPaginatedRecords.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage(filteredAndPaginatedRecords.totalPages)
                  }
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

const FinanceRecordsModals = ({
  showAddIncomeModal,
  setShowAddIncomeModal,
  showEditIncomeModal,
  setShowEditIncomeModal,
  showViewIncomeModal,
  setShowViewIncomeModal,
  showAddExpenseModal,
  setShowAddExpenseModal,
  showEditExpenseModal,
  setShowEditExpenseModal,
  showViewExpenseModal,
  setShowViewExpenseModal,
  showIncomeTypeModal,
  setShowIncomeTypeModal,
  showExpenseTypeModal,
  setShowExpenseTypeModal,
  newIncome,
  setNewIncome,
  newExpense,
  setNewExpense,
  selectedRecord,
  setSelectedRecord,
  incomeTypes,
  expenseTypes,
  currentUser,
  handleAddIncome,
  handleEditIncome,
  handleAddExpense,
  handleEditExpense,
  handleIncomeTypeSave,
  handleIncomeTypeDelete,
  handleExpenseTypeSave,
  handleExpenseTypeDelete,
  formatRupiah,
}) => {
  const [formattedIncomeAmount, setFormattedIncomeAmount] = useState("");
  const [formattedExpenseAmount, setFormattedExpenseAmount] = useState("");
  const [newIncomeType, setNewIncomeType] = useState({
    name: "",
    description: "",
    created_by: currentUser?.user_id,
  });
  const [newExpenseType, setNewExpenseType] = useState({
    name: "",
    description: "",
    created_by: currentUser?.user_id,
  });
  const [selectedIncomeType, setSelectedIncomeType] = useState(null);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);

  useEffect(() => {
    setFormattedIncomeAmount(
      newIncome.amount ? formatRupiah(newIncome.amount) : ""
    );
    setFormattedExpenseAmount(
      newExpense.amount ? formatRupiah(newExpense.amount) : ""
    );
  }, [newIncome.amount, newExpense.amount, formatRupiah]);

  const handleIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncome((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncomeTypeInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncomeType((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseTypeInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpenseType((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseAddIncomeModal = () => {
    setNewIncome({
      amount: "",
      income_type: "",
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: "",
      created_by: currentUser?.user_id,
    });
    setShowAddIncomeModal(false);
  };

  const handleCloseAddExpenseModal = () => {
    setNewExpense({
      amount: "",
      expense_type: "",
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: "",
      created_by: currentUser?.user_id,
    });
    setShowAddExpenseModal(false);
  };

  const handleCloseEditIncomeModal = () => {
    setSelectedRecord(null);
    setShowEditIncomeModal(false);
  };

  const handleCloseEditExpenseModal = () => {
    setSelectedRecord(null);
    setShowEditExpenseModal(false);
  };

  const handleCloseIncomeTypeModal = () => {
    setNewIncomeType({
      name: "",
      description: "",
      created_by: currentUser?.user_id,
    });
    setSelectedIncomeType(null);
    setShowIncomeTypeModal(false);
  };

  const handleCloseExpenseTypeModal = () => {
    setNewExpenseType({
      name: "",
      description: "",
      created_by: currentUser?.user_id,
    });
    setSelectedExpenseType(null);
    setShowExpenseTypeModal(false);
  };

  const handleAddIncomeType = async (e) => {
    e.preventDefault();
    const success = await handleIncomeTypeSave(
      {
        ...newIncomeType,
        created_by: parseInt(currentUser.user_id),
        updated_by: parseInt(currentUser.user_id),
      },
      false
    );
    if (success) {
      setNewIncomeType({
        name: "",
        description: "",
        created_by: currentUser?.user_id,
      });
    }
  };

  const handleEditIncomeType = async (e) => {
    e.preventDefault();
    const success = await handleIncomeTypeSave(
      {
        ...selectedIncomeType,
        created_by: parseInt(
          selectedIncomeType.created_by?.id || currentUser.user_id
        ),
        updated_by: parseInt(currentUser.user_id),
      },
      true,
      selectedIncomeType.id
    );
    if (success) {
      setSelectedIncomeType(null);
    }
  };

  const handleAddExpenseType = async (e) => {
    e.preventDefault();
    const success = await handleExpenseTypeSave(
      {
        ...newExpenseType,
        created_by: parseInt(currentUser.user_id),
        updated_by: parseInt(currentUser.user_id),
      },
      false
    );
    if (success) {
      setNewExpenseType({
        name: "",
        description: "",
        created_by: currentUser?.user_id,
      });
    }
  };

  const handleEditExpenseType = async (e) => {
    e.preventDefault();
    const success = await handleExpenseTypeSave(
      {
        ...selectedExpenseType,
        created_by: parseInt(
          selectedExpenseType.created_by?.id || currentUser.user_id
        ),
        updated_by: parseInt(currentUser.user_id),
      },
      true,
      selectedExpenseType.id
    );
    if (success) {
      setSelectedExpenseType(null);
    }
  };

  return (
    <>
      <Modal
        show={showAddIncomeModal}
        onHide={handleCloseAddIncomeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Income
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddIncome}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={newIncome.amount}
                      onChange={handleIncomeInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </InputGroup>
                  {formattedIncomeAmount && (
                    <Form.Text className="text-muted">
                      {formattedIncomeAmount}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Income Type</Form.Label>
                  <Form.Select
                    name="income_type"
                    value={newIncome.income_type}
                    onChange={handleIncomeInputChange}
                    required
                  >
                    <option value="">Select income type</option>
                    {incomeTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="transaction_date"
                    value={newIncome.transaction_date}
                    onChange={handleIncomeInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newIncome.description}
                    onChange={handleIncomeInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddIncomeModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEditIncomeModal}
        onHide={handleCloseEditIncomeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Income
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditIncome}>
          <Modal.Body>
            {selectedRecord && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>Rp</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={selectedRecord.amount}
                        onChange={handleEditInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      {formatRupiah(selectedRecord.amount)}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Income Type</Form.Label>
                    <Form.Select
                      name="income_type"
                      value={selectedRecord.income_type}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select income type</option>
                      {incomeTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="transaction_date"
                      value={format(
                        new Date(selectedRecord.transaction_date),
                        "yyyy-MM-dd'T'HH:mm"
                      )}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={selectedRecord.description}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditIncomeModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showViewIncomeModal}
        onHide={() => setShowViewIncomeModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Income Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>{selectedRecord.description || "N/A"}</h5>
                <p>
                  <strong>Amount:</strong> {formatRupiah(selectedRecord.amount)}
                </p>
                <p>
                  <strong>Category:</strong> {selectedRecord.category}
                </p>
                <p>
                  <strong>Transaction Date:</strong>{" "}
                  {new Date(selectedRecord.transaction_date).toLocaleString(
                    "id-ID"
                  )}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedRecord.created_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Updated By:</strong>{" "}
                  {selectedRecord.updated_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedRecord.created_at).toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(selectedRecord.updated_at).toLocaleString("id-ID")}
                </p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewIncomeModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddExpenseModal}
        onHide={handleCloseAddExpenseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Expense
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddExpense}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleExpenseInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </InputGroup>
                  {formattedExpenseAmount && (
                    <Form.Text className="text-muted">
                      {formattedExpenseAmount}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Expense Type</Form.Label>
                  <Form.Select
                    name="expense_type"
                    value={newExpense.expense_type}
                    onChange={handleExpenseInputChange}
                    required
                  >
                    <option value="">Select expense type</option>
                    {expenseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="transaction_date"
                    value={newExpense.transaction_date}
                    onChange={handleExpenseInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newExpense.description}
                    onChange={handleExpenseInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddExpenseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEditExpenseModal}
        onHide={handleCloseEditExpenseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Expense
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditExpense}>
          <Modal.Body>
            {selectedRecord && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>Rp</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={selectedRecord.amount}
                        onChange={handleEditInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      {formatRupiah(selectedRecord.amount)}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Expense Type</Form.Label>
                    <Form.Select
                      name="expense_type"
                      value={selectedRecord.expense_type}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select expense type</option>
                      {expenseTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="transaction_date"
                      value={format(
                        new Date(selectedRecord.transaction_date),
                        "yyyy-MM-dd'T'HH:mm"
                      )}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={selectedRecord.description}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditExpenseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showViewExpenseModal}
        onHide={() => setShowViewExpenseModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Expense Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>{selectedRecord.description || "N/A"}</h5>
                <p>
                  <strong>Amount:</strong> {formatRupiah(selectedRecord.amount)}
                </p>
                <p>
                  <strong>Category:</strong> {selectedRecord.category}
                </p>
                <p>
                  <strong>Transaction Date:</strong>{" "}
                  {new Date(selectedRecord.transaction_date).toLocaleString(
                    "id-ID"
                  )}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedRecord.created_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Updated By:</strong>{" "}
                  {selectedRecord.updated_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedRecord.created_at).toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(selectedRecord.updated_at).toLocaleString("id-ID")}
                </p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewExpenseModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showIncomeTypeModal}
        onHide={handleCloseIncomeTypeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-list me-2" /> Manage Income Types
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={
              selectedIncomeType ? handleEditIncomeType : handleAddIncomeType
            }
          >
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={
                      selectedIncomeType
                        ? selectedIncomeType.name
                        : newIncomeType.name
                    }
                    onChange={(e) =>
                      selectedIncomeType
                        ? setSelectedIncomeType((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        : handleIncomeTypeInputChange(e)
                    }
                    required
                    placeholder="Enter income type name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={
                      selectedIncomeType
                        ? selectedIncomeType.description
                        : newIncomeType.description
                    }
                    onChange={(e) =>
                      selectedIncomeType
                        ? setSelectedIncomeType((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        : handleIncomeTypeInputChange(e)
                    }
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  style={{ letterSpacing: "0.5px" }}
                >
                  {selectedIncomeType ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="table-responsive mt-3">
            <table
              className="table table-hover border rounded shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <thead className="bg-gradient-light">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>{type.description || "N/A"}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => setSelectedIncomeType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Are you sure?",
                            text: `You are about to delete income type "${type.name}".`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (result.isConfirmed) {
                            await handleIncomeTypeDelete(type.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseIncomeTypeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showExpenseTypeModal}
        onHide={handleCloseExpenseTypeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-list me-2" /> Manage Expense Types
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={
              selectedExpenseType ? handleEditExpenseType : handleAddExpenseType
            }
          >
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={
                      selectedExpenseType
                        ? selectedExpenseType.name
                        : newExpenseType.name
                    }
                    onChange={(e) =>
                      selectedExpenseType
                        ? setSelectedExpenseType((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        : handleExpenseTypeInputChange(e)
                    }
                    required
                    placeholder="Enter expense type name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={
                      selectedExpenseType
                        ? selectedExpenseType.description
                        : newExpenseType.description
                    }
                    onChange={(e) =>
                      selectedExpenseType
                        ? setSelectedExpenseType((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        : handleExpenseTypeInputChange(e)
                    }
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  style={{ letterSpacing: "0.5px" }}
                >
                  {selectedExpenseType ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="table-responsive mt-3">
            <table
              className="table table-hover border rounded shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <thead className="bg-gradient-light">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>{type.description || "N/A"}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => setSelectedExpenseType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Are you sure?",
                            text: `You are about to delete expense type "${type.name}".`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (result.isConfirmed) {
                            await handleExpenseTypeDelete(type.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseExpenseTypeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FinanceRecords;
