import React, { useState, useEffect, useMemo } from "react";
import { Card, Spinner, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import ProductTypeStats from "./ProductTypeStats";
import ProductTypeFilters from "./ProductTypeFilters";
import ProductTypeTable from "./ProductTypeTable";
import ProductTypeModals from "./ProductTypeModals";
import {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} from "../../../controllers/productTypeController";

const ProductTypes = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newProductType, setNewProductType] = useState({
    product_name: "",
    product_description: "",
    price: "",
    unit: "",
    image: null,
    created_by: "",
  });
  const productsPerPage = 8;

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
        setNewProductType((prev) => ({
          ...prev,
          created_by: userId,
        }));
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

  // Fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoading(true);
      try {
        const response = await getProductTypes();
        if (response.success) {
          // Normalize created_by and updated_by from object to integer for form submission
          // Keep the full object for display
          const normalizedProductTypes = response.productTypes.map((pt) => ({
            ...pt,
            created_by: {
              ...pt.created_by,
              id:
                pt.created_by && pt.created_by.id
                  ? parseInt(pt.created_by.id)
                  : null,
            },
            updated_by: pt.updated_by
              ? {
                  ...pt.updated_by,
                  id: pt.updated_by.id ? parseInt(pt.updated_by.id) : null,
                }
              : null,
            price: parseFloat(pt.price) || 0, // Ensure price is numeric
          }));
          setProductTypes(normalizedProductTypes);
          setError(null);
        } else {
          setError(response.message);
          setProductTypes([]);
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching product types.");
        console.error("Error fetching product types:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductTypes();
  }, []);

  // Calculate statistics
  const productTypeStats = useMemo(() => {
    const totalProductTypes = productTypes.length;

    return {
      totalProductTypes,
    };
  }, [productTypes]);

  // Handle add product type
  const handleAddProductType = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      setError(
        "User not logged in or invalid user ID. Please log in to add a product type."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID. Please log in to add a product type.",
      });
      return;
    }

    const createdBy = parseInt(currentUser.user_id);
    if (isNaN(createdBy)) {
      setError("Invalid user ID for created_by.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid user ID for created_by.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("product_name", newProductType.product_name);
    formData.append("product_description", newProductType.product_description);
    formData.append("price", parseFloat(newProductType.price) || 0);
    formData.append("unit", newProductType.unit);
    if (newProductType.image) {
      formData.append("image", newProductType.image);
    }
    formData.append("created_by", createdBy);
    formData.append("updated_by", "");

    try {
      const response = await createProductType(formData);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product type added successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getProductTypes();
        if (refreshedResponse.success) {
          setProductTypes(
            refreshedResponse.productTypes.map((pt) => ({
              ...pt,
              created_by: {
                ...pt.created_by,
                id:
                  pt.created_by && pt.created_by.id
                    ? parseInt(pt.created_by.id)
                    : null,
              },
              updated_by: pt.updated_by
                ? {
                    ...pt.updated_by,
                    id: pt.updated_by.id ? parseInt(pt.updated_by.id) : null,
                  }
                : null,
              price: parseFloat(pt.price) || 0,
            }))
          );
        }
        setShowAddModal(false);
        setNewProductType({
          product_name: "",
          product_description: "",
          price: "",
          unit: "",
          image: null,
          created_by: currentUser.user_id,
        });
      } else {
        setError(response.message || "Failed to add product type.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add product type.",
        });
      }
    } catch (error) {
      console.error("Error adding product type:", error);
      setError("An unexpected error occurred while adding the product type.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while adding the product type.",
      });
    }
  };

  // Handle edit product type
  const handleEditProductType = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id || isNaN(currentUser.user_id)) {
      setError(
        "User not logged in or invalid user ID. Please log in to edit a product type."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or invalid user ID. Please log in to edit a product type.",
      });
      return;
    }

    const createdBy = selectedProductType.created_by?.id;
    const updatedBy = parseInt(currentUser.user_id);

    if (!createdBy || isNaN(createdBy) || createdBy <= 0) {
      setError("Invalid created_by value for product type.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid created_by value for product type.",
      });
      return;
    }
    if (isNaN(updatedBy) || updatedBy <= 0) {
      setError("Invalid user ID for updated_by.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid user ID for updated_by.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("product_name", selectedProductType.product_name);
    formData.append(
      "product_description",
      selectedProductType.product_description
    );
    formData.append("price", parseFloat(selectedProductType.price) || 0);
    formData.append("unit", selectedProductType.unit);
    if (
      selectedProductType.image &&
      selectedProductType.image instanceof File
    ) {
      formData.append("image", selectedProductType.image);
    }
    formData.append("created_by", createdBy);
    formData.append("updated_by", updatedBy);

    try {
      const response = await updateProductType(
        selectedProductType.id,
        formData
      );
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product type updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        const refreshedResponse = await getProductTypes();
        if (refreshedResponse.success) {
          setProductTypes(
            refreshedResponse.productTypes.map((pt) => ({
              ...pt,
              created_by: {
                ...pt.created_by,
                id:
                  pt.created_by && pt.created_by.id
                    ? parseInt(pt.created_by.id)
                    : null,
              },
              updated_by: pt.updated_by
                ? {
                    ...pt.updated_by,
                    id: pt.updated_by.id ? parseInt(pt.updated_by.id) : null,
                  }
                : null,
              price: parseFloat(pt.price) || 0,
            }))
          );
        }
        setShowEditModal(false);
        setSelectedProductType(null);
      } else {
        setError(response.message || "Failed to update product type.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update product type.",
        });
      }
    } catch (error) {
      console.error("Error editing product type:", error);
      setError("An unexpected error occurred while editing the product type.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while editing the product type.",
      });
    }
  };

  // Handle delete product type
  const handleDeleteProductType = async (productTypeId) => {
    const product = productTypes.find((pt) => pt.id === productTypeId);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${product?.product_name}". This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteProductType(productTypeId);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response.data.message || "Product type deleted successfully.",
            timer: 3000,
            showConfirmButton: false,
          });
          const refreshedResponse = await getProductTypes();
          if (refreshedResponse.success) {
            setProductTypes(
              refreshedResponse.productTypes.map((pt) => ({
                ...pt,
                created_by: {
                  ...pt.created_by,
                  id:
                    pt.created_by && pt.created_by.id
                      ? parseInt(pt.created_by.id)
                      : null,
                },
                updated_by: pt.updated_by
                  ? {
                      ...pt.updated_by,
                      id: pt.updated_by.id ? parseInt(pt.updated_by.id) : null,
                    }
                  : null,
                price: parseFloat(pt.price) || 0,
              }))
            );
          }
        } else {
          setError(response.message || "Failed to delete product type.");
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to delete product type.",
          });
        }
      } catch (error) {
        console.error("Error deleting product type:", error);
        setError(
          "An unexpected error occurred while deleting the product type."
        );
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting product type.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
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
      <Card className="shadow-lg border-0 rounded-lg">
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
            <i className="fas fa-boxes me-2" /> Product Type Management
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
                opacity: 0.98,
                letterSpacing: "1.3px",
                fontWeight: "600",
                fontSize: "0.8rem",
              }}
            >
              <i className="fas fa-plus me-2" /> Add Product Type
            </Button>
          </div>
          <ProductTypeStats stats={productTypeStats} />
          <ProductTypeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            productTypes={productTypes}
            setCurrentPage={setCurrentPage}
          />
          <ProductTypeTable
            productTypes={productTypes}
            searchTerm={searchTerm}
            selectedUnit={selectedUnit}
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            setCurrentPage={setCurrentPage}
            openViewModal={(pt) => {
              setSelectedProductType(pt);
              setShowViewModal(true);
            }}
            openEditModal={(pt) => {
              setSelectedProductType(pt);
              setShowEditModal(true);
            }}
            handleDeleteProductType={handleDeleteProductType}
          />
          <ProductTypeModals
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            showViewModal={showViewModal}
            setShowViewModal={setShowViewModal}
            newProductType={newProductType}
            setNewProductType={setNewProductType}
            selectedProductType={selectedProductType}
            setSelectedProductType={setSelectedProductType}
            handleAddProductType={handleAddProductType}
            handleEditProductType={handleEditProductType}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductTypes;
