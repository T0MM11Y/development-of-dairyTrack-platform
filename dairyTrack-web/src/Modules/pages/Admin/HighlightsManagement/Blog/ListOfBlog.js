import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import CSS untuk Quill

import Swal from "sweetalert2";
import {
  Button,
  Card,
  Form,
  FormControl,
  InputGroup,
  Modal,
  OverlayTrigger,
  Pagination,
  Spinner,
  Tooltip,
  Table,
} from "react-bootstrap";
import {
  assignCategoryToBlog,
  getBlogCategories,
  removeCategoryFromBlog,
} from "../../../../controllers/blogCategoryController"; // Import fungsi dari blogCategoryController

import {
  listBlogs,
  addBlog,
  deleteBlog,
  updateBlog,
} from "../../../../controllers/blogController";
import {
  addCategory,
  listCategories,
  deleteCategory,
  updateCategory,
} from "../../../../controllers/categoryController"; // Import addCategory

const ListOfBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false); // State untuk modal assign
  const [selectedCategory, setSelectedCategory] = useState(null); // Kategori yang dipilih
  const [blogCategories, setBlogCategories] = useState({}); // State untuk menyimpan kategori per blog
  const [selectedFilterCategory, setSelectedFilterCategory] = useState(null); // State untuk filter kategori
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // State for category modal
  const [showCategoryListModal, setShowCategoryListModal] = useState(false); // State for list category modal
  const [categories, setCategories] = useState([]); // State for categories list

  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" }); // State for new category

  const [showEditModal, setShowEditModal] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    photo: null,
  });

  const [selectedBlog, setSelectedBlog] = useState(null);
  // Fungsi untuk menghasilkan warna berdasarkan nama atau ID kategori
  const getCategoryColor = (categoryName) => {
    const colors = [
      "#FF5733", // Merah
      "#33FF57", // Hijau
      "#3357FF", // Biru
      "#FF33A1", // Pink
      "#FFC300", // Kuning
      "#8E44AD", // Ungu
      "#16A085", // Teal
    ];
    const index = categoryName.charCodeAt(0) % colors.length;
    return colors[index];
  };
  const blogsPerPage = 4;
  // Handler untuk membuka modal assign
  const handleOpenAssignModal = () => {
    fetchCategories(); // Pastikan kategori sudah dimuat
    setShowAssignModal(true);
  };
  // Fetch blogs dan kategori terkait
  useEffect(() => {
    const fetchBlogsAndCategories = async () => {
      try {
        const { success, blogs } = await listBlogs();
        if (success) {
          setBlogs(blogs);

          // Fetch kategori untuk setiap blog
          const categoriesMap = {};
          for (const blog of blogs) {
            const { success, categories } = await getBlogCategories(blog.id);
            if (success) {
              categoriesMap[blog.id] = categories;
            } else {
              categoriesMap[blog.id] = [];
            }
          }
          setBlogCategories(categoriesMap);
        }
      } catch (error) {
        console.error("Error fetching blogs and categories:", error);
      }
    };

    fetchBlogsAndCategories();
  }, []);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { success, blogs, message } = await listBlogs();
        setBlogs(success ? blogs : []);
        setError(success ? null : message || "Failed to fetch blogs.");
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Tambahkan fungsi untuk mengedit kategori
  const handleEditCategory = async (categoryId, updatedCategory) => {
    const { success, message } = await updateCategory(
      categoryId,
      updatedCategory
    );
    if (success) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? { ...category, ...updatedCategory }
            : category
        )
      );
      Swal.fire("Updated!", "Category updated successfully.", "success");
    } else {
      Swal.fire("Error!", message || "Failed to update category.", "error");
    }
  };

  // Tambahkan fungsi untuk menghapus kategori
  const handleDeleteCategory = async (categoryId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed) {
      const { success, message } = await deleteCategory(categoryId);
      if (success) {
        setCategories(
          categories.filter((category) => category.id !== categoryId)
        );
        Swal.fire("Deleted!", "Category deleted.", "success");
      } else {
        Swal.fire("Error!", message || "Failed to delete category.", "error");
      }
    }
  };
  // Handler untuk menghapus kategori dari blog
  const handleRemoveCategory = async (blogId, categoryId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be removed from the blog.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (isConfirmed) {
      const { success, message } = await removeCategoryFromBlog(
        blogId,
        categoryId
      );
      if (success) {
        // Update kategori di state
        setBlogCategories((prev) => ({
          ...prev,
          [blogId]: prev[blogId].filter(
            (category) => category.id !== categoryId
          ),
        }));
        Swal.fire(
          "Removed!",
          "Category has been removed from the blog.",
          "success"
        );
      } else {
        Swal.fire("Error!", message || "Failed to remove category.", "error");
      }
    }
  };

  // Fetch blogs and categories
  const fetchBlogsAndCategories = async () => {
    try {
      const { success, blogs } = await listBlogs();
      if (success) {
        setBlogs(blogs);

        // Fetch kategori untuk setiap blog
        const categoriesMap = {};
        for (const blog of blogs) {
          const { success, categories } = await getBlogCategories(blog.id);
          if (success) {
            categoriesMap[blog.id] = categories;
          } else {
            categoriesMap[blog.id] = [];
          }
        }
        setBlogCategories(categoriesMap);
      }
    } catch (error) {
      console.error("Error fetching blogs and categories:", error);
    }
  };

  // Handler untuk assign kategori ke blog
  const handleAssignCategory = async () => {
    if (!selectedCategory || !selectedBlog) {
      Swal.fire("Error!", "Please select both a category and a blog.", "error");
      return;
    }

    const { success, message } = await assignCategoryToBlog(
      selectedBlog.id,
      selectedCategory.id
    );

    if (success) {
      Swal.fire("Success!", "Category assigned to blog.", "success");
      setShowAssignModal(false);
      fetchBlogsAndCategories();
    } else {
      Swal.fire("Error!", message || "Failed to assign category.", "error");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { success, categories, message } = await listCategories();
      if (success) {
        setCategories(categories);
      } else {
        Swal.fire("Error!", message || "Failed to fetch categories.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "An unexpected error occurred.", "error");
    }
  };

  // Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const { success, category, message } = await addCategory(newCategory);
    if (success) {
      Swal.fire("Success!", "Category added successfully.", "success");
      setShowCategoryModal(false);
      setNewCategory({ name: "", description: "" });
    } else {
      Swal.fire("Error!", message || "Failed to add category.", "error");
    }
  };
  const handleShowCategoryList = () => {
    fetchCategories();
    setShowCategoryListModal(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  // Memoized filtered and paginated blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = blog.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedFilterCategory ||
        (blogCategories[blog.id] &&
          blogCategories[blog.id].some(
            (category) => category.id === parseInt(selectedFilterCategory)
          ));
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchTerm, selectedFilterCategory, blogCategories]);

  const currentBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + blogsPerPage);
  }, [filteredBlogs, currentPage]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Handlers
  const handlePageChange = (page) => setCurrentPage(page);

  const handleDeleteBlog = async (blogId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed) {
      const { success, message } = await deleteBlog(blogId);
      if (success) {
        setBlogs(blogs.filter((blog) => blog.id !== blogId));
        Swal.fire("Deleted!", "Blog deleted.", "success");
      } else {
        Swal.fire("Error!", message || "Failed to delete blog.", "error");
      }
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    const { success, blog } = await addBlog(newBlog);
    if (success) {
      setBlogs([...blogs, blog]);
      setShowModal(false);
      setNewBlog({ title: "", content: "", photo: null });
      fetchBlogsAndCategories();
    }
  };

  const handleEditBlog = async (e) => {
    e.preventDefault();
    const { success, blog } = await updateBlog(selectedBlog.id, selectedBlog);
    if (success) {
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? blog : b)));
      setShowEditModal(false);
      setSelectedBlog(null);
      Swal.fire("Updated!", "Blog updated successfully.", "success");
    } else {
      Swal.fire("Error!", "Failed to update blog.", "error");
    }
  };

  const openEditModal = (blog) => {
    setSelectedBlog({ ...blog });
    setShowEditModal(true);
  };
  // Fetch blogs dan kategori terkait
  useEffect(() => {
    const fetchBlogsAndCategories = async () => {
      try {
        const { success, blogs } = await listBlogs();
        if (success) {
          setBlogs(blogs);

          // Fetch kategori untuk setiap blog
          const categoriesMap = {};
          for (const blog of blogs) {
            const { success, categories } = await getBlogCategories(blog.id);
            if (success) {
              categoriesMap[blog.id] = categories;
            } else {
              categoriesMap[blog.id] = [];
            }
          }
          setBlogCategories(categoriesMap);
        }
      } catch (error) {
        console.error("Error fetching blogs and categories:", error);
      }
    };

    fetchBlogsAndCategories();
  }, []);

  // Render loading or error states
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );

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
            <i className="fas fa-blog me-2" /> Blog Management
          </h4>
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="warning"
              className="me-2"
              style={{ color: "white" }}
              onClick={() => setShowCategoryModal(true)}
            >
              <i className="fas fa-folder-plus me-2" /> Category
            </Button>
            <Button
              variant="info"
              className="me-2"
              style={{ color: "white" }}
              onClick={handleShowCategoryList}
            >
              <i className="fas fa-list me-2" /> View Categories
            </Button>
            <Button
              variant="secondary"
              className="me-2"
              style={{ color: "white" }}
              onClick={handleOpenAssignModal}
            >
              <i className="fas fa-link me-2" /> Assign Categories
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2" /> Add Blog
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Search Input */}
            <InputGroup className="shadow-sm" style={{ maxWidth: "500px" }}>
              <InputGroup.Text className="bg-primary text-white border-0">
                <i className="fas fa-search" />
              </InputGroup.Text>
              <FormControl
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>

            {/* Simple Category Filter */}
            <Form.Select
              value={selectedFilterCategory || ""}
              onChange={(e) =>
                setSelectedFilterCategory(e.target.value || null)
              }
              style={{ maxWidth: "300px" }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Blog List */}
          <div className="row">
            {currentBlogs.map((blog) => (
              <div className="col-md-3 mb-4" key={blog.id}>
                <Card className="h-60 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={blog.photo_url}
                    alt={blog.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "grey",
                        letterSpacing: "0.2px",
                        textAlign: "center",
                        backgroundColor: "#EEEEEE",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {blog.title}
                    </Card.Title>
                    <Card.Text>
                      <div
                        className="text-truncate"
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#6c757d",
                          letterSpacing: "0.4px",
                          textAlign: "justify",
                          fontFamily: "sans-serif",
                        }}
                      ></div>
                      <div className="mt-2">
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {blogCategories[blog.id]?.map((category) => (
                            <span
                              key={category.id}
                              className="badge text-white d-flex align-items-center"
                              style={{
                                backgroundColor: getCategoryColor(
                                  category.name
                                ),
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                padding: "0.35em 0.65em",
                              }}
                            >
                              {category.name}
                              <Button
                                variant="link"
                                className="text-white ms-2 p-0"
                                style={{ fontSize: "0.8rem" }}
                                onClick={() =>
                                  handleRemoveCategory(blog.id, category.id)
                                }
                              >
                                <i className="fas fa-times" />
                              </Button>
                            </span>
                          ))}
                          {blogCategories[blog.id]?.length === 0 && (
                            <span
                              className="badge text-muted"
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                fontFamily: "sans-serif",
                                letterSpacing: "0.9px",
                                padding: "0.35em 0.65em",
                              }}
                            >
                              No categories assigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {blog.content.replace(/<[^>]*>/g, "").slice(0, 220)}{" "}
                      </div>
                      <div className="mt-2">
                        <small
                          className="text-muted"
                          style={{
                            letterSpacing: "0.4px",
                            fontWeight: "400",
                            fontFamily: "sans-serif",
                          }}
                        ></small>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i
                          className="fas fa-calendar-alt me-2"
                          style={{ color: "#6c757d" }}
                        />
                        <small
                          className="text-muted"
                          style={{ letterSpacing: "0.4px", fontWeight: "400" }}
                        >
                          <strong>Created:</strong>{" "}
                          {format(new Date(blog.created_at), "MMMM dd, yyyy")}
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <i
                          className="fas fa-edit me-2"
                          style={{ color: "#6c757d" }}
                        />
                        <small
                          className="text-muted"
                          style={{ letterSpacing: "0.4px", fontWeight: "400" }}
                        >
                          <strong>Updated:</strong>{" "}
                          {format(new Date(blog.updated_at), "MMMM dd, yyyy")}
                        </small>
                      </div>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between">
                    <OverlayTrigger overlay={<Tooltip>Edit Blog</Tooltip>}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(blog)}
                      >
                        <i className="fas fa-edit" /> Edit
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Delete Blog</Tooltip>}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteBlog(blog.id)}
                      >
                        <i className="fas fa-trash-alt" /> Delete
                      </Button>
                    </OverlayTrigger>
                  </Card.Footer>
                </Card>
              </div>
            ))}
          </div>
          {!filteredBlogs.length && (
            <p className="text-center text-muted">No blogs found.</p>
          )}

          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="card-footer bg-transparent border-0 mt-3">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                    >
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing {(currentPage - 1) * blogsPerPage + 1} to{" "}
                  {Math.min(currentPage * blogsPerPage, filteredBlogs.length)}{" "}
                  of {filteredBlogs.length} entries
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
      {/* Add Category Modal */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "Roboto, Monospace",
              fontWeight: "500",
              color: "#3D90D7",
              letterSpacing: "1.2px",
              fontSize: "20px",
            }}
          >
            Add New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCategory}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Category
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Assign Categories Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Categories to Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Blog</Form.Label>
              <Form.Select
                onChange={(e) =>
                  setSelectedBlog(
                    blogs.find((blog) => blog.id === parseInt(e.target.value))
                  )
                }
                defaultValue=""
              >
                <option value="" disabled>
                  Select a blog
                </option>
                {blogs.map((blog) => (
                  <option key={blog.id} value={blog.id}>
                    {blog.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select Category</Form.Label>
              <Form.Select
                onChange={(e) =>
                  setSelectedCategory(
                    categories.find(
                      (category) => category.id === parseInt(e.target.value)
                    )
                  )
                }
                defaultValue=""
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button variant="primary" onClick={handleAssignCategory}>
              Assign
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* List Categories Modal */}
      <Modal
        show={showCategoryListModal}
        onHide={() => setShowCategoryListModal(false)}
        size="xl" // Tambahkan properti ini untuk memperbesar modal
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "Roboto, Monospace",
              fontWeight: "500",
              color: "#3D90D7",
              letterSpacing: "1.2px",
              fontSize: "20px",
            }}
          >
            Category List
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categories.length > 0 ? (
            <div className="table-responsive rounded-3">
              <table className="table table-hover table-bordered mb-0">
                <thead className="bg-light text-muted">
                  <tr>
                    <th
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#BE5B50",
                        fontFamily: "Roboto, Monospace",
                        letterSpacing: "1.2px",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#BE5B50",
                        fontFamily: "Roboto, Monospace",
                        letterSpacing: "1.2px",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#BE5B50",
                        fontFamily: "Roboto, Monospace",
                        letterSpacing: "1.2px",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#BE5B50",
                        fontFamily: "Roboto, Monospace",
                        letterSpacing: "1.2px",
                      }}
                    >
                      Blog Count
                    </th>
                    <th
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#BE5B50",
                        fontFamily: "Roboto, Monospace",
                        letterSpacing: "1.2px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id} className="align-middle">
                      <td className="text-center text-muted">{index + 1}</td>
                      <td>
                        <Form.Control
                          type="text"
                          value={category.name}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((cat) =>
                                cat.id === category.id
                                  ? { ...cat, name: e.target.value }
                                  : cat
                              )
                            )
                          }
                          onBlur={() =>
                            handleEditCategory(category.id, {
                              name: category.name,
                            })
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={category.description}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((cat) =>
                                cat.id === category.id
                                  ? { ...cat, description: e.target.value }
                                  : cat
                              )
                            )
                          }
                          onBlur={() =>
                            handleEditCategory(category.id, {
                              description: category.description,
                            })
                          }
                        />
                      </td>
                      <td className="text-dark">{category.blog_count}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <i className="fas fa-trash-alt" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i
                className="fas fa-search fs-3 d-block mb-2"
                style={{ color: "#dee2e6" }}
              ></i>
              <p className="text-muted">No categories found.</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
      ; ;{/* Add Blog Modal */}
      <Modal
        key={showModal ? "add-blog-open" : "add-blog-closed"}
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setNewBlog({
            title: "",
            content: "",
            photo: null,
            photoPreview: null,
          });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "Roboto, Monospace",
              fontWeight: "500",
              color: "#3D90D7",
              letterSpacing: "1.2px",
              fontSize: "20px",
            }}
          >
            Add New Blog
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddBlog}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter blog title"
                value={newBlog.title}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <ReactQuill
                theme="snow"
                value={newBlog.content}
                onChange={(value) => setNewBlog({ ...newBlog, content: value })}
                placeholder="Enter blog content"
                style={{ height: "200px" }} // Atur tinggi editor
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label></Form.Label>
              <div className="d-flex flex-column align-items-start">
                {/* Preview Gambar */}
                {newBlog.photoPreview && (
                  <div className="mb-3">
                    <img
                      src={newBlog.photoPreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        padding: "5px",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                )}
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setNewBlog({
                        ...newBlog,
                        photo: file,
                        photoPreview: previewUrl, // Simpan URL untuk preview
                      });
                    } else {
                      setNewBlog({
                        ...newBlog,
                        photo: null,
                        photoPreview: null, // Hapus preview jika tidak ada file
                      });
                    }
                  }}
                  accept="image/*"
                  required
                />
              </div>
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Blog
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Edit Blog Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "Roboto, Monospace",
              fontWeight: "500",
              color: "#3D90D7",
              letterSpacing: "1.2px",
              fontSize: "20px",
            }}
          >
            Edit Blog
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditBlog}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter blog title"
                value={selectedBlog?.title || ""}
                onChange={(e) =>
                  setSelectedBlog({
                    ...selectedBlog,
                    title: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <ReactQuill
                theme="snow"
                value={selectedBlog?.content || ""}
                onChange={(value) =>
                  setSelectedBlog({ ...selectedBlog, content: value })
                }
                placeholder="Enter blog content"
                style={{ height: "200px" }} // Atur tinggi editor
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label></Form.Label>
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                {selectedBlog?.photo_url && (
                  <div className="mb-3" style={{ width: "48%" }}>
                    <h6></h6>
                    <img
                      src={selectedBlog.photo_url}
                      alt="Current"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                      className="mb-2 border p-1"
                    />
                    <div className="text-muted small">
                      {selectedBlog.photo_url.split("/").pop()}
                    </div>
                  </div>
                )}
                {selectedBlog?.previewUrl && (
                  <div className="mb-3" style={{ width: "48%" }}>
                    <h6>New Photo Preview</h6>
                    <img
                      src={selectedBlog.previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                      className="mb-2 border p-1"
                    />
                    <div className="text-muted small">
                      {selectedBlog.photo?.name}
                    </div>
                  </div>
                )}
              </div>
              <Form.Control
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    setSelectedBlog({
                      ...selectedBlog,
                      photo: file,
                      previewUrl: previewUrl,
                    });
                  } else {
                    setSelectedBlog({
                      ...selectedBlog,
                      photo: null,
                      previewUrl: null,
                    });
                  }
                }}
                accept="image/*"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListOfBlog;
