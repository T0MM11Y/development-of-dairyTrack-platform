import React, { useState, useEffect, useMemo } from "react";
import { Card, Spinner, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import ProductStockStats from "./ProductStockStats";
import ProductStockFilters from "./ProductStockFilters";
import ProductStockTable from "./ProductStockTable";
import ProductStockModals from "./ProductStockModals";
import {
  getProductStocks,
  createProductStock,
  updateProductStock,
  deleteProductStock,
} from "../../../controllers/productStockController";
import usePermissions from "../Permission/usePermission";

const ProductStock = () => {
  const [productStocks, setProductStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProductStock, setSelectedProductStock] = useState(null);
  const [newProductStock, setNewProductStock] = useState({
    product_type: "",
    initial_quantity: "",
    production_at: "",
    expiry_at: "",
    status: "available",
    total_milk_used: "",
    created_by: "",
  });
  const stocksPerPage = 8;

  // Use the permissions hook
  const {
    currentUser,
    isSupervisor,
    disableIfSupervisor,
    restrictSupervisorAction,
    error: userError,
  } = usePermissions();

  // Set created_by for new product stock when currentUser is available
  useEffect(() => {
    if (currentUser?.user_id) {
      setNewProductStock((prev) => ({
        ...prev,
        created_by: currentUser.user_id,
      }));
    }
  }, [currentUser]);

  // Fetch product stocks
  useEffect(() => {
    const fetchProductStocks = async () => {
      setLoading(true);
      try {
        const response = await getProductStocks();
        if (response.success) {
          const normalizedProductStocks = response.productStocks.map((ps) => ({
            ...ps,
            created_by: {
              ...ps.created_by,
              id:
                ps.created_by && ps.created_by.id
                  ? parseInt(ps.created_by.id)
                  : null,
            },
            updated_by: ps.updated_by
              ? {
                  ...ps.updated_by,
                  id: ps.updated_by.id ? parseInt(ps.updated_by.id) : null,
                }
              : null,
            total_milk_used: parseFloat(ps.total_milk_used) || 0,
          }));
          setProductStocks(normalizedProductStocks);
        } else {
          setProductStocks([]);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to fetch product stocks.",
          });
        }
      } catch (err) {
        console.error("Error fetching product stocks:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while fetching product stocks.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProductStocks();
  }, []);

  // Calculate statistics
  const productStockStats = useMemo(() => {
    const totalStocks = productStocks.length;
    const availableStocks = productStocks.filter(
      (ps) => ps.status === "available"
    ).length;
    const expiredStocks = productStocks.filter(
      (ps) => ps.status === "expired"
    ).length;
    const contaminationStocks = productStocks.filter(
      (ps) => ps.status === "contamination"
    ).length;

    return {
      totalStocks,
      availableStocks,
      expiredStocks,
      contaminationStocks,
    };
  }, [productStocks]);

  // Handle add product stock
  const handleAddProductStock = async (e) => {
    e.preventDefault();
    if (restrictSupervisorAction("add", "add product stocks")) return;
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    const createdBy = parseInt(currentUser.user_id);
    if (isNaN(createdBy)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid user ID for created_by.",
      });
      return;
    }

    const formData = new FormData();
    formData.append(
      "product_type",
      parseInt(newProductStock.product_type) || ""
    );
    formData.append(
      "initial_quantity",
      parseInt(newProductStock.initial_quantity) || 0
    );
    formData.append("production_at", newProductStock.production_at);
    formData.append("expiry_at", newProductStock.expiry_at);
    formData.append("status", newProductStock.status);
    formData.append(
      "total_milk_used",
      parseFloat(newProductStock.total_milk_used) || 0
    );
    formData.append("created_by", createdBy);
    formData.append("updated_by", "");

    try {
      const response = await createProductStock(formData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product stock added successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getProductStocks();
        if (refreshedResponse.success) {
          setProductStocks(
            refreshedResponse.productStocks.map((ps) => ({
              ...ps,
              created_by: {
                ...ps.created_by,
                id:
                  ps.created_by && ps.created_by.id
                    ? parseInt(ps.created_by.id)
                    : null,
              },
              updated_by: ps.updated_by
                ? {
                    ...ps.updated_by,
                    id: ps.updated_by.id ? parseInt(ps.updated_by.id) : null,
                  }
                : null,
              total_milk_used: parseFloat(ps.total_milk_used) || 0,
            }))
          );
        }
        setShowAddModal(false);
        setNewProductStock({
          product_type: "",
          initial_quantity: "",
          production_at: "",
          expiry_at: "",
          status: "available",
          total_milk_used: "",
          created_by: currentUser.user_id,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add product stock.",
        });
      }
    } catch (error) {
      console.error("Error adding product stock:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while adding the product stock.",
      });
    }
  };

  // Handle edit product stock
  const handleEditProductStock = async (e) => {
    e.preventDefault();
    if (restrictSupervisorAction("edit", "edit product stocks")) return;
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID.",
      });
      return;
    }

    const createdBy = selectedProductStock.created_by?.id;
    const updatedBy = parseInt(currentUser.user_id);

    if (!createdBy || isNaN(createdBy) || createdBy <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid created_by value for product stock.",
      });
      return;
    }
    if (isNaN(updatedBy) || updatedBy <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid user ID for updated_by.",
      });
      return;
    }

    const formData = new FormData();
    formData.append(
      "product_type",
      parseInt(selectedProductStock.product_type) || ""
    );
    formData.append(
      "initial_quantity",
      parseInt(selectedProductStock.initial_quantity) || 0
    );
    formData.append("production_at", selectedProductStock.production_at);
    formData.append("expiry_at", selectedProductStock.expiry_at);
    formData.append("status", selectedProductStock.status);
    formData.append(
      "total_milk_used",
      parseFloat(selectedProductStock.total_milk_used) || 0
    );
    formData.append("created_by", createdBy);
    formData.append("updated_by", updatedBy);

    try {
      const response = await updateProductStock(
        selectedProductStock.id,
        formData
      );
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product stock updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getProductStocks();
        if (refreshedResponse.success) {
          setProductStocks(
            refreshedResponse.productStocks.map((ps) => ({
              ...ps,
              created_by: {
                ...ps.created_by,
                id:
                  ps.created_by && ps.created_by.id
                    ? parseInt(ps.created_by.id)
                    : null,
              },
              updated_by: ps.updated_by
                ? {
                    ...ps.updated_by,
                    id: ps.updated_by.id ? parseInt(ps.updated_by.id) : null,
                  }
                : null,
              total_milk_used: parseFloat(ps.total_milk_used) || 0,
            }))
          );
        }
        setShowEditModal(false);
        setSelectedProductStock(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update product stock.",
        });
      }
    } catch (error) {
      console.error("Error editing product stock:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while editing the product stock.",
      });
    }
  };

  // Handle delete product stock
  const handleDeleteProductStock = async (productStockId) => {
    if (restrictSupervisorAction("delete", "delete product stocks")) return;
    const product = productStocks.find((ps) => ps.id === productStockId);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete stock for "${product?.product_type_detail?.product_name}". This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteProductStock(productStockId);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text:
              response.data.message || "Product stock deleted successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
          const refreshedResponse = await getProductStocks();
          if (refreshedResponse.success) {
            setProductStocks(
              refreshedResponse.productStocks.map((ps) => ({
                ...ps,
                created_by: {
                  ...ps.created_by,
                  id:
                    ps.created_by && ps.created_by.id
                      ? parseInt(ps.created_by.id)
                      : null,
                },
                updated_by: ps.updated_by
                  ? {
                      ...ps.updated_by,
                      id: ps.updated_by.id ? parseInt(ps.updated_by.id) : null,
                    }
                  : null,
                total_milk_used: parseFloat(ps.total_milk_used) || 0,
              }))
            );
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to delete product stock.",
          });
        }
      } catch (error) {
        console.error("Error deleting product stock:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting product stock.",
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
            <i className="fas fa-boxes me-2" /> Product Stock Management
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
              <i className="fas fa-plus me-2" /> Add Product Stock
            </Button>
          </div>
          <ProductStockStats stats={productStockStats} />
          <ProductStockFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            productStocks={productStocks}
            setCurrentPage={setCurrentPage}
          />
          <ProductStockTable
            productStocks={productStocks}
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            currentPage={currentPage}
            stocksPerPage={stocksPerPage}
            setCurrentPage={setCurrentPage}
            openViewModal={(ps) => {
              setSelectedProductStock(ps);
              setShowViewModal(true);
            }}
            openEditModal={(ps) => {
              setSelectedProductStock(ps);
              setShowEditModal(true);
            }}
            handleDeleteProductStock={handleDeleteProductStock}
            isSupervisor={isSupervisor}
            disableIfSupervisor={disableIfSupervisor}
          />
          <ProductStockModals
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            showViewModal={showViewModal}
            setShowViewModal={setShowViewModal}
            newProductStock={newProductStock}
            setNewProductStock={setNewProductStock}
            selectedProductStock={selectedProductStock}
            setSelectedProductStock={setSelectedProductStock}
            handleAddProductStock={handleAddProductStock}
            handleEditProductStock={handleEditProductStock}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductStock;
