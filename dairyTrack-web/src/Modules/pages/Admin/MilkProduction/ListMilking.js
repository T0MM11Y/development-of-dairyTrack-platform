import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { listCows } from "../../../../Modules/controllers/cowsController";
import { listCowsByUser } from "../../../../Modules/controllers/cattleDistributionController";
import { getAllFarmers } from "../../../../Modules/controllers/usersController";

import {
  Button,
  Card,
  Form,
  FormControl,
  InputGroup,
  Modal,
  OverlayTrigger,
  Spinner,
  Tooltip,
  Badge,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import {
  getMilkingSessions,
  addMilkingSession,
  exportMilkProductionToPDF,
  exportMilkProductionToExcel,
  editMilkingSession,
  deleteMilkingSession, // Add this import
} from "../../../../Modules/controllers/milkProductionController";

const ListMilking = () => {
  // Get current logged in user
  const [currentUser, setCurrentUser] = useState(null);
  const [cowList, setCowList] = useState([]);

  // State management
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userManagedCows, setUserManagedCows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [farmers, setFarmers] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSession, setNewSession] = useState({
    cow_id: "",
    milker_id: "",
    volume: "",
    milking_time: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [selectedCow, setSelectedCow] = useState("");
  const [selectedMilker, setSelectedMilker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const sessionsPerPage = 8;
  // Add near other state declarations
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSession, setViewSession] = useState(null);
  // Add this near other useEffect hooks
  useEffect(() => {
    const fetchUserManagedCows = async () => {
      if (currentUser?.user_id) {
        try {
          const { success, cows } = await listCowsByUser(currentUser.user_id);
          if (success && cows) {
            setUserManagedCows(cows);
          }
        } catch (err) {
          console.error("Error fetching user's cows:", err);
        }
      }
    };

    fetchUserManagedCows();
  }, [currentUser]);

  // Add this after getting user data from localStorage in useEffect
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setCurrentUser(userData);
        // Add console.log here
        console.log("Logged in user role_id:", userData.role_id);
        console.log("Current User Data:", userData);

        setNewSession((prev) => ({
          ...prev,
          milker_id: userData.user_id || userData.id || "",
        }));
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);
  // Add this useEffect after other useEffects
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await getAllFarmers();
        if (response.success) {
          setFarmers(response.farmers || []);
        } else {
          console.error("Error fetching farmers:", response.message);
        }
      } catch (err) {
        console.error("Error fetching farmers:", err);
      }
    };

    if (currentUser?.role_id === 1) {
      fetchFarmers();
    }
  }, [currentUser]);
  useEffect(() => {
    const fetchCows = async () => {
      try {
        const { success, cows } = await listCows();
        if (success) {
          setCowList(cows || []);
        }
      } catch (err) {
        console.error("Error fetching cows:", err);
      }
    };

    fetchCows();
  }, []);

  // Get user from localStorage when component mounts
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setCurrentUser(userData);
        // Pre-fill milker_id with current user's ID in the new session form
        setNewSession((prev) => ({
          ...prev,
          milker_id: userData.user_id || userData.id || "",
        }));
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);

  // Fetch milking sessions
  useEffect(() => {
    const fetchMilkingSessions = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay
      try {
        const response = await getMilkingSessions();
        if (response.success && response.sessions) {
          setSessions(response.sessions);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch milking sessions.");
          console.error(
            "Error fetching sessions:",
            response.message || "Unknown error"
          );
          setSessions([]);
        }
      } catch (err) {
        setError(
          "An unexpected error occurred while fetching milking sessions."
        );
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMilkingSessions();
  }, []);
  const milkingTimeInfo = {
    Morning:
      "Milking session conducted in the morning (before 12 PM), typically yields higher milk volume.",
    Afternoon:
      "Milking session during afternoon hours (12 PM - 6 PM), moderate milk production.",
    Evening:
      "Evening milking session (after 6 PM), usually the last session of the day.",
  };

  const openViewModal = (session) => {
    setViewSession({
      ...session,
      milking_time: new Date(session.milking_time).toISOString().slice(0, 16),
    });
    setShowViewModal(true);
  };

  // Generate unique lists of cows and milkers for filtering
  const { uniqueCows, uniqueMilkers } = useMemo(() => {
    const cows = [...new Set(sessions.map((session) => session.cow_id))]
      .filter(Boolean)
      .map((id) => ({
        id,
        name: sessions.find((s) => s.cow_id === id)?.cow_name || `Cow #${id}`,
      }));

    const milkers = [...new Set(sessions.map((session) => session.milker_id))]
      .filter(Boolean)
      .map((id) => ({
        id,
        name:
          sessions.find((s) => s.milker_id === id)?.milker_name ||
          `Milker #${id}`,
      }));

    return {
      uniqueCows: cows,
      uniqueMilkers: milkers,
    };
  }, [sessions]);

  const handleDeleteSession = async (sessionId) => {
    try {
      const response = await deleteMilkingSession(sessionId);
      if (response.success) {
        // Refresh the sessions list after successful deletion
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Function to prepare modal for adding new session
  const handleOpenAddModal = () => {
    // Ensure the milker_id is set to the current user's ID and time is set to now
    if (currentUser) {
      setNewSession((prev) => ({
        ...prev,
        milker_id: currentUser.user_id || currentUser.id || "",
        milking_time: new Date().toISOString().slice(0, 16), // Always use current time
      }));
    } else {
      // If no user, still update the time
      setNewSession((prev) => ({
        ...prev,
        milking_time: new Date().toISOString().slice(0, 16),
      }));
    }
    setShowAddModal(true);
  };

  // Calculate milk statistics
  const milkStats = useMemo(() => {
    const totalVolume = sessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );
    const totalSessions = sessions.length;

    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Calculate sessions from today
    const todaySessions = sessions.filter((session) =>
      session.milking_time?.startsWith(today)
    );

    const todayVolume = todaySessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    return {
      totalVolume: totalVolume.toFixed(2),
      totalSessions,
      todayVolume: todayVolume.toFixed(2),
      todaySessions: todaySessions.length,
      avgVolumePerSession: totalSessions
        ? (totalVolume / totalSessions).toFixed(2)
        : "0.00",
    };
  }, [sessions]);

  // Filter, sort and paginate sessions
  const filteredAndPaginatedSessions = useMemo(() => {
    // First, filter sessions
    let filtered = sessions.filter((session) => {
      const matchesSearch =
        (session.cow_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (session.milker_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        String(session.volume).includes(searchTerm);

      const matchesCow = selectedCow
        ? String(session.cow_id) === selectedCow
        : true;
      const matchesMilker = selectedMilker
        ? String(session.milker_id) === selectedMilker
        : true;
      const matchesDate = selectedDate
        ? session.milking_time?.startsWith(selectedDate)
        : true;

      return matchesSearch && matchesCow && matchesMilker && matchesDate;
    });

    // Sort by milking time, most recent first
    filtered = [...filtered].sort(
      (a, b) => new Date(b.milking_time) - new Date(a.milking_time)
    );

    // Calculate pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / sessionsPerPage);

    // Get current page items
    const startIndex = (currentPage - 1) * sessionsPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + sessionsPerPage
    );

    return {
      filteredSessions: filtered,
      currentSessions: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [
    sessions,
    searchTerm,
    selectedCow,
    selectedMilker,
    selectedDate,
    currentPage,
    sessionsPerPage,
  ]);

  // Handle adding a new milking session
  const handleAddSession = async (e) => {
    e.preventDefault();

    // Convert volume to number
    const sessionData = {
      ...newSession,
      volume: parseFloat(newSession.volume),
    };

    try {
      const response = await addMilkingSession(sessionData);

      if (response.success) {
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Milking session added successfully!",
          timer: 3000,
          showConfirmButton: false,
        });

        // Refresh the sessions list
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }

        setShowAddModal(false);
        // Reset with current user ID and current time
        setNewSession({
          cow_id: "",
          milker_id: currentUser
            ? currentUser.user_id || currentUser.id || ""
            : "",
          volume: "",
          milking_time: new Date().toISOString().slice(0, 16),
          notes: "",
        });
      } else {
        // Show error message
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add milking session",
        });
      }
    } catch (error) {
      console.error("Error adding milking session:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while adding the milking session.",
      });
    }
  };

  const handleEditSession = async (e) => {
    e.preventDefault();
    try {
      const response = await editMilkingSession(
        selectedSession.id,
        selectedSession
      );

      if (response.success) {
        setShowEditModal(false);
        // Refresh sessions list
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }
        setSelectedSession(null);
      }
    } catch (error) {
      console.error("Error editing session:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to edit milking session",
      });
    }
  };

  const handleExportToPDF = async () => {
    await exportMilkProductionToPDF();
  };

  const handleExportToExcel = async () => {
    await exportMilkProductionToExcel();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openEditModal = (session) => {
    setSelectedSession({
      ...session,
      cow_id: String(session.cow_id), // Konversi ke string
      milking_time: new Date(session.milking_time).toISOString().slice(0, 16),
    });
    setShowEditModal(true);
  };

  // Format milking time based on time of day
  const getMilkingTimeLabel = (timeStr) => {
    const date = new Date(timeStr);
    const hours = date.getHours();

    let timeLabel = format(date, "HH:mm");
    let periodBadge;

    if (hours < 12) {
      periodBadge = (
        <Badge bg="warning" className="ms-2">
          Morning
        </Badge>
      );
    } else if (hours < 18) {
      periodBadge = (
        <Badge bg="info" className="ms-2">
          Afternoon
        </Badge>
      );
    } else {
      periodBadge = (
        <Badge bg="secondary" className="ms-2">
          Evening
        </Badge>
      );
    }

    return (
      <>
        {timeLabel} {periodBadge}
      </>
    );
  };

  // Render loading spinner
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

  // Render error message
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
            <i className="fas fa-cow me-2" /> Milk Production Management
          </h4>
        </Card.Header>
        <Card.Body className="border-bottom">
          <div className="mb-3">
            <h6 className="text-muted mb-2">
              <i className="fas fa-info-circle me-1"></i>
              Milking Time Information
            </h6>
            <div className="row g-2">
              {Object.entries(milkingTimeInfo).map(([period, description]) => {
                const periodColors = {
                  Morning: "#fff3cd", // Light yellow for morning
                  Afternoon: "#d1ecf1", // Light blue for afternoon
                  Evening: "#f8d7da", // Light red for evening
                };

                return (
                  <div className="col-md-4" key={period}>
                    <div
                      className="p-2 border rounded"
                      style={{
                        backgroundColor: periodColors[period] || "#f8f9fa",
                        borderLeft: `4px solid ${
                          periodColors[period]?.replace("f", "c") || "#0d6efd"
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
                        {period} Session
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
              })}
            </div>
          </div>
        </Card.Body>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button
                variant="primary shadow-sm opacity-35"
                onClick={handleOpenAddModal}
                style={{
                  opacity: 0.98,
                  letterSpacing: "1.3px",
                  fontWeight: "600",
                  fontSize: "0.8rem",
                }}
              >
                <i className="fas fa-plus me-2" /> Add Milking Session
              </Button>
            </div>

            <div className="d-flex gap-2">
              <OverlayTrigger overlay={<Tooltip>Export to PDF</Tooltip>}>
                <Button
                  variant="danger shadow-sm opacity-35"
                  onClick={handleExportToPDF}
                >
                  <i className="fas fa-file-pdf me-2" /> PDF
                </Button>
              </OverlayTrigger>

              <OverlayTrigger overlay={<Tooltip>Export to Excel</Tooltip>}>
                <Button
                  variant="success shadow-sm opacity-35"
                  onClick={handleExportToExcel}
                >
                  <i className="fas fa-file-excel me-2" /> Excel
                </Button>
              </OverlayTrigger>
            </div>
          </div>
          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">Total Sessions</h6>
                      <h2 className="mt-2 mb-0">{milkStats.totalSessions}</h2>
                    </div>
                    <div>
                      <i className="fas fa-calendar-check fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white mb-3 shadow-sm opacity-75">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">Total Volume</h6>
                      <h2 className="mt-2 mb-0">{milkStats.totalVolume} L</h2>
                    </div>
                    <div>
                      <i className="fas fa-fill-drip fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-info text-white mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">Today's Volume</h6>
                      <h2 className="mt-2 mb-0">{milkStats.todayVolume} L</h2>
                    </div>
                    <div>
                      <i className="fas fa-glass fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-dark mb-3 shadow-sm opacity-75">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">Avg Volume/Session</h6>
                      <h2 className="mt-2 mb-0">
                        {milkStats.avgVolumePerSession} L
                      </h2>
                    </div>
                    <div>
                      <i className="fas fa-chart-line fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search and Filters */}
          <Row className="mb-4">
            <Col md={6} lg={4}>
              <InputGroup className="shadow-sm mb-3">
                <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
                  <i className="fas fa-search" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by cow, milker, etc..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-x-lg" />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} lg={3}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={selectedCow}
                  onChange={(e) => {
                    setSelectedCow(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Filter by Cow</option>
                  {uniqueCows.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={selectedMilker}
                  onChange={(e) => {
                    setSelectedMilker(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Filter by Milker</option>
                  {uniqueMilkers.map((milker) => (
                    <option key={milker.id} value={milker.id}>
                      {milker.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={2}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by Date"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Milking Sessions Table */}
          <div className="table-responsive">
            <table
              className="table table-hover border rounded shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <thead className="bg-gradient-light">
                <tr
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: "0.4px",
                  }}
                >
                  <th
                    className="py-3 text-center"
                    style={{
                      width: "5%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                    }}
                  >
                    #
                  </th>
                  <th
                    className="py-3"
                    style={{
                      width: "15%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                      color: "#444",
                    }}
                  >
                    Cow
                  </th>
                  <th
                    className="py-3"
                    style={{
                      width: "12%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                      color: "#444",
                    }}
                  >
                    Milker
                  </th>
                  <th
                    className="py-3"
                    style={{
                      width: "10%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                      color: "#444",
                    }}
                  >
                    Volume (L)
                  </th>
                  <th
                    className="py-3"
                    style={{
                      width: "18%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                      color: "#444",
                    }}
                  >
                    Milking Time
                  </th>
                  <th
                    className="py-3"
                    style={{
                      width: "25%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                      color: "#444",
                    }}
                  >
                    Notes
                  </th>
                  <th
                    className="py-3 text-center"
                    style={{
                      width: "15%",
                      fontWeight: "550",
                      fontSize: "0.95rem",
                      color: "#444",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndPaginatedSessions.currentSessions.map(
                  (session, index) => (
                    <tr
                      key={session.id}
                      className="align-middle"
                      style={{ transition: "all 0.2s" }}
                    >
                      <td className="fw-bold text-center">
                        {(currentPage - 1) * sessionsPerPage + index + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Badge
                            bg="info"
                            pill
                            className="me-1 px-1 py-1"
                            style={{ letterSpacing: "0.5px" }}
                          >
                            ID : {session.cow_id}
                          </Badge>
                          <span
                            className="fw-medium"
                            style={{ letterSpacing: "0.3px" }}
                          >
                            {session.cow_name || `-`}
                          </span>
                        </div>
                      </td>
                      <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                        {session.milker_name || `-`}
                      </td>
                      <td>
                        <Badge
                          bg="success text-white shadow-sm opacity-75"
                          className="px-1 py-1"
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            letterSpacing: "0.8px",
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          {parseFloat(session.volume).toFixed(2)} L
                        </Badge>
                      </td>
                      <td>
                        <div
                          style={{
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span className="fw-bold">
                            {format(
                              new Date(session.milking_time),
                              "yyyy-MM-dd"
                            )}
                          </span>{" "}
                          {getMilkingTimeLabel(session.milking_time)}
                        </div>
                      </td>
                      <td>
                        {session.notes ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                              >
                                {session.notes}
                              </Tooltip>
                            }
                          >
                            <span
                              className="text-truncate d-inline-block fst-italic"
                              style={{
                                maxWidth: "400px",
                                letterSpacing: "0.2px",
                                color: "#555",
                                fontSize: "0.9rem",
                                borderLeft: "3px solid #eaeaea",
                                paddingLeft: "8px",
                              }}
                            >
                              {session.notes}
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-muted fst-italic">
                            No notes provided
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit Session</Tooltip>}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="d-flex align-items-center justify-content-center shadow-sm"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                transition: "all 0.2s",
                              }}
                              onClick={() => openEditModal(session)}
                            >
                              <i className="fas fa-edit" />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>View Details</Tooltip>}
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="d-flex align-items-center justify-content-center shadow-sm"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                transition: "all 0.2s",
                              }}
                              onClick={() => openViewModal(session)}
                            >
                              <i className="fas fa-eye" />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete Session</Tooltip>}
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="d-flex align-items-center justify-content-center shadow-sm"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                transition: "all 0.2s",
                              }}
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <i className="fas fa-trash-alt" />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredAndPaginatedSessions.totalItems === 0 && (
            <div
              className="text-center py-5 my-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
              <p
                className="lead text-muted"
                style={{ letterSpacing: "0.5px", fontWeight: "500" }}
              >
                No milking sessions found matching your criteria.
              </p>
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCow("");
                  setSelectedMilker("");
                  setSelectedDate("");
                }}
                style={{ letterSpacing: "0.5px" }}
              >
                <i className="fas fa-sync-alt me-2"></i> Reset Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredAndPaginatedSessions.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {(currentPage - 1) * sessionsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * sessionsPerPage,
                  filteredAndPaginatedSessions.totalItems
                )}{" "}
                of {filteredAndPaginatedSessions.totalItems} entries
              </div>

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

                  {[
                    ...Array(filteredAndPaginatedSessions.totalPages).keys(),
                  ].map((page) => {
                    const pageNumber = page + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === filteredAndPaginatedSessions.totalPages ||
                      (pageNumber >= currentPage - 1 &&
                        pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <li key={pageNumber} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}

                  <li
                    className={`page-item ${
                      currentPage === filteredAndPaginatedSessions.totalPages
                        ? "disabled"
                        : ""
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
                      currentPage === filteredAndPaginatedSessions.totalPages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handlePageChange(
                          filteredAndPaginatedSessions.totalPages
                        )
                      }
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* View Milking Session Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "1.5rem",
              letterSpacing: "0.5px",
            }}
          >
            <i className="fas fa-eye me-2 text-info"></i>
            View Milking Session Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewSession && (
            <div className="p-3">
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2 section-title">
                    Cow Information
                  </h6>
                  <div className="info-section border-start ps-3">
                    <p className="detail-row">
                      <span className="label">Cow ID:</span>
                      <span className="value">{viewSession.cow_id}</span>
                    </p>
                    <p className="detail-row">
                      <span className="label">Cow Name:</span>
                      <span className="value">
                        {viewSession.cow_name || "N/A"}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2 section-title">
                    Milker Information
                  </h6>
                  <div className="info-section border-start ps-3">
                    <p className="detail-row">
                      <span className="label">Milker ID:</span>
                      <span className="value">{viewSession.milker_id}</span>
                    </p>
                    <p className="detail-row">
                      <span className="label">Milker Name:</span>
                      <span className="value">
                        {viewSession.milker_name || "N/A"}
                      </span>
                    </p>
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2 section-title">
                    Milking Details
                  </h6>
                  <div className="info-section border-start ps-3">
                    <p className="detail-row">
                      <span className="label">Volume:</span>
                      <Badge
                        bg="success"
                        className="px-2 ms-2"
                        style={{
                          fontSize: "0.9rem",
                          letterSpacing: "0.5px",
                          fontFamily: "'Roboto Mono', monospace",
                        }}
                      >
                        {parseFloat(viewSession.volume).toFixed(2)} L
                      </Badge>
                    </p>
                    <p className="detail-row">
                      <span className="label">Date:</span>
                      <span className="value">
                        {format(
                          new Date(viewSession.milking_time),
                          "yyyy-MM-dd"
                        )}
                      </span>
                    </p>
                    <p className="detail-row">
                      <span className="label">Time:</span>
                      <span className="value">
                        {getMilkingTimeLabel(viewSession.milking_time)}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2 section-title">
                    Additional Information
                  </h6>
                  <div className="info-section border-start ps-3">
                    <p className="detail-row">
                      <span className="label">Notes:</span>
                    </p>
                    <p className="notes-text fst-italic text-muted">
                      {viewSession.notes || "No notes provided"}
                    </p>
                  </div>
                </Col>
              </Row>

              <style jsx>{`
                .section-title {
                  font-family: "Nunito", sans-serif;
                  font-size: 1rem;
                  letter-spacing: 0.3px;
                  font-weight: 600;
                }

                .info-section {
                  border-left: 3px solid #eaeaea;
                }

                .detail-row {
                  margin-bottom: 0.5rem;
                  font-family: "Roboto", sans-serif;
                  font-size: 0.95rem;
                  letter-spacing: 0.2px;
                }

                .label {
                  color: #666;
                  min-width: 100px;
                  display: inline-block;
                  position: relative;
                  margin-right: 8px;
                }

                .label::after {
                  content: ":";
                  position: absolute;
                  right: 0;
                }

                .value {
                  color: #333;
                }

                .notes-text {
                  font-family: "Nunito", sans-serif;
                  font-size: 0.9rem;
                  letter-spacing: 0.2px;
                  color: #666;
                }
              `}</style>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "0.9rem",
              letterSpacing: "0.5px",
              fontWeight: "500",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Add Milking Session Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="fas fa-plus-circle me-2 text-primary"></i>
            Add New Milking Session
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSession}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cow</Form.Label>
                  <Form.Select
                    value={newSession.cow_id}
                    onChange={(e) =>
                      setNewSession({ ...newSession, cow_id: e.target.value })
                    }
                    required
                    className="shadow-sm border-primary"
                  >
                    <option value="">-- Select Cow --</option>
                    {/* If admin (role_id === 1), show all cows, else show only managed cows */}
                    {(currentUser?.role_id === 1 ? cowList : userManagedCows)
                      .filter((cow) => cow.gender?.toLowerCase() === "female")
                      .map((cow) => (
                        <option key={cow.id} value={cow.id}>
                          {cow.name} (ID: {cow.id}) -{" "}
                          {cow.lactation_phase || "Unknown"}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {currentUser?.role_id === 1
                      ? "Select any female cow from the herd"
                      : "Select from your managed female cows"}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Milker</Form.Label>
                  {currentUser?.role_id === 1 ? (
                    <>
                      <Form.Select
                        value={newSession.milker_id}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            milker_id: e.target.value,
                          })
                        }
                        required
                        className="shadow-sm"
                      >
                        <option value="">-- Select Milker --</option>
                        {farmers.map((farmer) => (
                          <option key={farmer.user_id} value={farmer.user_id}>
                            {farmer.name} (ID: {farmer.user_id})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Select the farmer who performed the milking
                      </Form.Text>
                    </>
                  ) : (
                    <>
                      <Form.Control
                        type="text"
                        value={
                          currentUser
                            ? `${currentUser.name} (ID: ${currentUser.user_id})`
                            : ""
                        }
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Recording as current logged-in user
                      </Form.Text>
                      <Form.Control
                        type="hidden"
                        value={newSession.milker_id}
                      />
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Volume (Liters)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter milk volume in liters"
                    value={newSession.volume}
                    onChange={(e) =>
                      setNewSession({ ...newSession, volume: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Milking Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newSession.milking_time}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        milking_time: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter any notes about this milking session"
                value={newSession.notes}
                onChange={(e) =>
                  setNewSession({ ...newSession, notes: e.target.value })
                }
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Milking Session
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Milking Session Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="fas fa-edit me-2 text-primary"></i>
            Edit Milking Session
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSession && (
            <Form onSubmit={handleEditSession}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cow</Form.Label>
                    <Form.Select
                      value={String(selectedSession.cow_id)}
                      onChange={(e) =>
                        setSelectedSession({
                          ...selectedSession,
                          cow_id: e.target.value,
                        })
                      }
                      required
                      className="shadow-sm border-primary"
                    >
                      <option value="">-- Select Cow --</option>
                      {/* If admin (role_id === 1), show all cows, else show only managed cows */}
                      {(currentUser?.role_id === 1 ? cowList : userManagedCows)
                        .filter((cow) => cow.gender?.toLowerCase() === "female")
                        .map((cow) => (
                          <option key={cow.id} value={String(cow.id)}>
                            {cow.name} (ID: {cow.id}) -{" "}
                            {cow.lactation_phase || "Unknown"}
                          </option>
                        ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {currentUser?.role_id === 1
                        ? "Select any female cow from the herd"
                        : "Select from your managed female cows"}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Milker</Form.Label>
                    {currentUser?.role_id === 1 ? (
                      <>
                        <Form.Select
                          value={selectedSession.milker_id}
                          onChange={(e) =>
                            setSelectedSession({
                              ...selectedSession,
                              milker_id: e.target.value,
                            })
                          }
                          required
                          className="shadow-sm"
                        >
                          <option value="">-- Select Milker --</option>
                          {farmers.map((farmer) => (
                            <option key={farmer.user_id} value={farmer.user_id}>
                              {farmer.name} (ID: {farmer.user_id})
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Select the farmer who performed the milking
                        </Form.Text>
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          value={
                            currentUser
                              ? `${currentUser.name} (ID: ${currentUser.user_id})`
                              : ""
                          }
                          disabled
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          Recording as current logged-in user
                        </Form.Text>
                        <Form.Control
                          type="hidden"
                          value={selectedSession.milker_id}
                        />
                      </>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Volume (Liters)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter milk volume in liters"
                      value={selectedSession.volume}
                      onChange={(e) =>
                        setSelectedSession({
                          ...selectedSession,
                          volume: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Milking Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={selectedSession.milking_time}
                      onChange={(e) =>
                        setSelectedSession({
                          ...selectedSession,
                          milking_time: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter any notes about this milking session"
                  value={selectedSession.notes || ""}
                  onChange={(e) =>
                    setSelectedSession({
                      ...selectedSession,
                      notes: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListMilking;
