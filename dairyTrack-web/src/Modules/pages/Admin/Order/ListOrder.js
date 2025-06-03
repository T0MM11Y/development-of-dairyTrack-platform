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
import { getProductStocks } from "../../../controllers/productStockController";
import usePermissions from "../Permission/usePermission";

const ListOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    location: "",
    status: "Requested",
    payment_method: "",
    order_items: [],
    notes: "",
  });
  const ordersPerPage = 8;

  // Use the permissions hook
  const {
    currentUser,
    isSupervisor,
    disableIfSupervisor,
    restrictSupervisorAction,
    error: userError,
  } = usePermissions();

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getOrders();
        if (response.success) {
          setOrders(response.orders);
        } else {
          setOrders([]);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to fetch orders.",
          });
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while fetching orders.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch product stocks
  useEffect(() => {
    const loadAvailableStock = async () => {
      try {
        console.log("Fetching product stocks...");
        const response = await getProductStocks();
        console.log("Product stocks response:", response);

        if (!response || typeof response !== "object") {
          throw new Error("Invalid response format from getProductStocks");
        }

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch product stocks");
        }

        if (!Array.isArray(response.productStocks)) {
          throw new Error("Expected productStocks to be an array");
        }

        // Aggregate available products
        const groupedProducts = response.productStocks.reduce(
          (acc, product) => {
            console.log("Processing product:", product);
            if (
              product.status === "available" &&
              product.product_type_detail &&
              typeof product.product_type === "number"
            ) {
              const type = product.product_type;
              if (!acc[type]) {
                acc[type] = {
                  product_type: type,
                  product_name:
                    product.product_type_detail.product_name || "Unknown",
                  total_quantity: 0,
                  image: product.product_type_detail.image || "",
                };
              }
              acc[type].total_quantity += Number(product.quantity) || 0;
            }
            return acc;
          },
          {}
        );

        const products = Object.values(groupedProducts);
        console.log("Aggregated available products:", products);
        setAvailableProducts(products);
      } catch (error) {
        console.error("Error fetching product stocks:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.message || "An error occurred while fetching product stocks.",
        });
        setAvailableProducts([]);
      }
    };
    loadAvailableStock();
  }, []);

  // Calculate statistics
  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const requestedOrders = orders.filter(
      (order) => order.status === "Requested"
    ).length;
    const processedOrders = orders.filter(
      (order) => order.status === "Processed"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "Completed"
    ).length;

    return {
      totalOrders,
      requestedOrders,
      processedOrders,
      completedOrders,
    };
  }, [orders]);

  // Handle add order
  const handleAddOrder = async (e, orderData) => {
    e.preventDefault();
    if (restrictSupervisorAction("add", "add orders")) return;
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

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
          order_items: [],
          notes: "",
        });
        // Refresh product stocks
        const refreshedStock = await getProductStocks();
        if (
          refreshedStock.success &&
          Array.isArray(refreshedStock.productStocks)
        ) {
          const groupedProducts = refreshedStock.productStocks.reduce(
            (acc, product) => {
              if (
                product.status === "available" &&
                product.product_type_detail &&
                typeof product.product_type === "number"
              ) {
                const type = product.product_type;
                if (!acc[type]) {
                  acc[type] = {
                    product_type: type,
                    product_name:
                      product.product_type_detail.product_name || "Unknown",
                    total_quantity: 0,
                    image: product.product_type_detail.image || "",
                  };
                }
                acc[type].total_quantity += Number(product.quantity) || 0;
              }
              return acc;
            },
            {}
          );
          const products = Object.values(groupedProducts);
          setAvailableProducts(products);
        } else {
          setAvailableProducts([]);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add order.",
        });
      }
    } catch (error) {
      console.error("Error adding order:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while adding the order.",
      });
    }
  };

  // Handle edit order
  const handleEditOrder = async (e, orderData) => {
    e.preventDefault();
    if (restrictSupervisorAction("edit", "edit orders")) return;
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    try {
      const response = await updateOrder(selectedOrder.id, orderData);
      console.log("Update order response:", response);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Order updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getOrders();
        if (refreshedResponse.success) {
          setOrders(refreshedResponse.orders);
        }
        setShowEditModal(false);
        setSelectedOrder(null);
        // Refresh product stocks
        const refreshedStock = await getProductStocks();
        if (
          refreshedStock.success &&
          Array.isArray(refreshedStock.productStocks)
        ) {
          const groupedProducts = refreshedStock.productStocks.reduce(
            (acc, product) => {
              if (
                product.status === "available" &&
                product.product_type_detail &&
                typeof product.product_type === "number"
              ) {
                const type = product.product_type;
                if (!acc[type]) {
                  acc[type] = {
                    product_type: type,
                    product_name:
                      product.product_type_detail.product_name || "Unknown",
                    total_quantity: 0,
                    image: product.product_type_detail.image || "",
                  };
                }
                acc[type].total_quantity += Number(product.quantity) || 0;
              }
              return acc;
            },
            {}
          );
          const products = Object.values(groupedProducts);
          setAvailableProducts(products);
        } else {
          setAvailableProducts([]);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update order.",
        });
      }
    } catch (error) {
      console.error("Error editing order:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while editing the order.",
      });
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    if (restrictSupervisorAction("delete", "delete orders")) return;
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
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to delete order.",
          });
        }
      } catch (error) {
        console.error("Error deleting order:", error);
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

  if (userError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{userError}</div>
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
                ...disableIfSupervisor.style,
              }}
              {...disableIfSupervisor}
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
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            setCurrentPage={setCurrentPage}
          />
          <OrderTable
            orders={orders}
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            startDate={startDate}
            endDate={endDate}
            currentPage={currentPage}
            ordersPerPage={ordersPerPage}
            setCurrentPage={setCurrentPage}
            openViewModal={(order) => {
              setSelectedOrder(order);
              setShowViewModal(true);
            }}
            openEditModal={(order) => {
              // Consolidate order_items by product_type
              const consolidatedItems = order.order_items.reduce(
                (acc, item) => {
                  const existingItem = acc.find(
                    (i) => i.product_type === item.product_type_detail?.id
                  );
                  if (existingItem) {
                    existingItem.quantity += item.quantity;
                  } else {
                    acc.push({
                      product_type: item.product_type_detail?.id || "",
                      quantity: item.quantity || 0,
                    });
                  }
                  return acc;
                },
                []
              );
              setSelectedOrder({
                ...order,
                order_items: consolidatedItems,
              });
              setShowEditModal(true);
            }}
            handleDeleteOrder={handleDeleteOrder}
            isSupervisor={isSupervisor}
            disableIfSupervisor={disableIfSupervisor}
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
            availableProducts={availableProducts}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListOrder;
