import React, { useState, useEffect, useMemo } from "react";
import { Card, Spinner, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import OrderStats from "./OrderStats";
import OrderFilters from "./OrderFilters";
import OrderTable from "./OrderTable";
import OrderModals from "./OrderModals";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../../../controllers/orderController";

const ListOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    location: "",
    status: "Requested",
    payment_method: "",
    order_items: [{ product_type_id: "", quantity: "" }],
    notes: "",
  });
  const ordersPerPage = 8;

  // Fetch user from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.user_id) {
        const userId = parseInt(userData.user_id);
        if (isNaN(userId)) {
          throw new Error("Invalid user ID in localStorage.");
        }
        setCurrentUser({ ...userData, user_id: userId });
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

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getOrders();
        if (response.success) {
          setOrders(response.orders);
          setError(null);
        } else {
          setError(response.message);
          setOrders([]);
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching orders.");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Calculate statistics
  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const requestedOrders = orders.filter(
      (order) => order.status === "Requested"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "Completed"
    ).length;

    return {
      totalOrders,
      requestedOrders,
      completedOrders,
    };
  }, [orders]);

  // Handle add order
  const handleAddOrder = async (e) => {
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

    const orderData = {
      customer_name: newOrder.customer_name,
      email: newOrder.email,
      phone_number: newOrder.phone_number,
      location: newOrder.location,
      status: newOrder.status,
      payment_method: newOrder.payment_method || null,
      order_items: newOrder.order_items.map((item) => ({
        product_type_id: parseInt(item.product_type_id) || 0,
        quantity: parseInt(item.quantity) || 0,
      })),
      notes: newOrder.notes || null,
    };

    try {
      const response = await createOrder(orderData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Order added successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getOrders();
        if (refreshedResponse.success) {
          setOrders(refreshedResponse.orders);
        }
        setShowAddModal(false);
        setNewOrder({
          customer_name: "",
          email: "",
          phone_number: "",
          location: "",
          status: "Requested",
          payment_method: "",
          order_items: [{ product_type_id: "", quantity: "" }],
          notes: "",
        });
      } else {
        setError(response.message || "Failed to add order.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add order.",
        });
      }
    } catch (error) {
      console.error("Error adding order:", error);
      setError("An unexpected error occurred while adding the order.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while adding the order.",
      });
    }
  };

  // Handle edit order
  const handleEditOrder = async (e) => {
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

    const orderData = {
      customer_name: selectedOrder.customer_name,
      email: selectedOrder.email,
      phone_number: selectedOrder.phone_number,
      location: selectedOrder.location,
      status: selectedOrder.status,
      payment_method: selectedOrder.payment_method || null,
      order_items: selectedOrder.order_items.map((item) => ({
        product_type_id: parseInt(item.product_type_id) || item.product_type_detail?.id || 0,
        quantity: parseInt(item.quantity) || 0,
      })),
      notes: selectedOrder.notes || null,
    };

    try {
      const response = await updateOrder(selectedOrder.id, orderData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Order updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getOrders();
        if (refreshedResponse.success) {
          setOrders(refreshedResponse.orders);
        }
        setShowEditModal(false);
        setSelectedOrder(null);
      } else {
        setError(response.message || "Failed to update order.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update order.",
        });
      }
    } catch (error) {
      console.error("Error editing order:", error);
      setError("An unexpected error occurred while editing the order.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while editing the order.",
      });
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete order "${order?.order_no}" for "${order?.customer_name}". This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteOrder(orderId);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response.data.message || "Order deleted successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
          const refreshedResponse = await getOrders();
          if (refreshedResponse.success) {
            setOrders(refreshedResponse.orders);
          }
        } else {
          setError(response.message || "Failed to delete order.");
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to delete order.",
          });
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        setError("An unexpected error occurred while deleting the order.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting order.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{error}</div>
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
            <i className="fas fa-shopping-cart me-2" /> Order Management
          </h4>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-end mb-3">
            <Button
              variant="primary"
              size="sm"
              className="shadow-sm"
              onClick={() => setShowAddModal(true)}
              style={{
                letterSpacing: "0.5px",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              <i className="fas fa-plus me-2" /> Add Order
            </Button>
          </div>
          <OrderStats stats={orderStats} />
          <OrderFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            orders={orders}
            setCurrentPage={setCurrentPage}
          />
          <OrderTable
            orders={orders}
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            currentPage={currentPage}
            ordersPerPage={ordersPerPage}
            setCurrentPage={setCurrentPage}
            openViewModal={(order) => {
              setSelectedOrder(order);
              setShowViewModal(true);
            }}
            openEditModal={(order) => {
              setSelectedOrder({
                ...order,
                order_items: order.order_items.map((item) => ({
                  ...item,
                  product_type_id: item.product_type_detail?.id || "",
                  quantity: item.quantity || "",
                })),
              });
              setShowEditModal(true);
            }}
            handleDeleteOrder={handleDeleteOrder}
          />
          <OrderModals
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            showViewModal={showViewModal}
            setShowViewModal={setShowViewModal}
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            handleAddOrder={handleAddOrder}
            handleEditOrder={handleEditOrder}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListOrder;