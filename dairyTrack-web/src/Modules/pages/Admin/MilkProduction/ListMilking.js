import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "react-bootstrap";
import {
  getMilkingSessions,
  addMilkingSession,
  exportMilkProductionToPDF,
  exportMilkProductionToExcel,
  editMilkingSession,
  deleteMilkingSession,
} from "../../../../Modules/controllers/milkProductionController";

const ListMilking = () => {
  // ========== STATE MANAGEMENT ==========
  const [currentUser, setCurrentUser] = useState(null);
  const [cowList, setCowList] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userManagedCows, setUserManagedCows] = useState([]);
  const [farmers, setFarmers] = useState([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCow, setSelectedCow] = useState("");
  const [selectedMilker, setSelectedMilker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewSession, setViewSession] = useState(null);

  // Form state
  const [newSession, setNewSession] = useState({
    cow_id: "",
    milker_id: "",
    volume: "",
    milking_time: getLocalDateTime(),
    notes: "",
  });

  const sessionsPerPage = 8;

  // ========== UTILITY FUNCTIONS ==========
  // Get local date and time helpers
  function getLocalDateTime() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  function getLocalDateString(date = new Date()) {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }

  // Convert timestamp to local date string for filtering
  const getSessionLocalDate = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return getLocalDateString(date);
  }, []);

  // ========== DATA FETCHING ==========
  // Fetch user data and initialize session
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setCurrentUser(userData);
        setNewSession((prev) => ({
          ...prev,
          milker_id: userData.user_id || userData.id || "",
        }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Fetch user's managed cows
  useEffect(() => {
    if (!currentUser?.user_id) return;

    const fetchUserManagedCows = async () => {
      try {
        const { success, cows } = await listCowsByUser(currentUser.user_id);
        if (success && cows) {
          setUserManagedCows(cows);
        }
      } catch (err) {
        console.error("Error fetching user's cows:", err);
      }
    };

    fetchUserManagedCows();
  }, [currentUser]);

  // Fetch farmers (for admins only)
  useEffect(() => {
    if (currentUser?.role_id !== 1) return;

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

    fetchFarmers();
  }, [currentUser]);

  // Fetch all cows
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

  // Fetch milking sessions
  useEffect(() => {
    const fetchMilkingSessions = async () => {
      setLoading(true);
      try {
        const response = await getMilkingSessions();
        if (response.success && response.sessions) {
          setSessions(response.sessions);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch milking sessions.");
          setSessions([]);
        }
      } catch (err) {
        setError("An error occurred while fetching milking sessions.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMilkingSessions();
  }, []);

  // ========== DATA PROCESSING & MEMOIZED VALUES ==========
  // Today's date for filtering
  const today = useMemo(() => getLocalDateString(), []);

  // Filter today's sessions using local date
  const todaySessions = useMemo(() => {
    return sessions.filter(
      (session) => getSessionLocalDate(session.milking_time) === today
    );
  }, [sessions, today, getSessionLocalDate]);

  // Calculate today's volume
  const todayVolume = useMemo(() => {
    return todaySessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );
  }, [todaySessions]);

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

    return { uniqueCows: cows, uniqueMilkers: milkers };
  }, [sessions]);

  // Calculate milk statistics
  const milkStats = useMemo(() => {
    // Base stats
    const totalVolume = sessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );
    const totalSessions = sessions.length;

    // Filter sessions for farmers
    const filteredSessions =
      currentUser?.role_id !== 1
        ? sessions.filter((session) =>
            userManagedCows.some((cow) => cow.id === session.cow_id)
          )
        : sessions;

    // Total volume for filtered data
    const filteredVolume = filteredSessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    // Today's filtered sessions using local date
    const filteredTodaySessions = filteredSessions.filter(
      (session) => getSessionLocalDate(session.milking_time) === today
    );

    const filteredTodayVolume = filteredTodaySessions.reduce(
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
      filteredSessions: filteredSessions.length,
      filteredVolume: filteredVolume.toFixed(2),
      filteredTodayVolume: filteredTodayVolume.toFixed(2),
      filteredAvgVolumePerSession: filteredSessions.length
        ? (filteredVolume / filteredSessions.length).toFixed(2)
        : "0.00",
    };
  }, [
    sessions,
    currentUser,
    userManagedCows,
    today,
    todayVolume,
    todaySessions,
    getSessionLocalDate,
  ]);

  // Filter, sort and paginate sessions
  const filteredAndPaginatedSessions = useMemo(() => {
    // Filter sessions based on user role
    let filteredSessions = sessions;

    // For non-admin users, show only their managed cows
    if (currentUser?.role_id !== 1 && userManagedCows.length > 0) {
      const managedCowIds = userManagedCows.map((cow) => String(cow.id));
      filteredSessions = filteredSessions.filter((session) =>
        managedCowIds.includes(String(session.cow_id))
      );
    }

    // Apply search and filter logic
    filteredSessions = filteredSessions.filter((session) => {
      // Search term
      const matchesSearch =
        (session.cow_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (session.milker_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        String(session.volume).includes(searchTerm);

      // Filter selects
      const matchesCow = selectedCow
        ? String(session.cow_id) === selectedCow
        : true;
      const matchesMilker = selectedMilker
        ? String(session.milker_id) === selectedMilker
        : true;

      // Date filter with local date handling
      const matchesDate = selectedDate
        ? getSessionLocalDate(session.milking_time) === selectedDate
        : true;

      return matchesSearch && matchesCow && matchesMilker && matchesDate;
    });

    // Sort by milking time, most recent first
    filteredSessions.sort(
      (a, b) => new Date(b.milking_time) - new Date(a.milking_time)
    );

    // Calculate pagination
    const totalItems = filteredSessions.length;
    const totalPages = Math.ceil(totalItems / sessionsPerPage);

    // Get current page items
    const startIndex = (currentPage - 1) * sessionsPerPage;
    const paginatedItems = filteredSessions.slice(
      startIndex,
      startIndex + sessionsPerPage
    );

    return {
      filteredSessions,
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
    currentUser,
    userManagedCows,
    getSessionLocalDate,
  ]);

  // Check if user is a supervisor
  const isSupervisor = useMemo(() => currentUser?.role_id === 2, [currentUser]);

  // ========== EVENT HANDLERS ==========
  // Handle deletion of a milking session
  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      const result = await Swal.fire({
        title: "Delete Milking Session?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await deleteMilkingSession(sessionId);
        if (response.success) {
          Swal.fire(
            "Deleted!",
            "The milking session has been deleted.",
            "success"
          );
          // Refresh sessions
          const sessionsResponse = await getMilkingSessions();
          if (sessionsResponse.success && sessionsResponse.sessions) {
            setSessions(sessionsResponse.sessions);
          }
        } else {
          Swal.fire(
            "Error",
            response.message || "Failed to delete session",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  }, []);

  // Open add modal with pre-filled data
  const handleOpenAddModal = useCallback(() => {
    setNewSession({
      cow_id: "",
      milker_id: currentUser?.user_id || "",
      volume: "",
      milking_time: getLocalDateTime(),
      notes: "",
    });
    setShowAddModal(true);
  }, [currentUser]);

  // Add new milking session
  const handleAddSession = async (e) => {
    e.preventDefault();

    // Add creator info to notes
    const creatorInfo = currentUser
      ? `Created by: ${currentUser.name} (Role: ${
          currentUser.role_id === 1 ? "Admin" : "Farmer"
        })`
      : "Created by: Unknown";

    // Create session data with creator info
    const sessionData = {
      ...newSession,
      volume: parseFloat(newSession.volume),
      notes: newSession.notes
        ? `${newSession.notes}\n\n${creatorInfo}`
        : creatorInfo,
    };

    try {
      const response = await addMilkingSession(sessionData);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Milking session added successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh sessions list
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }

        setShowAddModal(false);
        // Reset form
        setNewSession({
          cow_id: "",
          milker_id: currentUser?.user_id || "",
          volume: "",
          milking_time: getLocalDateTime(),
          notes: "",
        });
      } else {
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
        text: "An unexpected error occurred",
      });
    }
  };

  // Open edit modal with session data
  const openEditModal = useCallback((session) => {
    setSelectedSession({
      ...session,
      cow_id: String(session.cow_id),
      milking_time: new Date(session.milking_time).toISOString().slice(0, 16),
    });
    setShowEditModal(true);
  }, []);

  // Handle editing a session
  const handleEditSession = async (e) => {
    e.preventDefault();
    try {
      const response = await editMilkingSession(
        selectedSession.id,
        selectedSession
      );

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Milking session updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        setShowEditModal(false);
        // Refresh sessions list
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }
        setSelectedSession(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update milking session",
        });
      }
    } catch (error) {
      console.error("Error editing session:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred",
      });
    }
  };

  // Open view modal with session data
  const openViewModal = useCallback((session) => {
    setViewSession({
      ...session,
      milking_time: session.milking_time,
    });
    setShowViewModal(true);
  }, []);

  // Handle exports
  const handleExportToPDF = () => exportMilkProductionToPDF();
  const handleExportToExcel = () => exportMilkProductionToExcel();

  // Handle pagination
  const handlePageChange = (page) => setCurrentPage(page);

  // Format milking time with badges based on time of day
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

  // ========== CONSTANTS ==========
  const milkingTimeInfo = {
    Morning:
      "Milking session conducted in the morning (before 12 PM), typically yields higher milk volume.",
    Afternoon:
      "Milking session during afternoon hours (12 PM - 6 PM), moderate milk production.",
    Evening:
      "Evening milking session (after 6 PM), usually the last session of the day.",
  };

  // ========== RENDER METHODS ==========
  // Show loading spinner
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

  // Show error message
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
                disabled={isSupervisor}
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
                      <h2 className="mt-2 mb-0">
                        {currentUser?.role_id === 1
                          ? milkStats.totalSessions
                          : milkStats.filteredSessions}
                      </h2>
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
                      <h2 className="mt-2 mb-0">
                        {currentUser?.role_id === 1
                          ? `${milkStats.totalVolume} L`
                          : `${milkStats.filteredVolume} L`}
                      </h2>
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
                      <h2 className="mt-2 mb-0">
                        {currentUser?.role_id === 1
                          ? `${milkStats.todayVolume} L`
                          : `${milkStats.filteredTodayVolume} L`}
                      </h2>
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
                        {currentUser?.role_id === 1
                          ? `${milkStats.avgVolumePerSession} L`
                          : `${milkStats.filteredAvgVolumePerSession} L`}
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
                  <th className="py-3 text-center" style={{ width: "5%" }}>
                    #
                  </th>
                  <th className="py-3" style={{ width: "15%" }}>
                    Cow
                  </th>
                  <th className="py-3" style={{ width: "12%" }}>
                    Milker
                  </th>
                  <th className="py-3" style={{ width: "10%" }}>
                    Volume (L)
                  </th>
                  <th className="py-3" style={{ width: "18%" }}>
                    Milking Time
                  </th>
                  <th className="py-3" style={{ width: "25%" }}>
                    Notes
                  </th>
                  <th className="py-3 text-center" style={{ width: "15%" }}>
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
                            ID: {session.cow_id}
                          </Badge>
                          <span className="fw-medium">
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
                            overlay={<Tooltip>{session.notes}</Tooltip>}
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
                            <span>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                }}
                                onClick={() => openEditModal(session)}
                                disabled={isSupervisor}
                                tabIndex={isSupervisor ? -1 : 0}
                              >
                                <i className="fas fa-edit" />
                              </Button>
                            </span>
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
                            <span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                }}
                                onClick={() => handleDeleteSession(session.id)}
                                disabled={isSupervisor}
                                tabIndex={isSupervisor ? -1 : 0}
                              >
                                <i className="fas fa-trash-alt" />
                              </Button>
                            </span>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Empty state message */}
          {filteredAndPaginatedSessions.totalItems === 0 && (
            <div className="text-center py-5 my-4">
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

              <nav>
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

                  {Array.from(
                    { length: filteredAndPaginatedSessions.totalPages },
                    (_, i) => {
                      const pageNumber = i + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber ===
                          filteredAndPaginatedSessions.totalPages ||
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
                    }
                  )}

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
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: "1.5rem" }}
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
                  <h6 className="text-muted mb-2">Cow Information</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold me-2">Cow ID:</span>
                      <span>{viewSession.cow_id}</span>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Cow Name:</span>
                      <span>{viewSession.cow_name || "N/A"}</span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Milker Information</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold me-2">Milker ID:</span>
                      <span>{viewSession.milker_id}</span>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Milker Name:</span>
                      <span>{viewSession.milker_name || "N/A"}</span>
                    </p>
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Milking Details</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold me-2">Volume:</span>
                      <Badge bg="success" className="px-2">
                        {parseFloat(viewSession.volume).toFixed(2)} L
                      </Badge>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Date:</span>
                      <span>
                        {format(
                          new Date(viewSession.milking_time),
                          "yyyy-MM-dd"
                        )}
                      </span>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Time:</span>
                      <span>
                        {getMilkingTimeLabel(viewSession.milking_time)}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Additional Information</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold">Notes:</span>
                    </p>
                    <p className="fst-italic text-muted">
                      {viewSession.notes || "No notes provided"}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
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
                    className="shadow-sm"
                  >
                    <option value="">-- Select Cow --</option>
                    {(currentUser?.role_id === 1 ? cowList : userManagedCows)
                      .filter((cow) => cow.gender?.toLowerCase() === "female")
                      .map((cow) => (
                        <option key={cow.id} value={cow.id}>
                          {cow.name} (ID: {cow.id}) -{" "}
                          {cow.lactation_phase || "Unknown"}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Milker</Form.Label>
                  {currentUser?.role_id === 1 ? (
                    <Form.Select
                      value={newSession.milker_id}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          milker_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Select Milker --</option>
                      {farmers.map((farmer) => (
                        <option key={farmer.user_id} value={farmer.user_id}>
                          {farmer.name} (ID: {farmer.user_id})
                        </option>
                      ))}
                    </Form.Select>
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
                    >
                      <option value="">-- Select Cow --</option>
                      {(currentUser?.role_id === 1 ? cowList : userManagedCows)
                        .filter((cow) => cow.gender?.toLowerCase() === "female")
                        .map((cow) => (
                          <option key={cow.id} value={String(cow.id)}>
                            {cow.name} (ID: {cow.id}) -{" "}
                            {cow.lactation_phase || "Unknown"}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Milker</Form.Label>
                    {currentUser?.role_id === 1 ? (
                      <Form.Select
                        value={selectedSession.milker_id}
                        onChange={(e) =>
                          setSelectedSession({
                            ...selectedSession,
                            milker_id: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- Select Milker --</option>
                        {farmers.map((farmer) => (
                          <option key={farmer.user_id} value={farmer.user_id}>
                            {farmer.name} (ID: {farmer.user_id})
                          </option>
                        ))}
                      </Form.Select>
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
