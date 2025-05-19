import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllUsers,
  resetUserPassword,
} from "../../../controllers/usersController";
import Swal from "sweetalert2";
import {
  Spinner,
  Badge,
  Card,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
} from "react-bootstrap";

const ResetPassword = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [selectedRole, setSelectedRole] = useState("");
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // Ambil user yang sedang login dari localStorage
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
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isSupervisor = currentUser?.role_id === 2;

  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "asc",
  });

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success) {
          // Filter out admin users right after fetching
          const nonAdminUsers = response.users.filter(
            (user) => user.role_id !== 1
          );
          setUsers(nonAdminUsers);
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

  // Calculate user statistics (only for non-admin users)
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const supervisorCount = users.filter((user) => user.role_id === 2).length;
    const farmerCount = users.filter((user) => user.role_id === 3).length;

    return {
      totalUsers,
      supervisorCount,
      farmerCount,
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

  // Handle password reset
  const handleResetPassword = useCallback(async (userId, username) => {
    const confirmResult = await Swal.fire({
      title: "Reset Password?",
      html: `Are you sure you want to reset the password for user <strong>${username}</strong>?<br>A new temporary password will be generated.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset it!",
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await resetUserPassword(userId);
        if (response.success) {
          // No need to update user data, just show success
        } else {
          Swal.fire(
            "Error!",
            response.message || "Failed to reset password.",
            "error"
          );
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          "An unexpected error occurred while resetting the password.",
          "error"
        );
        console.error("Error resetting password:", error);
      }
    }
  }, []);

  // Get role badge
  const getRoleBadge = useCallback((roleId) => {
    const roleData = {
      2: { label: "Supervisor", bg: "warning" },
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

  // Filter, sort, and paginate users
  const { filteredUsers, currentUsers, totalPages } = useMemo(() => {
    // Filter users
    const filtered = users.filter(
      (user) =>
        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.contact?.toLowerCase().includes(searchTerm.toLowerCase())) &&
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
    sortConfig,
    usersPerPage,
    indexOfFirstUser,
    indexOfLastUser,
  ]);

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
              <i className="fas fa-key me-2"></i>
              Password Reset Management
            </h4>
            <p
              className="mb-0"
              style={{
                fontSize: "14px",
                color: "#6c757d",
                fontFamily: "Roboto, sans-serif",
              }}
            >
              <i className="fas fa-info-circle me-2"></i>
              This page allows administrators to reset user passwords for
              supervisors and farmers. Select a user from the list below to
              reset their password.
            </p>
          </div>
        </Card.Header>

        {/* User Statistics Section */}
        <Card.Body className="border-bottom">
          <div className="row g-3 mb-4">
            <div className="col-md-6">
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
            <div className="col-md-6">
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
                  <option value="2">Supervisor</option>
                  <option value="3">Farmer</option>
                </select>
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
                  <th scope="col" className="text-center fw-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={user.id} className="align-middle">
                      <td className="text-center text-muted">
                        {indexOfFirstUser + index + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className={`rounded-circle d-flex justify-content-center align-items-center me-2 ${
                              user.role_id === 2
                                ? "bg-info bg-opacity-10"
                                : "bg-info bg-opacity-10"
                            }`}
                            style={{ width: "32px", height: "32px" }}
                          >
                            <i
                              className={`fas fa-user ${
                                user.role_id === 2
                                  ? "text-warning"
                                  : "text-info"
                              }`}
                            ></i>
                          </div>
                          <div className="text-dark">{user.username}</div>
                        </div>
                      </td>
                      <td className="text-dark">{user.name}</td>
                      <td className="text-dark">{user.email}</td>
                      <td className="text-center">
                        {getRoleBadge(user.role_id)}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger
                          overlay={<Tooltip>Reset User's Password</Tooltip>}
                        >
                          <span>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() =>
                                handleResetPassword(user.id, user.username)
                              }
                              disabled={isSupervisor}
                              tabIndex={isSupervisor ? -1 : 0}
                              aria-disabled={isSupervisor}
                            >
                              <i className="fas fa-key me-1"></i> Reset Password
                            </button>
                          </span>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
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

export default ResetPassword;
