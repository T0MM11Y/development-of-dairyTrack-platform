import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  getUsersWithCows,
  assignCowToUser,
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
  const [selectedCowId, setSelectedCowId] = useState(null);
  const [showUnassignedModal, setShowUnassignedModal] = useState(false);
  const [unassignedCattle, setUnassignedCattle] = useState([]);
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
  const [itemsPerPage] = useState(6); // Jumlah item per halaman

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
  // Tambahkan: Ambil user yang sedang login
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isSupervisor = currentUser?.role_id === 2;

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

          // Calculate statistics for dashboard
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
  }, [setError]); // Tambahkan setError ke array dependensi
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
    // Count assigned cows
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

    // Calculate breed distribution
    const breedCount = {};
    cows.forEach((cow) => {
      breedCount[cow.breed] = (breedCount[cow.breed] || 0) + 1;
    });

    const breedDistribution = Object.keys(breedCount).map((breed) => ({
      name: breed,
      value: breedCount[breed],
    }));

    // Calculate farmer distribution (how many cows each farmer has)
    const farmerDistribution = usersWithCows
      .map((farmer) => ({
        name: farmer.user.username,
        count: Array.isArray(farmer.cows) ? farmer.cows.length : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate gender distribution
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

  const handleAssignCow = async () => {
    if (!selectedFarmer || !selectedCowId) {
      Swal.fire("Error", "Please select a farmer and a cow.", "error");
      return;
    }

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to assign this cow to the selected farmer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, assign it!",
    });

    if (confirmation.isConfirmed) {
      const result = await assignCowToUser(selectedFarmer, selectedCowId);
      if (result.success) {
        Swal.fire("Success", "Cow successfully assigned to farmer!", "success");
        setShowModal(false);
        setSelectedCowId(null);
        setSelectedFarmer(null);

        // Refresh data
        const response = await getUsersWithCows();
        if (response.success) {
          setUsersWithCows(response.usersWithCows || []);
          // Recalculate dashboard stats
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

        // Refresh data
        const response = await getUsersWithCows();
        if (response.success) {
          setUsersWithCows(response.usersWithCows || []);
          // Recalculate dashboard stats
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
            {" "}
            <Tab
              eventKey="table"
              title={
                <span
                  style={{
                    color: "#6c757d", // Abu-abu jika aktif, abu-abu jika tidak
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
                  Assign Cow
                </Button>
              </div>
              <div className="table-responsive rounded-3">
                <table className="table table-hover table-bordered mb-0">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8f9fa", // Warna latar belakang header
                        color: "#495057", // Warna teks header
                        fontWeight: "600", // Ketebalan font
                        fontSize: "13px", // Ukuran font
                        fontFamily: "Roboto, sans-serif", // Font family
                        letterSpacing: "0.9px", // Jarak antar huruf
                        textTransform: "capitalize", // Huruf kapital
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
                                      padding: "0.25rem 0.5rem", // Mengurangi padding
                                      borderRadius: "12px", // Mengurangi radius
                                      fontSize: "12px", // Mengurangi ukuran font
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
              <Row>
                {/* Breed Distribution Information */}
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Breed Information</h5>
                      <p
                        className="text-muted mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fas fa-info-circle me-2"></i>
                        Detailed information about the Girolando breed.
                      </p>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-column align-items-start">
                        <h6 className="text-primary mb-2">Girolando Breed</h6>
                        <p
                          className="text-muted"
                          style={{ fontSize: "14px", lineHeight: "1.6" }}
                        >
                          The Girolando is a hybrid breed developed in Brazil by
                          crossing Gir cattle, known for their heat tolerance
                          and milk production, with Holstein cattle, renowned
                          for their high milk yield. This breed is highly
                          adaptable to tropical climates and is widely used in
                          dairy farming due to its excellent productivity and
                          resilience.
                        </p>
                        <p
                          className="text-muted"
                          style={{ fontSize: "14px", lineHeight: "1.6" }}
                        >
                          Girolando cattle are known for their ability to
                          produce high-quality milk even in challenging
                          environmental conditions, making them a preferred
                          choice for farmers in tropical regions. They are
                          particularly valued for their balance of milk yield
                          and adaptability.
                        </p>
                        <p
                          className="text-muted"
                          style={{ fontSize: "14px", lineHeight: "1.6" }}
                        >
                          For more information about the Girolando breed, you
                          can visit the following resources:
                        </p>
                        <ul
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.6",
                            paddingLeft: "20px",
                          }}
                        >
                          <li>
                            <a
                              href="https://en.wikipedia.org/wiki/Girolando"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#007bff",
                                textDecoration: "none",
                              }}
                            >
                              Wikipedia: Girolando Breed
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://www.fao.org/dairy-production-products/girolando/en/"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#007bff",
                                textDecoration: "none",
                              }}
                            >
                              FAO: Girolando Cattle Overview
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://www.brazilianbeef.org.br/girolando"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#007bff",
                                textDecoration: "none",
                              }}
                            >
                              Brazilian Beef: Girolando Breed Characteristics
                            </a>
                          </li>
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Gender Distribution Chart */}
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Gender Distribution</h5>
                      <p
                        className="text-muted mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fas fa-info-circle me-2"></i>
                        Breakdown of cattle by gender, highlighting male and
                        female proportions.
                      </p>
                    </Card.Header>
                    <Card.Body>
                      {dashboardStats.genderDistribution.some(
                        (item) => item.value > 0
                      ) ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={dashboardStats.genderDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              <Cell fill="#0088FE" />
                              <Cell fill="#00C49F" />
                            </Pie>
                            <Legend />
                            <RechartsTooltip
                              formatter={(value, name) => [
                                `${value} cattle`,
                                `Gender: ${name}`,
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <p className="text-muted">No gender data available</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Farmer Distribution Chart */}
                <Col lg={12}>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Farmer Cattle Management</h5>
                      <p
                        className="text-muted mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fas fa-info-circle me-2"></i>
                        Overview of how many cattle each farmer is managing.
                      </p>
                    </Card.Header>
                    <Card.Body>
                      {dashboardStats.farmerDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={dashboardStats.farmerDistribution}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              interval={0}
                            />
                            <YAxis
                              label={{
                                value: "Number of Cattle",
                                angle: -90,
                                position: "insideLeft",
                              }}
                              allowDecimals={false}
                            />
                            <RechartsTooltip
                              formatter={(value) => [`${value} cattle`]}
                            />
                            <Legend />
                            <Bar
                              dataKey="count"
                              name="Number of Cattle"
                              fill="#8884d8"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ height: "300px" }}
                        >
                          <p className="text-muted">
                            No farmer distribution data available
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
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
      {/* Modal for Assigning Cow */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
            <i className="fas fa-link me-2"></i> Assign Cow to Farmer
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
            Select a farmer and a cow to assign them together.
          </div>
          <Form>
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
              <Form.Select
                value={selectedFarmer || ""}
                onChange={(e) => setSelectedFarmer(e.target.value)}
                aria-label="Select a farmer to assign a cow"
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
                Select Cow
              </Form.Label>
              <Form.Select
                value={selectedCowId || ""}
                onChange={(e) => setSelectedCowId(e.target.value)}
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
                  // Find the farmer managing this cow
                  const managingFarmer = usersWithCows.find((farmer) =>
                    farmer.cows.some((assignedCow) => assignedCow.id === cow.id)
                  );

                  return (
                    <option key={cow.id} value={cow.id}>
                      {cow.name} ({cow.breed}, {cow.gender}){" "}
                      {managingFarmer
                        ? `- Managed by ${managingFarmer.user.username}`
                        : ""}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="rounded-pill px-4"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "#6c757d",
              border: "none",
            }}
            aria-label="Cancel assigning cow"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignCow}
            className="rounded-pill px-4"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "primary",
              border: "none",
            }}
            aria-label="Confirm assigning cow to farmer"
          >
            Assign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CattleDistribution;
