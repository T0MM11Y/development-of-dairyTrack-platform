import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllUsers,
  deleteUser,
  exportUsersToPDF,
  exportUsersToExcel,
} from "../../../controllers/usersController";
import Swal from "sweetalert2";
import {
  Spinner,
  Badge,
  Card,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
  Col,
} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { color } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [selectedRole, setSelectedRole] = useState("");
  // Tambahkan: Ambil user dari localStorage
  const getCurrentUser = () => {
    if (typeof localStorage !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  };
  // Tambahkan: Ambil user yang sedang login
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isSupervisor = currentUser?.role_id === 2;
  // Removed selectedStatus state
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "asc",
  });
  const [expandedUser, setExpandedUser] = useState(null);
  const history = useHistory();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success) {
          setUsers(response.users);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to fetch users.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while fetching users.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Calculate user statistics
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter((user) => user.role_id === 1).length;
    const supervisorCount = users.filter((user) => user.role_id === 2).length;
    const farmerCount = users.filter((user) => user.role_id === 3).length;

    return {
      totalUsers,
      adminCount,
      supervisorCount,
      farmerCount,
      adminPercentage: totalUsers
        ? Math.round((adminCount / totalUsers) * 100)
        : 0,
      supervisorPercentage: totalUsers
        ? Math.round((supervisorCount / totalUsers) * 100)
        : 0,
      farmerPercentage: totalUsers
        ? Math.round((farmerCount / totalUsers) * 100)
        : 0,
    };
  }, [users]);

  // Handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }, []);

  // Handle user edit
  const handleEditUser = useCallback(
    (userId) => {
      history.push(`/admin/edit-user/${userId}`);
    },
    [history]
  );
  // Handle user deletion
  const handleDeleteUser = useCallback(
    async (userId) => {
      const userToDelete = users.find((user) => user.id === userId);

      const confirmResult = await Swal.fire({
        title: "Are you absolutely sure?",
        text: "This action is irreversible! All data associated with this user will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it permanently!",
        // Tambahkan tombol "Tidak, batalkan!"
        cancelButtonText: "No, cancel!",
        // Tambahkan kelas CSS kustom untuk tombol
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-secondary ms-2",
        },
        buttonsStyling: false, // Menonaktifkan styling default SweetAlert2
      });

      if (confirmResult.isConfirmed) {
        // Add name verification
        const { value: text } = await Swal.fire({
          title: `Please type "delete ${userToDelete?.username}" to confirm`,
          input: "text",
          inputPlaceholder: `Type "delete ${userToDelete?.username}" here`,
          showCancelButton: true,
          confirmButtonText: "Verify",
          cancelButtonText: "Cancel",
          inputValidator: (value) => {
            if (value !== `delete ${userToDelete?.username}`) {
              return `You need to type "delete ${userToDelete?.username}" to confirm!`;
            }
          },
        });

        if (text === `delete ${userToDelete?.username}`) {
          const response = await deleteUser(userId);
          if (response.success) {
            Swal.fire("Deleted!", response.message, "success");
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== userId)
            );
          } else {
            Swal.fire(
              "Error!",
              response.message || "Failed to delete user.",
              "error"
            );
          }
        }
      }
    },
    [users, deleteUser]
  );

  // Filter, sort, and paginate users
  const { filteredUsers, currentUsers, totalPages } = useMemo(() => {
    // Filter users (removed status filter)
    const filtered = users.filter(
      (user) =>
        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.contact.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === "" || user.role_id === parseInt(selectedRole))
    );

    // Sort users
    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === "role_id") {
        return sortConfig.direction === "asc"
          ? a.role_id - b.role_id
          : b.role_id - a.role_id;
      }

      const valueA = a[sortConfig.key]?.toLowerCase?.() || "";
      const valueB = b[sortConfig.key]?.toLowerCase?.() || "";

      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    // Paginate users
    const current = sorted.slice(indexOfFirstUser, indexOfLastUser);
    const total = Math.ceil(sorted.length / usersPerPage);

    return {
      filteredUsers: filtered,
      sortedUsers: sorted,
      currentUsers: current,
      totalPages: total,
    };
  }, [
    users,
    searchTerm,
    selectedRole,
    // Removed selectedStatus dependency
    sortConfig,
    usersPerPage,
    indexOfFirstUser,
    indexOfLastUser,
  ]);

  // Get role badge
  const getRoleBadge = useCallback((roleId) => {
    const roleData = {
      1: { label: "Admin", bg: "primary" },
      2: { label: "Supervisor", bg: "warning", color: "black" },
      3: { label: "Farmer", bg: "info" },
    };

    const role = roleData[roleId] || { label: "Unknown", bg: "secondary" };

    return (
      <Badge
        bg={role.bg}
        className="role-badge"
        style={{ width: "90px", textAlign: "center" }}
      >
        {role.label}
      </Badge>
    );
  }, []);

  // Toggle expanded user
  const toggleExpandUser = useCallback((userId) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  }, []);

  // Pagination controls
  const PaginationControls = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const half = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(1, currentPage - half);
      endPage = Math.min(totalPages, currentPage + half);

      if (currentPage <= half + 1) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - half) {
        startPage = totalPages - maxVisiblePages + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(1)}>
              <i className="bi bi-chevron-double-left"></i>
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {startPage > 1 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
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
              onClick={() => setCurrentPage(totalPages)}
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-primary">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <div className="d-flex flex-column">
            <h4
              className="mb-2"
              style={{
                color: "#3D90D7",
                fontSize: "25px",
                fontFamily: "Roboto, Monospace",
                letterSpacing: "1.4px",
              }}
            >
              <i className="fas fa-users me-2"></i>
              User Management
            </h4>
            <p
              className="mb-0"
              style={{
                fontSize: "14px",
                color: "#6c757d",
                fontFamily: "Roboto, sans-serif",
              }}
            >
              {" "}
              <i className="fas fa-info-circle me-2"></i>
              This page allows administrators to manage users, including
              viewing, editing, and deleting user accounts, as well as exporting
              user data.
            </p>
          </div>
        </Card.Header>
        {/* User Statistics Section */}
        <Card.Body className="border-bottom">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Admins</span>
                    <Badge bg="primary" pill>
                      {userStats.adminCount}
                    </Badge>
                  </div>
                  <ProgressBar
                    variant="primary"
                    now={userStats.adminPercentage}
                    className="mb-2"
                    style={{ height: "6px" }}
                  />
                  <small className="text-muted">
                    {userStats.adminPercentage}% of total users
                  </small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Supervisors</span>
                    <Badge bg="warning" pill>
                      {userStats.supervisorCount}
                    </Badge>
                  </div>
                  <ProgressBar
                    variant="warning"
                    now={userStats.supervisorPercentage}
                    className="mb-2"
                    style={{ height: "6px" }}
                  />
                  <small className="text-muted">
                    {userStats.supervisorPercentage}% of total users
                  </small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Farmers</span>
                    <Badge bg="info" pill>
                      {userStats.farmerCount}
                    </Badge>
                  </div>
                  <ProgressBar
                    variant="info"
                    now={userStats.farmerPercentage}
                    className="mb-2"
                    style={{ height: "6px" }}
                  />
                  <small className="text-muted">
                    {userStats.farmerPercentage}% of total users
                  </small>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>

        {/* User Table Section */}
        <Card.Body>
          <div className="row mb-4 align-items-center">
            <div className="col-md-6">
              <div
                className="input-group shadow-sm"
                style={{
                  boxShadow: "0px 4px 6px rgba(51, 50, 50, 0.1)",
                }}
              >
                <span className="input-group-text bg-primary text-white border-0">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 py-2"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-0"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-flex justify-content-end align-items-center gap-2">
                <select
                  className="form-select shadow-sm py-2 border-0 w-auto"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="1">Admin</option>
                  <option value="2">Supervisor</option>
                  <option value="3">Farmer</option>
                </select>
                {/* Removed status dropdown */}
                <OverlayTrigger overlay={<Tooltip>Export to Excel</Tooltip>}>
                  <button
                    className="btn btn-success shadow-sm"
                    onClick={exportUsersToExcel}
                  >
                    <i className="fas fa-file-excel me-1"></i> Excel
                  </button>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip>Export to PDF</Tooltip>}>
                  <button
                    className="btn btn-danger shadow-sm"
                    onClick={exportUsersToPDF}
                  >
                    <i className="fas fa-file-pdf me-1"></i> PDF
                  </button>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip>Add New User</Tooltip>}>
                  <span>
                    <Link
                      to="/admin/add-users"
                      className={`btn btn-primary shadow-sm${
                        isSupervisor ? " disabled" : ""
                      }`}
                      tabIndex={isSupervisor ? -1 : 0}
                      aria-disabled={isSupervisor}
                      onClick={(e) => {
                        if (isSupervisor) e.preventDefault();
                      }}
                    >
                      <i className="fas fa-user-plus me-1"></i> Add User
                    </Link>
                  </span>
                </OverlayTrigger>
              </div>
            </div>
          </div>

          <div className="table-responsive rounded-3">
            <table className="table table-hover table-bordered mb-0">
              <thead>
                <tr className="bg-light text-muted">
                  <th scope="col" className="text-center fw-medium">
                    #
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer fw-medium"
                    onClick={() => handleSort("username")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      Username
                      {sortConfig.key === "username" && (
                        <i
                          className={`fas fa-arrow-${
                            sortConfig.direction === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="fw-medium">
                    Name
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer fw-medium"
                    onClick={() => handleSort("email")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      Email
                      {sortConfig.key === "email" && (
                        <i
                          className={`fas fa-arrow-${
                            sortConfig.direction === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="fw-medium">
                    Contact
                  </th>
                  <th scope="col" className="fw-medium">
                    Birth
                  </th>
                  <th scope="col" className="fw-medium">
                    Religion
                  </th>
                  <th
                    scope="col"
                    className="text-center cursor-pointer fw-medium"
                    onClick={() => handleSort("role_id")}
                  >
                    <div className="d-flex justify-content-center align-items-center">
                      Role
                      {sortConfig.key === "role_id" && (
                        <i
                          className={`bi bi-arrow-${
                            sortConfig.direction === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  {/* Removed Status column header */}
                  <th scope="col" className="text-center fw-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <tr
                        className={`align-middle ${
                          expandedUser === user.id ? "table-active" : ""
                        }`}
                        onClick={() => toggleExpandUser(user.id)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            expandedUser === user.id
                              ? "rgba(0, 0, 0, 0.03)"
                              : "inherit",
                        }}
                      >
                        <td className="text-center text-muted">
                          {indexOfFirstUser + index + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className={`rounded-circle d-flex justify-content-center align-items-center me-2 ${
                                user.role_id === 1
                                  ? "bg-primary bg-opacity-10"
                                  : user.role_id === 2
                                  ? "bg-warning bg-opacity-10"
                                  : "bg-info bg-opacity-10"
                              }`}
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i
                                className={`fas fa-user ${
                                  user.role_id === 1
                                    ? "text-primary"
                                    : user.role_id === 2
                                    ? "text-light opacity-75" /* Changed from text-white to text-light */
                                    : "text-info"
                                }`}
                              ></i>
                            </div>
                            <div className="text-dark">
                              {user.username} (ID: {user.id})
                            </div>
                          </div>
                        </td>
                        <td className="text-dark">{user.name}</td>
                        <td className="text-dark">{user.email}</td>
                        <td className="text-dark">{user.contact}</td>
                        <td className="text-muted">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }).format(new Date(user.birth))}
                        </td>
                        <td className="text-dark">{user.religion}</td>
                        <td className="text-center">
                          {getRoleBadge(user.role_id)}
                        </td>
                        {/* Removed Status column */}
                        <td className="text-center">
                          <div className="btn-group">
                            <OverlayTrigger
                              overlay={<Tooltip>Edit User</Tooltip>}
                            >
                              <span>
                                <Link
                                  to={`/admin/edit-user/${user.id}`}
                                  className={`btn btn-sm ${
                                    currentUser?.role_id === 1
                                      ? "btn-outline-warning"
                                      : "btn-outline-secondary"
                                  } border-0${isSupervisor ? " disabled" : ""}`}
                                  tabIndex={isSupervisor ? -1 : 0}
                                  aria-disabled={isSupervisor}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSupervisor) {
                                      e.preventDefault();
                                    } else {
                                      handleEditUser(user.id);
                                    }
                                  }}
                                >
                                  <i className="fas fa-edit"></i>
                                </Link>
                              </span>
                            </OverlayTrigger>
                            <OverlayTrigger
                              overlay={<Tooltip>Delete User</Tooltip>}
                            >
                              <span>
                                <button
                                  className={`btn btn-sm ${
                                    currentUser?.role_id === 1
                                      ? "btn-outline-danger"
                                      : "btn-outline-secondary"
                                  } border-0`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Disable delete for Admin users
                                    if (!isSupervisor && user.role_id !== 1)
                                      handleDeleteUser(user.id);
                                  }}
                                  disabled={isSupervisor || user.role_id === 1}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </span>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      {/* Updated colspan from 10 to 9 since we removed a column */}
                      <div className="text-muted">
                        <i
                          className="fas fa-search fs-3 d-block mb-2"
                          style={{ color: "#dee2e6" }}
                        ></i>
                        No users found matching your search criteria
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="card-footer bg-transparent border-0 mt-3">
              <PaginationControls />
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing {indexOfFirstUser + 1} to{" "}
                  {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                  {filteredUsers.length} entries
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .cursor-pointer:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .role-badge {
          font-weight: 500;
          padding: 0.5rem 0.75rem;
        }
        .status-badge {
          padding: 0.4rem 0.8rem;
        }
        .table th {
          font-weight: 600;
          padding: 1rem 0.75rem;
        }
        .table td {
          padding: 0.75rem;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
      `}</style>
    </div>
  );
};

export default Users;
