import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get finance list
const getFinanceList = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/finance/${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, financeData: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch finance data.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching finance data.",
    });
    console.error("Error fetching finance data:", error);
    return {
      success: false,
      message: "An error occurred while fetching finance data.",
    };
  }
};

// Export finance data as PDF
const getFinanceExportPdf = async (startDate, endDate) => {
  try {
    const queryString = `start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(
      `${API_URL2}/finance/export/pdf/?${queryString}`,
      {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finance_report_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Finance data exported as PDF successfully.",
      });
      return { success: true, data: null };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to export finance data as PDF.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting finance data as PDF.",
    });
    console.error("Error exporting finance data as PDF:", error);
    return {
      success: false,
      message: "An error occurred while exporting finance data as PDF.",
    };
  }
};

// Export finance data as Excel
const getFinanceExportExcel = async (startDate, endDate) => {
  try {
    const queryString = `start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(
      `${API_URL2}/finance/export/excel/?${queryString}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finance_report_${startDate}_to_${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Finance data exported as Excel successfully.",
      });
      return { success: true, data: null };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail ||
        error.error ||
        "Failed to export finance data as Excel.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting finance data as Excel.",
    });
    console.error("Error exporting finance data as Excel:", error);
    return {
      success: false,
      message: "An error occurred while exporting finance data as Excel.",
    };
  }
};

// Get incomes
const getIncomes = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/incomes/${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, incomes: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch incomes.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching incomes.",
    });
    console.error("Error fetching incomes:", error);
    return {
      success: false,
      message: "An error occurred while fetching incomes.",
    };
  }
};

// Create income
const createIncome = async (incomeData) => {
  try {
    const response = await fetch(`${API_URL2}/finance/incomes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(incomeData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Income created successfully.",
      });
      return { success: true, income: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create income.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while creating income.",
    });
    console.error("Error creating income:", error);
    return {
      success: false,
      message: "An error occurred while creating income.",
    };
  }
};

// Update income
const updateIncome = async (incomeId, incomeData) => {
  try {
    const response = await fetch(`${API_URL2}/finance/incomes/${incomeId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(incomeData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Income updated successfully.",
      });
      return { success: true, income: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update income.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating income.",
    });
    console.error("Error updating income:", error);
    return {
      success: false,
      message: "An error occurred while updating income.",
    };
  }
};

// Delete income
const deleteIncome = async (incomeId) => {
  try {
    const response = await fetch(`${API_URL2}/finance/incomes/${incomeId}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok || response.status === 204) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Income deleted successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete income.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting income.",
    });
    console.error("Error deleting income:", error);
    return {
      success: false,
      message: "An error occurred while deleting income.",
    };
  }
};

// Get income types
const getIncomeTypes = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/income-types/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, incomeTypes: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch income types.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching income types.",
    });
    console.error("Error fetching income types:", error);
    return {
      success: false,
      message: "An error occurred while fetching income types.",
    };
  }
};

// Create income type
const createIncomeType = async (incomeTypeData) => {
  try {
    const response = await fetch(`${API_URL2}/finance/income-types/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(incomeTypeData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Income type created successfully.",
      });
      return { success: true, incomeType: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create income type.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while creating income type.",
    });
    console.error("Error creating income type:", error);
    return {
      success: false,
      message: "An error occurred while creating income type.",
    };
  }
};

// Update income type
const updateIncomeType = async (incomeTypeId, incomeTypeData) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/income-types/${incomeTypeId}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(incomeTypeData),
      }
    );

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Income type updated successfully.",
      });
      return { success: true, incomeType: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update income type.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating income type.",
    });
    console.error("Error updating income type:", error);
    return {
      success: false,
      message: "An error occurred while updating income type.",
    };
  }
};

// Delete income type
const deleteIncomeType = async (incomeTypeId) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/income-types/${incomeTypeId}/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok || response.status === 204) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Income type deleted successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete income type.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting income type.",
    });
    console.error("Error deleting income type:", error);
    return {
      success: false,
      message: "An error occurred while deleting income type.",
    };
  }
};

// Get expenses
const getExpenses = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/expenses/${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, expenses: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch expenses.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching expenses.",
    });
    console.error("Error fetching expenses:", error);
    return {
      success: false,
      message: "An error occurred while fetching expenses.",
    };
  }
};

// Create expense
const createExpense = async (expenseData) => {
  try {
    const response = await fetch(`${API_URL2}/finance/expenses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expense created successfully.",
      });
      return { success: true, expense: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create expense.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while creating expense.",
    });
    console.error("Error creating expense:", error);
    return {
      success: false,
      message: "An error occurred while creating expense.",
    };
  }
};

// Update expense
const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await fetch(`${API_URL2}/finance/expenses/${expenseId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expense updated successfully.",
      });
      return { success: true, expense: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update expense.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating expense.",
    });
    console.error("Error updating expense:", error);
    return {
      success: false,
      message: "An error occurred while updating expense.",
    };
  }
};

// Delete expense
const deleteExpense = async (expenseId) => {
  try {
    const response = await fetch(`${API_URL2}/finance/expenses/${expenseId}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok || response.status === 204) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expense deleted successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete expense.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting expense.",
    });
    console.error("Error deleting expense:", error);
    return {
      success: false,
      message: "An error occurred while deleting expense.",
    };
  }
};

// Get expense types
const getExpenseTypes = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/expense-types/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, expenseTypes: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch expense types.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching expense types.",
    });
    console.error("Error fetching expense types:", error);
    return {
      success: false,
      message: "An error occurred while fetching expense types.",
    };
  }
};

// Create expense type
const createExpenseType = async (expenseTypeData) => {
  try {
    const response = await fetch(`${API_URL2}/finance/expense-types/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(expenseTypeData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expense type created successfully.",
      });
      return { success: true, expenseType: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create expense type.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while creating expense type.",
    });
    console.error("Error creating expense type:", error);
    return {
      success: false,
      message: "An error occurred while creating expense type.",
    };
  }
};

// Update expense type
const updateExpenseType = async (expenseTypeId, expenseTypeData) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/expense-types/${expenseTypeId}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(expenseTypeData),
      }
    );

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expense type updated successfully.",
      });
      return { success: true, expenseType: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update expense type.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating expense type.",
    });
    console.error("Error updating expense type:", error);
    return {
      success: false,
      message: "An error occurred while updating expense type.",
    };
  }
};

// Delete expense type
const deleteExpenseType = async (expenseTypeId) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/expense-types/${expenseTypeId}/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok || response.status === 204) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Expense type deleted successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete expense type.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting expense type.",
    });
    console.error("Error deleting expense type:", error);
    return {
      success: false,
      message: "An error occurred while deleting expense type.",
    };
  }
};

export default {
  getFinanceList,
  getFinanceExportPdf,
  getFinanceExportExcel,
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeTypes,
  createIncomeType,
  updateIncomeType,
  deleteIncomeType,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseTypes,
  createExpenseType,
  updateExpenseType,
  deleteExpenseType,
};
