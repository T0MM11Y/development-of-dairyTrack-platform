import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { listCows } from "../../../../Modules/controllers/cowsController";
import { listCowsByUser } from "../../../../Modules/controllers/cattleDistributionController";

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

  // Handle editing a milking session
  const handleEditSession = async (e) => {
    e.preventDefault();
    // For now this is a placeholder - you'll need to implement an updateMilkingSession function
    Swal.fire({
      icon: "info",
      title: "Feature Coming Soon",
      text: "Editing milking sessions will be available soon.",
    });
    setShowEditModal(false);
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
        <Badge bg="dark" className="ms-2">
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

        <Card.Body>
          <div className="d-flex justify-content-end mb-3">
            <Button
              variant="primary"
              className="me-2"
              onClick={handleOpenAddModal}
            >
              <i className="fas fa-plus me-2" /> Add Milking Session
            </Button>
            <OverlayTrigger overlay={<Tooltip>Export to PDF</Tooltip>}>
              <Button
                variant="danger"
                className="me-2"
                onClick={handleExportToPDF}
              >
                <i className="fas fa-file-pdf me-2" /> PDF
              </Button>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Export to Excel</Tooltip>}>
              <Button variant="success" onClick={handleExportToExcel}>
                <i className="fas fa-file-excel me-2" /> Excel
              </Button>
            </OverlayTrigger>
          </div>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary text-white mb-3 shadow-sm">
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
              <Card className="bg-success text-white mb-3 shadow-sm">
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
              <Card className="bg-warning text-dark mb-3 shadow-sm">
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
                <InputGroup.Text className="bg-primary text-white border-0">
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
            <table className="table table-hover border">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "15%" }}>Cow</th>
                  <th style={{ width: "12%" }}>Milker</th>
                  <th style={{ width: "10%" }}>Volume (L)</th>
                  <th style={{ width: "18%" }}>Milking Time</th>
                  <th style={{ width: "25%" }}>Notes</th>
                  <th style={{ width: "15%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndPaginatedSessions.currentSessions.map(
                  (session, index) => (
                    <tr key={session.id}>
                      <td>{(currentPage - 1) * sessionsPerPage + index + 1}</td>
                      <td>
                        <Badge bg="primary" pill className="me-2">
                          {session.cow_id}
                        </Badge>
                        {session.cow_name || `-`}
                      </td>
                      <td>{session.milker_name || `-`}</td>
                      <td>
                        <Badge bg="success" pill>
                          {parseFloat(session.volume).toFixed(2)} L
                        </Badge>
                      </td>
                      <td>
                        {format(new Date(session.milking_time), "yyyy-MM-dd")}{" "}
                        {getMilkingTimeLabel(session.milking_time)}
                      </td>
                      <td>
                        {session.notes ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{session.notes}</Tooltip>}
                          >
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "200px" }}
                            >
                              {session.notes}
                            </span>
                          </OverlayTrigger>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <OverlayTrigger
                          overlay={<Tooltip>Edit Session</Tooltip>}
                        >
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(session)}
                          >
                            <i className="fas fa-edit" />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          overlay={<Tooltip>View Details</Tooltip>}
                        >
                          <Button variant="outline-info" size="sm">
                            <i className="fas fa-eye" />
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredAndPaginatedSessions.totalItems === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <p className="lead text-muted">
                No milking sessions found matching your criteria.
              </p>
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
                    {/* Determine which list to use based on user role */}
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
                    Select the female cow for this milking session
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Milker</Form.Label>
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
                  <Form.Control type="hidden" value={newSession.milker_id} />
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
                      value={selectedSession.cow_id}
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
                          <option key={cow.id} value={cow.id}>
                            {cow.name} (ID: {cow.id})
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Milker</Form.Label>
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
