import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  listCows,
  deleteCow,
  exportCowsToPDF,
  exportCowsToExcel,
} from "../../../controllers/cowsController";
import Swal from "sweetalert2";
import {
  Spinner,
  Card,
  Badge,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getCowManagers } from "../../../controllers/cattleDistributionController";
import { listCowsByUser } from "../../../controllers/cattleDistributionController";

const lactationPhaseDescriptions = {
  Dry: "The cow is not producing milk and is in a resting phase before the next lactation cycle.",
  Early:
    "The cow is in the early stage of lactation, typically producing the highest amount of milk.",
  Mid: "The cow is in the middle stage of lactation, with milk production gradually decreasing.",
  Late: "The cow is in the late stage of lactation, with milk production significantly reduced.",
};

// Ambil user dari localStorage
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

const calculateAge = (birthdate) => {
  if (!birthdate) return "N/A";
  const birthDate = new Date(birthdate);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (days < 0) {
    months--;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
  }

  const yearText = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "";
  const monthText = months > 0 ? `${months} month${months > 1 ? "s" : ""}` : "";
  const dayText = days > 0 ? `${days} day${days > 1 ? "s" : ""}` : "";

  return [yearText, monthText, dayText].filter(Boolean).join(", ");
};

const Cows = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cowsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [expandedCow] = useState(null);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");

  // Cek role user
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isSupervisor = currentUser?.role_id === 2;
  const isFarmer = currentUser?.role_id === 3;

  // Fetch cows data
  useEffect(() => {
    const fetchCows = async () => {
      try {
        let response;

        // Jika user adalah farmer (role_id === 3), hanya ambil sapi yang mereka kelola
        if (isFarmer) {
          const userId = currentUser?.id || currentUser?.user_id;
          if (!userId) {
            throw new Error("User ID not found");
          }
          response = await listCowsByUser(userId);
        } else {
          // Untuk admin dan supervisor, ambil semua sapi
          response = await listCows();
        }

        if (response.success) {
          setCows(response.cows || []);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to fetch cows.",
          });
        }
      } catch (error) {
        console.error("Error fetching cows:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while fetching cows.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCows();
    }
  }, [currentUser, isFarmer]);

  // Calculate cow statistics
  const cowStats = useMemo(() => {
    const totalCows = cows.length;
    const femaleCount = cows.filter((cow) => cow.gender === "Female").length;
    const maleCount = cows.filter((cow) => cow.gender === "Male").length;
    const phaseCounts = cows.reduce((acc, cow) => {
      acc[cow.lactation_phase] = (acc[cow.lactation_phase] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCows,
      femaleCount,
      maleCount,
      femalePercentage: totalCows
        ? Math.round((femaleCount / totalCows) * 100)
        : 0,
      malePercentage: totalCows ? Math.round((maleCount / totalCows) * 100) : 0,
      phaseCounts,
    };
  }, [cows]);

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

  // Handle edit cow
  const handleEditCow = useCallback((cowId) => {
    window.location.href = `/admin/edit-cow/${cowId}`;
  }, []);

  // Handle delete cow
  const handleDeleteCow = useCallback(
    async (cowId) => {
      // Farmer tidak bisa menghapus sapi
      if (isFarmer) {
        Swal.fire({
          icon: "warning",
          title: "Access Denied",
          text: "Farmers cannot delete cows. Please contact an administrator.",
        });
        return;
      }

      // Sebelum menghapus, tampilkan daftar user yang mengelola sapi
      const managersResponse = await getCowManagers(cowId);
      if (managersResponse.success && managersResponse.managers.length > 0) {
        const managerList = managersResponse.managers
          .map((manager) => manager.username)
          .join(", ");
        Swal.fire({
          title: "Cow Managers",
          text: `This cow is managed by: ${managerList}. Are you sure you want to delete this cow?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        }).then(async (confirmResult) => {
          if (confirmResult.isConfirmed) {
            const response = await deleteCow(cowId);
            if (response.success) {
              Swal.fire("Deleted!", response.message, "success");
              setCows((prevCows) => prevCows.filter((cow) => cow.id !== cowId));
            } else {
              Swal.fire(
                "Error!",
                response.message || "Failed to delete cow.",
                "error"
              );
            }
          }
        });
      } else {
        // Jika tidak ada manager, langsung tampilkan konfirmasi penghapusan
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await deleteCow(cowId);
          if (response.success) {
            Swal.fire("Deleted!", response.message, "success");
            setCows((prevCows) => prevCows.filter((cow) => cow.id !== cowId));
          } else {
            Swal.fire(
              "Error!",
              response.message || "Failed to delete cow.",
              "error"
            );
          }
        }
      }
    },
    [isFarmer]
  );

  // Filter, sort, and paginate cows
  const { filteredCows, currentCows, totalPages } = useMemo(() => {
    // Filter cows
    const filtered = cows.filter(
      (cow) =>
        (cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cow.breed.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedGender === "" || cow.gender === selectedGender) &&
        (selectedPhase === "" || cow.lactation_phase === selectedPhase)
    );

    // Sort cows
    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === "weight") {
        return sortConfig.direction === "asc"
          ? a.weight - b.weight
          : b.weight - a.weight;
      }
      if (sortConfig.key === "birth") {
        return sortConfig.direction === "asc"
          ? new Date(a.birth) - new Date(b.birth)
          : new Date(b.birth) - new Date(a.birth);
      }

      const valueA = a[sortConfig.key]?.toLowerCase?.() || "";
      const valueB = b[sortConfig.key]?.toLowerCase?.() || "";

      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    // Paginate cows
    const current = sorted.slice(
      (currentPage - 1) * cowsPerPage,
      currentPage * cowsPerPage
    );
    const total = Math.ceil(sorted.length / cowsPerPage);

    return {
      filteredCows: filtered,
      currentCows: current,
      totalPages: total,
    };
  }, [
    cows,
    searchTerm,
    selectedGender,
    selectedPhase,
    sortConfig,
    currentPage,
    cowsPerPage,
  ]);

  // Pagination controls component
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
          <p className="mt-3 text-primary">Loading cow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4
              className="mb-0"
              style={{
                color: "#3D90D7",
                fontSize: "25px",
                fontFamily: "Roboto, Monospace",
                letterSpacing: "1.4px",
              }}
            >
              <i className="fas fa-cow me-2"></i>
              {isFarmer ? "My Managed Cows" : "Cow Management"}
            </h4>
            <div
              className="d-flex align-items-center"
              style={{ marginLeft: "20px" }}
            >
              <Badge
                bg="info"
                style={{
                  color: "#ffffff",
                  letterSpacing: "0.3px",
                  fontFamily: "Roboto, Monospace",
                  fontWeight: "500",
                  fontSize: "0.15rem",
                  padding: "0.2rem 0.3rem",
                  height: "1.2rem",
                  lineHeight: "0.7rem",
                }}
                pill
                className="fs-6 me-2"
              >
                {isFarmer ? "My Cows: " : "Total Cows: "}
                {cowStats.totalCows}
              </Badge>
            </div>
          </div>
        </Card.Header>

        {/* Lactation Phase Information */}
        <Card.Body className="border-bottom">
          <div className="mb-3">
            <h6 className="text-muted mb-2">
              <i className="fas fa-info-circle me-1"></i>
              Lactation Phase Info
            </h6>
            <div className="row g-2">
              {Object.entries(lactationPhaseDescriptions).map(
                ([phase, description]) => {
                  // Define colors for each phase
                  const phaseColors = {
                    Dry: "#f8d7da", // Light red
                    Early: "#d4edda", // Light green
                    Mid: "#d1ecf1", // Light blue
                    Late: "#fff3cd", // Light yellow
                  };

                  return (
                    <div className="col-md-6" key={phase}>
                      <div
                        className="p-2 border rounded"
                        style={{
                          backgroundColor: phaseColors[phase] || "#f8f9fa",
                          borderLeft: `4px solid ${
                            phaseColors[phase]?.replace("f", "c") || "#0d6efd"
                          }`,
                        }}
                      >
                        <h6
                          className="text-primary mb-1"
                          style={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            textTransform: "capitalize",
                          }}
                        >
                          {phase}
                        </h6>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "12px" }}
                        >
                          {description}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </Card.Body>
        {/* Cow Statistics Section */}
        <Card.Body className="border-bottom">
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Female Cows</span>
                    <Badge bg="success" pill>
                      {cowStats.femaleCount}
                    </Badge>
                  </div>
                  <ProgressBar
                    variant="success"
                    now={cowStats.femalePercentage}
                    className="mb-2"
                    style={{ height: "6px" }}
                  />
                  <small className="text-muted">
                    {cowStats.femalePercentage}% of total cows
                  </small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Male Cows</span>
                    <Badge bg="primary" pill>
                      {cowStats.maleCount}
                    </Badge>
                  </div>
                  <ProgressBar
                    variant="primary"
                    now={cowStats.malePercentage}
                    className="mb-2"
                    style={{ height: "6px" }}
                  />
                  <small className="text-muted">
                    {cowStats.malePercentage}% of total cows
                  </small>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>

        {/* Cow Table Section */}
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
                  placeholder="Search cows..."
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
                  value={selectedGender}
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
                <select
                  className="form-select shadow-sm py-2 border-0 w-auto"
                  value={selectedPhase}
                  onChange={(e) => {
                    setSelectedPhase(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Phases</option>
                  {Object.keys(cowStats.phaseCounts).map((phase) => (
                    <option key={phase} value={phase}>
                      {phase} ({cowStats.phaseCounts[phase]})
                    </option>
                  ))}
                </select>

                {/* Export buttons - hanya untuk admin dan supervisor */}
                {!isFarmer && (
                  <>
                    <OverlayTrigger
                      overlay={<Tooltip>Export to Excel</Tooltip>}
                    >
                      <button
                        className="btn btn-success shadow-sm"
                        onClick={exportCowsToExcel}
                      >
                        <i className="fas fa-file-excel me-1"></i> Excel
                      </button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Export to PDF</Tooltip>}>
                      <button
                        className="btn btn-danger shadow-sm"
                        onClick={exportCowsToPDF}
                      >
                        <i className="fas fa-file-pdf me-1"></i> PDF
                      </button>
                    </OverlayTrigger>
                  </>
                )}

                {/* Add cow button - hanya untuk admin */}
                {!isSupervisor && !isFarmer && (
                  <OverlayTrigger overlay={<Tooltip>Add New Cow</Tooltip>}>
                    <Link
                      to="/admin/add-cow"
                      className="btn btn-primary shadow-sm"
                    >
                      <i className="fas fa-plus me-1"></i> Add Cow
                    </Link>
                  </OverlayTrigger>
                )}
              </div>
            </div>
          </div>

          {/* ...existing table code... */}

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
                    onClick={() => handleSort("name")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      Name
                      {sortConfig.key === "name" && (
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
                    className="cursor-pointer fw-medium"
                    onClick={() => handleSort("breed")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      Breed
                      {sortConfig.key === "breed" && (
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
                    className="cursor-pointer fw-medium"
                    onClick={() => handleSort("weight")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      Weight (kg)
                      {sortConfig.key === "weight" && (
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
                    className="cursor-pointer fw-medium"
                    onClick={() => handleSort("birth")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      Age
                      {sortConfig.key === "birth" && (
                        <i
                          className={`fas fa-arrow-${
                            sortConfig.direction === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="fw-medium">
                    Gender
                  </th>
                  <th scope="col" className="fw-medium">
                    Phase
                  </th>
                  <th scope="col" className="text-center fw-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCows.length > 0 ? (
                  currentCows.map((cow, index) => (
                    <React.Fragment key={cow.id}>
                      <tr
                        className={`align-middle ${
                          expandedCow === cow.id ? "table-active" : ""
                        }`}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            expandedCow === cow.id
                              ? "rgba(0, 0, 0, 0.03)"
                              : "inherit",
                        }}
                      >
                        <td className="text-center text-muted">
                          {(currentPage - 1) * cowsPerPage + index + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className={`rounded-circle d-flex justify-content-center align-items-center me-2 ${
                                cow.gender === "Female"
                                  ? "bg-success bg-opacity-10"
                                  : "bg-primary bg-opacity-10"
                              }`}
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i
                                className={`fas ${
                                  cow.gender === "Female"
                                    ? "fa-venus"
                                    : "fa-mars"
                                } ${
                                  cow.gender === "Female"
                                    ? "text-success"
                                    : "text-primary"
                                }`}
                              ></i>
                            </div>
                            <div className="text-dark">{cow.name}</div>
                          </div>
                        </td>
                        <td className="text-dark">{cow.breed}</td>
                        <td className="text-dark">{cow.weight} kg</td>
                        <td className="text-dark">{calculateAge(cow.birth)}</td>
                        <td>
                          <Badge
                            bg={cow.gender === "Female" ? "success" : "primary"}
                            className="text-capitalize"
                          >
                            {cow.gender}
                          </Badge>
                        </td>
                        <td className="text-dark">{cow.lactation_phase}</td>
                        <td className="text-center">
                          <div className="btn-group">
                            <OverlayTrigger
                              overlay={<Tooltip>Edit Cow</Tooltip>}
                            >
                              <span>
                                <button
                                  className={`btn btn-sm ${
                                    isSupervisor || isFarmer
                                      ? "btn-outline-secondary"
                                      : "btn-outline-warning"
                                  } border-0 me-1`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCow(cow.id);
                                  }}
                                  disabled={isSupervisor || isFarmer}
                                  tabIndex={isSupervisor || isFarmer ? -1 : 0}
                                  aria-disabled={isSupervisor || isFarmer}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </span>
                            </OverlayTrigger>
                            <OverlayTrigger
                              overlay={<Tooltip>Delete Cow</Tooltip>}
                            >
                              <span>
                                <button
                                  className={`btn btn-sm ${
                                    isSupervisor || isFarmer
                                      ? "btn-outline-secondary"
                                      : "btn-outline-danger"
                                  } border-0`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCow(cow.id);
                                  }}
                                  disabled={isSupervisor || isFarmer}
                                  tabIndex={isSupervisor || isFarmer ? -1 : 0}
                                  aria-disabled={isSupervisor || isFarmer}
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
                    <td colSpan="8" className="text-center py-4">
                      <div className="text-muted">
                        <i
                          className="fas fa-search fs-3 d-block mb-2"
                          style={{ color: "#dee2e6" }}
                        ></i>
                        {isFarmer
                          ? "No cows assigned to you. Please contact an administrator."
                          : "No cows found matching your search criteria"}
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
                  Showing {(currentPage - 1) * cowsPerPage + 1} to{" "}
                  {Math.min(currentPage * cowsPerPage, filteredCows.length)} of{" "}
                  {filteredCows.length} entries
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Cows;
