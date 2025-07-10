import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  getUsersWithCows,
  assignCowToUser,
  assignCowToUserSilent,
  getAllUsersAndAllCows,
  unassignCowFromUser,
} from "../../controllers/cattleDistributionController";
import {
  Spinner,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
  Tabs,
  Tab,
  InputGroup,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CattleDistribution = () => {
  const [usersWithCows, setUsersWithCows] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCows, setAllCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedCowIds, setSelectedCowIds] = useState([]); // Changed to array for multiple selection
  const [showUnassignedModal, setShowUnassignedModal] = useState(false);
  const [unassignedCattle, setUnassignedCattle] = useState([]);
  const [cowSearchTerm, setCowSearchTerm] = useState(""); // Search for cows
  const [farmerSearchTerm, setFarmerSearchTerm] = useState(""); // Search for farmers
  const [bulkAssignMode, setBulkAssignMode] = useState(false); // Toggle for bulk mode
  const [filteredCows, setFilteredCows] = useState([]); // Filtered cows for display
  const [filteredFarmers, setFilteredFarmers] = useState([]); // Filtered farmers for display

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

  const [dashboardStats, setDashboardStats] = useState({
    totalFarmers: 0,
    totalCows: 0,
    assignedCows: 0,
    unassignedCows: 0,
    breedDistribution: [],
    farmerDistribution: [],
    genderDistribution: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const paginatedUsersWithCows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return usersWithCows.slice(startIndex, endIndex);
  }, [usersWithCows, currentPage, itemsPerPage]);

  const handleShowUnassignedCattle = () => {
    const unassigned = allCows.filter(
      (cow) =>
        !usersWithCows.some((farmer) =>
          farmer.cows.some((assignedCow) => assignedCow.id === cow.id)
        )
    );
    setUnassignedCattle(unassigned);
    setShowUnassignedModal(true);
  };

  const totalPages = Math.ceil(usersWithCows.length / itemsPerPage);
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isSupervisor = currentUser?.role_id === 2;
  // Filter cows based on search term and assignment status
  useEffect(() => {
    if (!cowSearchTerm) {
      setFilteredCows(allCows);
    } else {
      const filtered = allCows.filter(
        (cow) =>
          cow.name.toLowerCase().includes(cowSearchTerm.toLowerCase()) ||
          cow.breed.toLowerCase().includes(cowSearchTerm.toLowerCase()) ||
          cow.gender.toLowerCase().includes(cowSearchTerm.toLowerCase())
      );
      setFilteredCows(filtered);
    }
  }, [cowSearchTerm, allCows]);

  // Filter farmers based on search term
  useEffect(() => {
    if (!farmerSearchTerm) {
      setFilteredFarmers(allUsers);
    } else {
      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(farmerSearchTerm.toLowerCase())
      );
      setFilteredFarmers(filtered);
    }
  }, [farmerSearchTerm, allUsers]);

  // Handle individual cow selection
  const handleCowSelection = (cowId) => {
    setSelectedCowIds((prev) => {
      if (prev.includes(cowId)) {
        return prev.filter((id) => id !== cowId);
      } else {
        return [...prev, cowId];
      }
    });
  };

  // Handle select all cows
  const handleSelectAllCows = (selectAll) => {
    if (selectAll) {
      const availableCowIds = filteredCows.map((cow) => cow.id);
      setSelectedCowIds(availableCowIds);
    } else {
      setSelectedCowIds([]);
    }
  };

  // Handle select unassigned cows only
  const handleSelectUnassignedOnly = () => {
    const unassignedCowIds = filteredCows
      .filter(
        (cow) =>
          !usersWithCows.some((farmer) =>
            farmer.cows.some((assignedCow) => assignedCow.id === cow.id)
          )
      )
      .map((cow) => cow.id);
    setSelectedCowIds(unassignedCowIds);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const usersWithCowsResponse = await getUsersWithCows();
        if (usersWithCowsResponse.success) {
          setUsersWithCows(usersWithCowsResponse.usersWithCows || []);
        } else {
          setError(usersWithCowsResponse.message);
        }

        const allUsersAndCowsResponse = await getAllUsersAndAllCows();
        if (allUsersAndCowsResponse.success) {
          setAllUsers(allUsersAndCowsResponse.users || []);
          setAllCows(allUsersAndCowsResponse.cows || []);

          calculateDashboardStats(
            allUsersAndCowsResponse.users || [],
            allUsersAndCowsResponse.cows || [],
            usersWithCowsResponse.usersWithCows || []
          );
        } else {
          setError(allUsersAndCowsResponse.message);
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      }

      setLoading(false);
    };

    fetchData();
  }, [setError]);

  const PaginationControls = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
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

  const calculateDashboardStats = (users, cows, usersWithCows) => {
    let assignedCowsCount = 0;
    const assignedCowIds = new Set();

    usersWithCows.forEach((farmer) => {
      if (Array.isArray(farmer.cows)) {
        farmer.cows.forEach((cow) => {
          assignedCowIds.add(cow.id);
        });
      }
    });

    assignedCowsCount = assignedCowIds.size;

    const breedCount = {};
    cows.forEach((cow) => {
      breedCount[cow.breed] = (breedCount[cow.breed] || 0) + 1;
    });

    const breedDistribution = Object.keys(breedCount).map((breed) => ({
      name: breed,
      value: breedCount[breed],
    }));

    const farmerDistribution = usersWithCows
      .map((farmer) => ({
        name: farmer.user.username,
        count: Array.isArray(farmer.cows) ? farmer.cows.length : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const genderCount = { Male: 0, Female: 0 };
    cows.forEach((cow) => {
      if (cow.gender === "Male" || cow.gender === "male") {
        genderCount.Male += 1;
      } else if (cow.gender === "Female" || cow.gender === "female") {
        genderCount.Female += 1;
      }
    });

    const genderDistribution = [
      { name: "Male", value: genderCount.Male },
      { name: "Female", value: genderCount.Female },
    ];

    setDashboardStats({
      totalFarmers: users.length,
      totalCows: cows.length,
      assignedCows: assignedCowsCount,
      unassignedCows: cows.length - assignedCowsCount,
      breedDistribution,
      farmerDistribution,
      genderDistribution,
    });
  };

  const handleAssignCows = async () => {
    if (!selectedFarmer || selectedCowIds.length === 0) {
      Swal.fire(
        "Error",
        "Please select a farmer and at least one cow.",
        "error"
      );
      return;
    }

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to assign ${selectedCowIds.length} cow(s) to the selected farmer?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, assign ${selectedCowIds.length} cow(s)!`,
    });

    if (confirmation.isConfirmed) {
      let successCount = 0;
      let errorCount = 0;

      // Show progress
      Swal.fire({
        title: "Assigning Cows...",
        text: `Processing ${selectedCowIds.length} cow(s)`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      for (const cowId of selectedCowIds) {
        try {
          // Use silent assignment for bulk operations, regular assignment for single
          const result =
            selectedCowIds.length > 1
              ? await assignCowToUserSilent(selectedFarmer, cowId)
              : await assignCowToUser(selectedFarmer, cowId);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      Swal.close();
      if (successCount > 0) {
        // Show bulk assignment summary only for multiple assignments
        if (selectedCowIds.length > 1) {
          if (errorCount === 0) {
            Swal.fire({
              icon: "success",
              title: "Bulk Assignment Successful",
              text: `Successfully assigned ${successCount} cow(s) to farmer.`,
            });
          } else if (successCount === 0) {
            Swal.fire({
              icon: "error",
              title: "Bulk Assignment Failed",
              text: `Failed to assign all ${errorCount} cow(s). Please try again.`,
            });
          } else {
            Swal.fire({
              icon: "warning",
              title: "Partial Assignment Success",
              text: `Successfully assigned: ${successCount} cow(s), Failed: ${errorCount} cow(s)`,
            });
          }
        }
        // For single assignment, alert is already handled by assignCowToUser function

        setShowModal(false);
        setSelectedCowIds([]);
        setSelectedFarmer(null);
        setCowSearchTerm("");
        setFarmerSearchTerm("");
        setBulkAssignMode(false); // Refresh data
        const response = await getUsersWithCows();
        if (response.success) {
          setUsersWithCows(response.usersWithCows || []);
          const allUsersAndCowsResponse = await getAllUsersAndAllCows();
          if (allUsersAndCowsResponse.success) {
            calculateDashboardStats(
              allUsersAndCowsResponse.users,
              allUsersAndCowsResponse.cows,
              response.usersWithCows
            );
          }
        }
      } else if (selectedCowIds.length > 1) {
        // Only show this error for bulk operations since single operations show their own alerts
        Swal.fire(
          "Error",
          "Failed to assign any cows. Please try again.",
          "error"
        );
      }
    }
  };

  const handleUnassignCow = async (farmerId, cowId) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unassign this cow from the farmer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unassign it!",
    });

    if (confirmation.isConfirmed) {
      const result = await unassignCowFromUser(farmerId, cowId);
      if (result.success) {
        Swal.fire(
          "Success",
          "Cow successfully unassigned from farmer!",
          "success"
        );

        const response = await getUsersWithCows();
        if (response.success) {
          setUsersWithCows(response.usersWithCows || []);
          const allUsersAndCowsResponse = await getAllUsersAndAllCows();
          if (allUsersAndCowsResponse.success) {
            calculateDashboardStats(
              allUsersAndCowsResponse.users,
              allUsersAndCowsResponse.cows,
              response.usersWithCows
            );
          }
        }
      } else {
        Swal.fire("Error", result.message, "error");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      {/* ...existing code for Card Header and Dashboard Stats... */}
      <Card className="shadow-lg border-0 rounded-lg mb-4">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4
              className="mb-0"
              style={{
                color: "#3D90D7",
                fontSize: "21px",
                fontFamily: "Roboto, Monospace",
                letterSpacing: "0.5px",
                marginRight: "20px",
              }}
            >
              <i className="fas fa-link me-2"></i>
              Cattle Distribution Dashboard
            </h4>
          </div>
          <p
            className="mt-2 mb-0"
            style={{
              fontSize: "14px",
              color: "#6c757d",
              fontFamily: "Roboto, sans-serif",
            }}
          >
            <i className="fas fa-info-circle me-2"></i>
            This page provides an overview of cattle distribution, including
            statistics, analytics, and tools to manage assignments between
            farmers and cattle.
          </p>
        </Card.Header>
        <Card.Body>
          {/* Dashboard Stats Cards */}
          <Row className="mb-4">
            {[
              {
                key: "totalFarmers",
                color: "primary",
                icon: "user-friends",
                label: "Total Farmers",
                description:
                  "The total number of farmers who are actively managing cattle in the system, providing insights into farmer participation.",
              },
              {
                key: "totalCows",
                color: "success",
                icon: "paw",
                label: "Total Cattle",
                description:
                  "The total count of cattle registered in the system, including both assigned and unassigned cattle.",
              },
              {
                key: "assignedCows",
                color: "info",
                icon: "link",
                label: "Assigned Cattle",
                description:
                  "The number of cattle that have been successfully assigned to farmers for management and care.",
              },
              {
                key: "unassignedCows",
                color: "warning text-light",
                icon: "unlink",
                label: "Unassigned Cattle",
                description: (
                  <span>
                    The count of cattle that are currently unassigned and
                    available for allocation to farmers.{" "}
                    <span
                      style={{
                        color: "#007bff",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Click to view details.
                    </span>
                  </span>
                ),
                onClick: handleShowUnassignedCattle,
              },
            ].map((stat) => (
              <Col md={3} key={stat.key}>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    stat.key === "unassignedCows" ? (
                      <Tooltip id={`tooltip-${stat.key}`}>
                        Click to view unassigned cattle
                      </Tooltip>
                    ) : (
                      <span></span>
                    )
                  }
                >
                  <Card
                    className="border-0 h-100"
                    style={{
                      backgroundColor: `rgba(${stat.colorRGB}, 0.8)`,
                      boxShadow:
                        "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
                      borderRadius: "19px",
                      cursor:
                        stat.key === "unassignedCows" ? "pointer" : "default",
                    }}
                    onClick={
                      stat.key === "unassignedCows"
                        ? handleShowUnassignedCattle
                        : null
                    }
                  >
                    <Card.Body className="text-center">
                      <div
                        className={`rounded-circle bg-${stat.color} bg-opacity-10 mx-auto d-flex align-items-center justify-content-center`}
                        style={{ width: "45px", height: "45px" }}
                      >
                        <i
                          className={`fas fa-${stat.icon} text-${stat.color}`}
                          style={{ fontSize: "21px" }}
                        ></i>
                      </div>
                      <h6
                        className="mt-3 mb-0"
                        style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          fontFamily: "Roboto, Monospace",
                          fontStyle: "italic",
                        }}
                      >
                        {dashboardStats[stat.key]}
                      </h6>
                      <small
                        className="text-muted"
                        style={{ fontSize: "15px" }}
                      >
                        {stat.label}
                      </small>
                      <p
                        className="mt-2 text-muted"
                        style={{
                          fontSize: "12px",
                          fontStyle: "italic",
                          lineHeight: "1.4",
                        }}
                      >
                        {stat.description}
                      </p>
                    </Card.Body>
                  </Card>
                </OverlayTrigger>
              </Col>
            ))}
          </Row>

          {/* Tabs for Charts and Table */}
          <Tabs
            defaultActiveKey="table"
            className="mb-3"
            fill
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Tab
              eventKey="table"
              title={
                <span
                  style={{
                    color: "#6c757d",
                    fontWeight: "normal",
                  }}
                >
                  <i className="fas fa-table me-2"></i>Distribution Table
                </span>
              }
            >
              <div className="d-flex justify-content-end mb-3">
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                  className="rounded-pill px-3 py-2"
                  style={{
                    fontSize: "14px",
                    letterSpacing: "1.0px",
                    fontWeight: "500",
                  }}
                  disabled={isSupervisor}
                  tabIndex={isSupervisor ? -1 : 0}
                  aria-disabled={isSupervisor}
                >
                  <i className="fas fa-plus me-2"></i>
                  Assign Cows
                </Button>
              </div>

              {/* ...existing table code... */}
              <div className="table-responsive rounded-3">
                <table className="table table-hover table-bordered mb-0">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8f9fa",
                        color: "#495057",
                        fontWeight: "600",
                        fontSize: "13px",
                        fontFamily: "Roboto, sans-serif",
                        letterSpacing: "0.9px",
                        textTransform: "capitalize",
                      }}
                    >
                      <th scope="col" className="text-center fw-medium">
                        #
                      </th>
                      <th scope="col" className="fw-medium">
                        Farmer Name
                      </th>
                      <th scope="col" className="fw-medium">
                        Cattle Managed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsersWithCows.length > 0 ? (
                      paginatedUsersWithCows.map((farmer, index) => (
                        <tr key={farmer.user.id}>
                          <td className="text-center text-muted">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle d-flex justify-content-center align-items-center me-2 bg-primary bg-opacity-10"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <i className="fas fa-user-circle text-primary"></i>
                              </div>
                              <div className="text-dark">
                                {farmer.user.username}
                              </div>
                            </div>
                          </td>
                          <td>
                            {Array.isArray(farmer.cows) &&
                            farmer.cows.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {farmer.cows.map((cow) => (
                                  <Badge
                                    key={cow.id}
                                    bg="info"
                                    className="d-flex align-items-center gap-1"
                                    style={{
                                      padding: "0.25rem 0.5rem",
                                      borderRadius: "12px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {cow.name} ({cow.breed})
                                    <OverlayTrigger
                                      overlay={<Tooltip>Unassign Cow</Tooltip>}
                                    >
                                      <span>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          className="p-0 d-flex align-items-center justify-content-center"
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "50%",
                                          }}
                                          onClick={() =>
                                            !isSupervisor &&
                                            handleUnassignCow(
                                              farmer.user.id,
                                              cow.id
                                            )
                                          }
                                          disabled={isSupervisor}
                                          tabIndex={isSupervisor ? -1 : 0}
                                          aria-disabled={isSupervisor}
                                        >
                                          <i
                                            className="fas fa-times"
                                            style={{ fontSize: "10px" }}
                                          ></i>
                                        </Button>
                                      </span>
                                    </OverlayTrigger>
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted fst-italic">
                                No cattle assigned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          <div className="text-muted">
                            <i className="fas fa-cow fs-3 d-block mb-2"></i>
                            No cattle distribution data available
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-3">
                  <PaginationControls />
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        usersWithCows.length
                      )}{" "}
                      of {usersWithCows.length} entries
                    </small>
                  </div>
                </div>
              </div>
            </Tab>

            {/* ...existing analytics tab... */}
            <Tab
              eventKey="charts"
              title={
                <span
                  style={{
                    color: "#6c757d",
                    fontWeight: "normal",
                  }}
                >
                  <i className="fas fa-chart-pie me-2"></i>Analytics
                </span>
              }
            >
              {/* Analytics content remains the same */}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Enhanced Modal for Bulk Cow Assignment */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedCowIds([]);
          setSelectedFarmer(null);
          setCowSearchTerm("");
          setFarmerSearchTerm("");
          setBulkAssignMode(false);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "18px",
              fontWeight: "500",
              letterSpacing: "0.5px",
              color: "#3D90D7",
            }}
          >
            <i className="fas fa-link me-2"></i>
            {bulkAssignMode
              ? "Bulk Assign Cows to Farmer"
              : "Assign Cow to Farmer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              fontSize: "14px",
              color: "#6c757d",
              fontFamily: "Roboto, sans-serif",
              marginBottom: "15px",
            }}
          >
            <i className="fas fa-info-circle me-2"></i>
            {bulkAssignMode
              ? "Select a farmer and multiple cows to assign them together. You can search, filter, and select multiple cows at once."
              : "Select a farmer and a cow to assign them together, or enable bulk mode for multiple assignments."}
          </div>

          <Form>
            {/* Mode Toggle */}
            <div className="mb-3">
              <Form.Check
                type="switch"
                id="bulk-mode-switch"
                label="Enable Bulk Assignment Mode"
                checked={bulkAssignMode}
                onChange={(e) => {
                  setBulkAssignMode(e.target.checked);
                  setSelectedCowIds([]);
                  setCowSearchTerm("");
                  setFarmerSearchTerm("");
                }}
                style={{ fontSize: "14px", fontWeight: "500" }}
              />
              <small className="text-muted">
                Toggle this to select multiple cows for assignment
              </small>
            </div>{" "}
            {/* Farmer Selection */}
            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#495057",
                }}
              >
                Select Farmer
              </Form.Label>

              {bulkAssignMode ? (
                // Search and dropdown for bulk mode
                <>
                  <InputGroup className="mb-2">
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search farmers by name..."
                      value={farmerSearchTerm}
                      onChange={(e) => setFarmerSearchTerm(e.target.value)}
                      style={{ fontSize: "14px" }}
                    />
                    {farmerSearchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => setFarmerSearchTerm("")}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </InputGroup>

                  <Form.Select
                    value={selectedFarmer || ""}
                    onChange={(e) => setSelectedFarmer(e.target.value)}
                    aria-label="Select a farmer to assign cows"
                    style={{
                      fontSize: "14px",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ced4da",
                    }}
                  >
                    <option value="">-- Select Farmer --</option>
                    {filteredFarmers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </Form.Select>
                  {farmerSearchTerm && filteredFarmers.length === 0 && (
                    <small className="text-muted mt-1 d-block">
                      No farmers found matching "{farmerSearchTerm}"
                    </small>
                  )}
                </>
              ) : (
                // Simple dropdown for single mode
                <Form.Select
                  value={selectedFarmer || ""}
                  onChange={(e) => setSelectedFarmer(e.target.value)}
                  aria-label="Select a farmer to assign cows"
                  style={{
                    fontSize: "14px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ced4da",
                  }}
                >
                  <option value="">-- Select Farmer --</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
            {/* Cow Selection */}
            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#495057",
                }}
              >
                {bulkAssignMode ? "Select Cows" : "Select Cow"}
                {selectedCowIds.length > 0 && (
                  <Badge bg="primary" className="ms-2">
                    {selectedCowIds.length} selected
                  </Badge>
                )}
              </Form.Label>

              {bulkAssignMode ? (
                <>
                  {/* Search and Quick Select Controls */}
                  <div className="mb-3">
                    <InputGroup className="mb-2">
                      <InputGroup.Text>
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search cows by name, breed, or gender..."
                        value={cowSearchTerm}
                        onChange={(e) => setCowSearchTerm(e.target.value)}
                        style={{ fontSize: "14px" }}
                      />
                      {cowSearchTerm && (
                        <Button
                          variant="outline-secondary"
                          onClick={() => setCowSearchTerm("")}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      )}
                    </InputGroup>

                    {/* Quick Select Buttons */}
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleSelectAllCows(true)}
                        disabled={filteredCows.length === 0}
                      >
                        <i className="fas fa-check-double me-1"></i>
                        Select All ({filteredCows.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={handleSelectUnassignedOnly}
                      >
                        <i className="fas fa-unlink me-1"></i>
                        Select Unassigned Only
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleSelectAllCows(false)}
                        disabled={selectedCowIds.length === 0}
                      >
                        <i className="fas fa-times me-1"></i>
                        Clear Selection
                      </Button>
                    </div>
                  </div>

                  {/* Cow List with Checkboxes */}
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid #ced4da",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    {filteredCows.length > 0 ? (
                      filteredCows.map((cow) => {
                        const managingFarmer = usersWithCows.find((farmer) =>
                          farmer.cows.some(
                            (assignedCow) => assignedCow.id === cow.id
                          )
                        );
                        const isSelected = selectedCowIds.includes(cow.id);

                        return (
                          <div
                            key={cow.id}
                            className={`d-flex align-items-center p-2 mb-1 rounded ${
                              isSelected
                                ? "bg-primary bg-opacity-10"
                                : "bg-light"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCowSelection(cow.id)}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCowSelection(cow.id)}
                              className="me-3"
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center">
                                <div
                                  className={`rounded-circle d-flex justify-content-center align-items-center me-2 ${
                                    cow.gender === "Female"
                                      ? "bg-success bg-opacity-10"
                                      : "bg-primary bg-opacity-10"
                                  }`}
                                  style={{ width: "24px", height: "24px" }}
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
                                    style={{ fontSize: "12px" }}
                                  ></i>
                                </div>
                                <div>
                                  <strong>{cow.name}</strong> ({cow.breed},{" "}
                                  {cow.gender})
                                  {managingFarmer && (
                                    <div className="text-muted small">
                                      Currently managed by:{" "}
                                      {managingFarmer.user.username}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {managingFarmer && (
                              <Badge bg="warning" text="dark">
                                Assigned
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted py-3">
                        <i className="fas fa-search fs-3 d-block mb-2"></i>
                        No cows found matching your search criteria
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Single Select Mode with Assignment Status
                <div>
                  <Form.Select
                    value={selectedCowIds[0] || ""}
                    onChange={(e) =>
                      setSelectedCowIds(e.target.value ? [e.target.value] : [])
                    }
                    aria-label="Select a cow to assign to the farmer"
                    style={{
                      fontSize: "14px",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ced4da",
                    }}
                  >
                    <option value="">-- Select Cow --</option>
                    {allCows.map((cow) => {
                      const managingFarmer = usersWithCows.find((farmer) =>
                        farmer.cows.some(
                          (assignedCow) => assignedCow.id === cow.id
                        )
                      );

                      return (
                        <option key={cow.id} value={cow.id}>
                          {cow.name} ({cow.breed}, {cow.gender}){" "}
                          {managingFarmer
                            ? `- Managed by ${managingFarmer.user.username}`
                            : "- Available"}
                        </option>
                      );
                    })}
                  </Form.Select>

                  {/* Show detailed assignment status for selected cow */}
                  {selectedCowIds[0] && (
                    <div
                      className="mt-3 p-3 rounded"
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      {(() => {
                        const selectedCow = allCows.find(
                          (cow) => cow.id === selectedCowIds[0]
                        );
                        const managingFarmer = usersWithCows.find((farmer) =>
                          farmer.cows.some(
                            (assignedCow) =>
                              assignedCow.id === selectedCowIds[0]
                          )
                        );

                        if (!selectedCow) return null;

                        return (
                          <div>
                            <h6
                              className="mb-2"
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#495057",
                              }}
                            >
                              <i className="fas fa-info-circle me-2"></i>Cow
                              Assignment Status
                            </h6>
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className={`rounded-circle d-flex justify-content-center align-items-center me-3 ${
                                  selectedCow.gender === "Female"
                                    ? "bg-success bg-opacity-10"
                                    : "bg-primary bg-opacity-10"
                                }`}
                                style={{ width: "32px", height: "32px" }}
                              >
                                <i
                                  className={`fas ${
                                    selectedCow.gender === "Female"
                                      ? "fa-venus"
                                      : "fa-mars"
                                  } ${
                                    selectedCow.gender === "Female"
                                      ? "text-success"
                                      : "text-primary"
                                  }`}
                                ></i>
                              </div>
                              <div>
                                <strong>{selectedCow.name}</strong> (
                                {selectedCow.breed})
                              </div>
                            </div>
                            {managingFarmer ? (
                              <div className="d-flex align-items-center">
                                <Badge
                                  bg="warning"
                                  text="dark"
                                  className="me-2"
                                >
                                  Currently Assigned
                                </Badge>
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "13px" }}
                                >
                                  Managed by:{" "}
                                  <strong>
                                    {managingFarmer.user.username}
                                  </strong>
                                </span>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center">
                                <Badge bg="success" className="me-2">
                                  Available
                                </Badge>
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "13px" }}
                                >
                                  This cow is not assigned to any farmer
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setSelectedCowIds([]);
              setSelectedFarmer(null);
              setCowSearchTerm("");
              setFarmerSearchTerm("");
              setBulkAssignMode(false);
            }}
            className="rounded-pill px-4"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "#6c757d",
              border: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignCows}
            className="rounded-pill px-4"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "primary",
              border: "none",
            }}
            disabled={!selectedFarmer || selectedCowIds.length === 0}
          >
            {bulkAssignMode
              ? `Assign ${selectedCowIds.length} Cow(s)`
              : "Assign Cow"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ...existing unassigned cattle modal... */}
      <Modal
        show={showUnassignedModal}
        onHide={() => setShowUnassignedModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "17px",
              fontWeight: "300",
              letterSpacing: "1.4px",
            }}
          >
            <i className="fas fa-paw me-2 "></i> Unassigned Cattle
          </Modal.Title>
        </Modal.Header>
        <div
          style={{
            fontSize: "14px",
            color: "#6c757d",
            fontFamily: "Roboto, sans-serif",
            marginTop: "5px",
            padding: "0 15px",
          }}
        >
          <i className="fas fa-info-circle me-2"></i>
          View and manage cattle that are currently unassigned to any farmer.
        </div>
        <Modal.Body>
          {unassignedCattle.length > 0 ? (
            <div className="table-responsive rounded-3 shadow-sm">
              <table className="table table-hover table-bordered mb-0">
                <thead className="bg-light text-muted">
                  <tr>
                    <th scope="col" className="text-center fw-medium">
                      #
                    </th>
                    <th scope="col" className="fw-medium">
                      Name
                    </th>
                    <th scope="col" className="fw-medium">
                      Breed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedCattle.map((cow, index) => (
                    <tr key={cow.id} className="align-middle">
                      <td className="text-center text-muted">{index + 1}</td>
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
                                cow.gender === "Female" ? "fa-venus" : "fa-mars"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-cow fs-3 text-muted mb-2"></i>
              <p className="text-muted">No unassigned cattle available.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUnassignedModal(false)}
            className="rounded-pill px-4"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CattleDistribution;
