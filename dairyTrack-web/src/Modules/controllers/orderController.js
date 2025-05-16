import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get all orders
export const getOrders = async () => {
  try {
    const response = await fetch(`${API_URL2}/sales/orders/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, orders: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch orders.";
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
      text: "An error occurred while fetching orders.",
    });
    console.error("Error fetching orders:", error);
    return {
      success: false,
      message: "An error occurred while fetching orders.",
    };
  }
};

// Get a single order by ID
export const getOrderById = async (id) => {
  try {
    const response = await fetch(`${API_URL2}/sales/orders/${id}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, order: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch order.";
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
      text: "An error occurred while fetching the order.",
    });
    console.error("Error fetching order:", error);
    return {
      success: false,
      message: "An error occurred while fetching the order.",
    };
  }
};

// Create a new order
export const createOrder = async (data) => {
  try {
    const response = await fetch(`${API_URL2}/sales/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Order created successfully.",
      });
      return { success: true, data: result.data || result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create order.";
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
      text: "An error occurred while creating the order.",
    });
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "An error occurred while creating the order.",
    };
  }
};

// Update an existing order
export const updateOrder = async (id, data) => {
  try {
    const response = await fetch(`${API_URL2}/sales/orders/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Order updated successfully.",
      });
      return { success: true, data: result.data || result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update order.";
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
      text: "An error occurred while updating the order.",
    });
    console.error("Error updating order:", error);
    return {
      success: false,
      message: "An error occurred while updating the order.",
    };
  }
};

// Delete an order
export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`${API_URL2}/sales/orders/${id}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      // Handle 204 No Content or JSON response
      let result = {};
      if (response.status !== 204) {
        result = await response.json();
      } else {
        result = { message: "Order deleted successfully." };
      }
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Order deleted successfully.",
      });
      return { success: true, data: result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete order.";
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
      text: "An error occurred while deleting the order.",
    });
    console.error("Error deleting order:", error);
    return {
      success: false,
      message: "An error occurred while deleting the order.",
    };
  }
};
