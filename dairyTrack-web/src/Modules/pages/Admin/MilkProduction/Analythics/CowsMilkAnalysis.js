import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Alert,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  exportCowAnalysisPDF,
  exportCowAnalysisExcel,
} from "../../../../controllers/milkProductionController.js";

import Swal from "sweetalert2";

// Import controllers
import {
  getMilkingSessions,
  getDailySummaries,
} from "../../../../controllers/milkProductionController.js";
import { listCows } from "../../../../controllers/cowsController.js";
import {
  getUsersWithCows,
  listCowsByUser,
} from "../../../../controllers/cattleDistributionController.js";

const COLORS = [
  "#3D90D7",
  "#28a745",
  "#ffc107",
  "#dc3545",
  "#6f42c1",
  "#fd7e14",
  "#17a2b8",
  "#6c757d",
];

const styles = {
  fontFamily: "'Roboto', sans-serif",
  heading: {
    fontWeight: "500",
    color: "#3D90D7",
    fontSize: "21px",
    fontFamily: "Roboto, Monospace",
    letterSpacing: "0.5px",
  },
  subheading: {
    fontSize: "14px",
    color: "#6c757d",
    fontFamily: "Roboto, sans-serif",
  },
  card: {
    borderRadius: "10px",
    border: "none",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease-in-out",
  },
  cowCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    overflow: "hidden",
  },
  selectedCard: {
    border: "3px solid #3D90D7",
    transform: "scale(1.02)",
    boxShadow: "0 8px 25px rgba(61, 144, 215, 0.3)",
  },
  filterCard: {
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  analyticsCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  },
};

const CowsMilkAnalysis = () => {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cows, setCows] = useState([]);
  const [selectedCow, setSelectedCow] = useState(null);
  const [milkingSessions, setMilkingSessions] = useState([]);
  const [dailySummaries, setDailySummaries] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Get current user from localStorage
  const getCurrentUser = () => {
    if (typeof localStorage !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          return null;
        }
      }
    }
    return null;
  };
  // Add these functions in your component
  const handleExportPDF = async () => {
    try {
      const result = await exportCowAnalysisPDF(
        selectedCow.id,
        dateRange.startDate,
        dateRange.endDate
      );

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Export Berhasil",
          text: "PDF telah berhasil diunduh",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Gagal",
        text: error.message || "Terjadi kesalahan saat export PDF",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const result = await exportCowAnalysisExcel(
        selectedCow.id,
        dateRange.startDate,
        dateRange.endDate
      );

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Export Berhasil",
          text: "Excel telah berhasil diunduh",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Gagal",
        text: error.message || "Terjadi kesalahan saat export Excel",
      });
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const now = new Date();

    if (isNaN(birth.getTime())) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    } else if (months === 0 && now.getDate() < birth.getDate()) {
      years--;
      months = 11;
    }

    return { years, months };
  };

  // Format age display
  const formatAge = (birthDate) => {
    const age = calculateAge(birthDate);
    if (!age) return "N/A";

    const { years, months } = age;

    if (years === 0) {
      return `${months} bulan`;
    } else if (months === 0) {
      return `${years} tahun`;
    } else {
      return `${years}th ${months}bl`;
    }
  };

  // Get lactation phase for female cows
  const getLactationPhase = (cow) => {
    // Check if cow is male
    if (cow.gender && cow.gender.toLowerCase() === "male") {
      return "Bull"; // Pejantan
    }

    if (!cow.birth) return "Unknown";

    const age = calculateAge(cow.birth);
    if (!age) return "Unknown";

    const totalMonths = age.years * 12 + age.months;

    // For female cows, determine lactation phase based on age and milking data
    if (totalMonths < 15) return "Calf"; // Pedet
    if (totalMonths < 24) return "Heifer"; // Dara

    // For mature cows, we need to check milking sessions to determine lactation phase
    if (milkingSessions.length > 0) {
      const cowSessions = milkingSessions.filter(
        (session) => session.cow_id === cow.id
      );

      if (cowSessions.length === 0) {
        return "Dry"; // Tidak sedang laktasi
      }

      // Calculate days since last calving (simplified - using last milking as reference)
      const lastMilking = cowSessions.reduce((latest, session) => {
        const sessionDate = new Date(session.milking_time);
        return sessionDate > latest ? sessionDate : latest;
      }, new Date(0));

      const daysSinceLastMilking = Math.floor(
        (new Date() - lastMilking) / (1000 * 60 * 60 * 24)
      );

      // If no recent milking (>60 days), consider as dry
      if (daysSinceLastMilking > 60) {
        return "Dry";
      }

      // Estimate lactation phase based on production pattern
      // This is a simplified estimation - in real application, you'd have calving dates
      const recentSessions = cowSessions.filter((session) => {
        const sessionDate = new Date(session.milking_time);
        const daysAgo = Math.floor(
          (new Date() - sessionDate) / (1000 * 60 * 60 * 24)
        );
        return daysAgo <= 30; // Last 30 days
      });

      if (recentSessions.length === 0) return "Dry";

      const avgVolume =
        recentSessions.reduce(
          (sum, session) => sum + parseFloat(session.volume || 0),
          0
        ) / recentSessions.length;

      // Simplified lactation phase determination based on milk volume
      // These thresholds should be adjusted based on your farm's data
      if (avgVolume >= 15) return "Early"; // Early lactation (high production)
      if (avgVolume >= 8) return "Mid"; // Mid lactation (stable production)
      if (avgVolume >= 3) return "Late"; // Late lactation (declining production)
      return "Dry"; // Very low production
    }

    return "Dry"; // No milking data available
  };

  // Get lactation phase color
  const getLactationColor = (phase) => {
    switch (phase) {
      case "Bull":
        return "info"; // Biru untuk pejantan
      case "Calf":
        return "light"; // Abu-abu muda untuk pedet
      case "Heifer":
        return "secondary"; // Abu-abu untuk dara
      case "Dry":
        return "warning"; // Kuning untuk kering
      case "Early":
        return "success"; // Hijau untuk awal laktasi
      case "Mid":
        return "primary"; // Biru untuk mid laktasi
      case "Late":
        return "danger"; // Merah untuk akhir laktasi
      default:
        return "dark";
    }
  };

  // Get lactation phase description
  const getLactationDescription = (phase) => {
    switch (phase) {
      case "Bull":
        return "Bull - for breeding";
      case "Calf":
        return "Calf - still breastfeeding";
      case "Heifer":
        return "Dara - never given birth";
      case "Dry":
        return "Dry - not lactating";
      case "Early":
        return "Early Lactation - high production";
      case "Mid":
        return "Mid Lactation - stable production";
      case "Late":
        return "End of Lactation - production decreases";
      default:
        return "Status unknown";
    }
  };

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        setCurrentUser(user); // Load cows based on user role
        let cowsData = [];
        if (user.role_id === 3) {
          // Farmer - get only managed cows
          const result = await listCowsByUser(user.user_id);
          if (result.success) {
            cowsData = result.cows || [];
          }
          setCows(cowsData);
        } else {
          // Admin/Supervisor - get all cows with farmers
          const usersResult = await getUsersWithCows();
          if (usersResult.success) {
            cowsData = usersResult.usersWithCows.flatMap((farmer) =>
              (farmer.cows || []).map((cow) => ({
                ...cow,
                farmerName: farmer.name || farmer.username,
                farmerId: farmer.id,
              }))
            );

            // Remove duplicate cows based on cow ID
            const uniqueCows = cowsData.reduce((acc, cow) => {
              if (!acc.some((c) => c.id === cow.id)) acc.push(cow);
              return acc;
            }, []);
            setCows(uniqueCows);
          }
        }

        // Load all milking sessions
        const sessionsResult = await getMilkingSessions();
        if (sessionsResult.success) {
          setMilkingSessions(sessionsResult.sessions || []);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  console.log("Selected Cow:", selectedCow);
  // Load daily summaries when cow or date range changes
  useEffect(() => {
    const loadDailySummaries = async () => {
      if (!selectedCow) {
        setDailySummaries([]);
        return;
      }

      try {
        const result = await getDailySummaries({
          cow_id: selectedCow.id,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        });

        if (result.success) {
          setDailySummaries(result.summaries || []);
        }
      } catch (error) {
        console.error("Error loading daily summaries:", error);
      }
    };

    loadDailySummaries();
  }, [selectedCow, dateRange]);

  // Calculate cow performance metrics
  // Calculate cow performance metrics
  const cowPerformance = useMemo(() => {
    if (!selectedCow || !milkingSessions.length) return null;

    const cowSessions = milkingSessions.filter(
      (session) => session.cow_id === selectedCow.id
    );

    // Check if cow is male
    const isMale =
      selectedCow.gender && selectedCow.gender.toLowerCase() === "male";

    if (isMale) {
      // Return special data for male cows
      return {
        isMale: true,
        totalSessions: 0,
        totalVolume: "0.0",
        avgPerSession: "0.0",
        rangeVolume: "0.0",
        rangeSessions: 0,
        highestProduction: "0.0",
        lowestProduction: "0.0",
        dailyData: [],
        lastMilking: "Bulls are not milked",
        breedingInfo: {
          status: "Active for breeding",
          age: formatAge(selectedCow.birth),
          maturityStatus:
            selectedCow && calculateAge(selectedCow.birth)
              ? calculateAge(selectedCow.birth).years * 12 +
                  calculateAge(selectedCow.birth).months >=
                18
                ? "Adult - ready to mate"
                : "Young - not ready to marry"
              : "N/A",
        },
      };
    }

    const totalVolume = cowSessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    const avgPerSession =
      cowSessions.length > 0 ? totalVolume / cowSessions.length : 0;

    // Get sessions in date range
    const rangeStart = new Date(dateRange.startDate);
    const rangeEnd = new Date(dateRange.endDate);

    const rangeSessions = cowSessions.filter((session) => {
      const sessionDate = new Date(session.milking_time);
      return sessionDate >= rangeStart && sessionDate <= rangeEnd;
    });

    const rangeVolume = rangeSessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    // Calculate highest and lowest production from range sessions
    const rangeVolumes = rangeSessions.map((session) =>
      parseFloat(session.volume || 0)
    );
    const highestProduction =
      rangeVolumes.length > 0 ? Math.max(...rangeVolumes) : 0;
    const lowestProduction =
      rangeVolumes.length > 0 ? Math.min(...rangeVolumes) : 0;

    // Daily trend data
    const dailyData = [];
    const currentDate = new Date(rangeStart);

    while (currentDate <= rangeEnd) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const daySessionsVolume = rangeSessions
        .filter(
          (session) =>
            format(new Date(session.milking_time), "yyyy-MM-dd") === dateStr
        )
        .reduce((sum, session) => sum + parseFloat(session.volume || 0), 0);

      dailyData.push({
        date: format(currentDate, "dd/MM"),
        volume: daySessionsVolume,
        sessions: rangeSessions.filter(
          (session) =>
            format(new Date(session.milking_time), "yyyy-MM-dd") === dateStr
        ).length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      isMale: false,
      totalSessions: cowSessions.length,
      totalVolume: totalVolume.toFixed(1),
      avgPerSession: avgPerSession.toFixed(1),
      rangeVolume: rangeVolume.toFixed(1),
      rangeSessions: rangeSessions.length,
      highestProduction: highestProduction.toFixed(1),
      lowestProduction: lowestProduction.toFixed(1),
      dailyData,
      lastMilking:
        cowSessions.length > 0
          ? format(
              new Date(
                Math.max(...cowSessions.map((s) => new Date(s.milking_time)))
              ),
              "dd/MM/yyyy HH:mm"
            )
          : "No data",
    };
  }, [selectedCow, milkingSessions, dateRange]);

  if (!currentUser) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Authentication Error</Alert.Heading>
        <p>Please log in to access the cows milk analysis.</p>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading cows data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h2 style={styles.heading}>
          <i className="fas fa-chart-bar me-2"></i>
          Analysis of Cow's Milk Production
        </h2>
        <p style={styles.subheading}>
          Milk production performance analysis per cow with graphs and
          statistics detail
        </p>
      </motion.div>
      {selectedCow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card style={styles.filterCard}>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={4}>
                  <h5
                    className="mb-0"
                    style={{
                      fontWeight: "500",
                      letterSpacing: "0.9px",
                    }}
                  >
                    <i className="fas fa-paw me-2 text-info"></i>
                    Analysis for: {selectedCow.name}
                  </h5>
                </Col>
                <Col md={4}>
                  {!cowPerformance?.isMale && (
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-bold">
                            Start Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-bold">
                            End Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </Col>
                <Col md={4} className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    {/* Hide PDF button if selected cow is male (bull) */}
                    {!(
                      selectedCow &&
                      selectedCow.gender &&
                      selectedCow.gender.toLowerCase() === "male"
                    ) && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleExportPDF}
                        disabled={!selectedCow}
                      >
                        <i className="fas fa-file-pdf me-1"></i>
                        PDF
                      </Button>
                    )}
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={handleExportExcel}
                      disabled={!selectedCow}
                    >
                      <i className="fas fa-file-excel me-1"></i>
                      Excel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>
      )}
      {/* Analytics Section */}
      {selectedCow && cowPerformance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Row>
            {/* Performance Stats */}
            <Col lg={4} className="mb-4">
              <Card style={styles.analyticsCard}>
                <Card.Header className="bg-transparent border-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-chart-pie me-2"></i>
                    {cowPerformance.isMale
                      ? "Stud Information"
                      : "Performance Statistics"}
                  </h5>
                </Card.Header>
                <Card.Body>
                  {cowPerformance.isMale ? (
                    // Display breeding information for male cows
                    <div className="text-center">
                      <div className="mb-4">
                        <div style={{ fontSize: "64px" }}>🐂</div>
                        <h4 className="mt-2 mb-1">Sapi Pejantan</h4>
                        <Badge bg="info" className="mb-3">
                          Bull
                        </Badge>
                      </div>

                      <Row className="g-3 text-start">
                        <Col xs={12}>
                          <div
                            className="p-3"
                            style={{
                              background:
                                "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <i
                                className="fas fa-heart text-primary me-2"
                                style={{ fontSize: "20px" }}
                              ></i>
                              <div>
                                <strong className="text-primary">
                                  Status:
                                </strong>
                                <br />
                                <span className="text-primary">
                                  {cowPerformance.breedingInfo.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12}>
                          <div
                            className="p-3"
                            style={{
                              background:
                                "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <i
                                className="fas fa-birthday-cake text-success me-2"
                                style={{ fontSize: "20px" }}
                              ></i>
                              <div>
                                <strong className="text-success">Umur:</strong>
                                <br />
                                <span className="text-success">
                                  {cowPerformance.breedingInfo.age}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12}>
                          <div
                            className="p-3"
                            style={{
                              background:
                                "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <i
                                className="fas fa-check-circle text-warning me-2"
                                style={{ fontSize: "20px" }}
                              ></i>
                              <div>
                                <strong className="text-warning">
                                  Maturity:
                                </strong>
                                <br />
                                <span className="text-warning">
                                  {cowPerformance.breedingInfo.maturityStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12}>
                          <div
                            className="p-3"
                            style={{
                              background:
                                "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <i
                                className="fas fa-info-circle text-purple me-2"
                                style={{ fontSize: "20px", color: "#7b1fa2" }}
                              ></i>
                              <div>
                                <strong style={{ color: "#7b1fa2" }}>
                                  Function:
                                </strong>
                                <br />
                                <span style={{ color: "#7b1fa2" }}>
                                  Breeding & Cultivation
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    // Display milk production statistics for female cows
                    <Row className="g-3">
                      <Col xs={4}>
                        <div
                          className="text-center p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ fontSize: "24px", color: "#1565c0" }}>
                            <i className="fas fa-tint"></i>
                          </div>
                          <h4
                            style={{
                              color: "#1565c0",
                              fontWeight: "bold",
                              margin: "8px 0 4px",
                            }}
                          >
                            {cowPerformance.rangeVolume}L
                          </h4>
                          <small style={{ color: "#1565c0", opacity: 0.8 }}>
                            Total Period
                          </small>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div
                          className="text-center p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ fontSize: "24px", color: "#2e7d32" }}>
                            <i className="fas fa-chart-line"></i>
                          </div>
                          <h4
                            style={{
                              color: "#2e7d32",
                              fontWeight: "bold",
                              margin: "8px 0 4px",
                            }}
                          >
                            {cowPerformance.avgPerSession}L
                          </h4>
                          <small style={{ color: "#2e7d32", opacity: 0.8 }}>
                            Average/Session
                          </small>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div
                          className="text-center p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ fontSize: "24px", color: "#ef6c00" }}>
                            <i className="fas fa-calendar-check"></i>
                          </div>
                          <h4
                            style={{
                              color: "#ef6c00",
                              fontWeight: "bold",
                              margin: "8px 0 4px",
                            }}
                          >
                            {cowPerformance.rangeSessions}
                          </h4>
                          <small style={{ color: "#ef6c00", opacity: 0.8 }}>
                            Period Session
                          </small>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div
                          className="text-center p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ fontSize: "24px", color: "#7b1fa2" }}>
                            <i className="fas fa-clock"></i>
                          </div>
                          <h6
                            style={{
                              color: "#7b1fa2",
                              fontWeight: "bold",
                              margin: "8px 0 4px",
                              fontSize: "12px",
                            }}
                          >
                            {cowPerformance.lastMilking}
                          </h6>
                          <small style={{ color: "#7b1fa2", opacity: 0.8 }}>
                            Last Milk
                          </small>
                        </div>
                      </Col>

                      {/* New cards for highest and lowest production */}
                      <Col xs={4}>
                        <div
                          className="text-center p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ fontSize: "20px", color: "#2e7d32" }}>
                            <i className="fas fa-arrow-up"></i>
                          </div>
                          <h6
                            style={{
                              color: "#2e7d32",
                              fontWeight: "bold",
                              margin: "8px 0 4px",
                              fontSize: "14px",
                            }}
                          >
                            {cowPerformance.highestProduction}L
                          </h6>
                          <small style={{ color: "#2e7d32", opacity: 0.8 }}>
                            Highest
                          </small>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div
                          className="text-center p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                            borderRadius: "12px",
                          }}
                        >
                          <div style={{ fontSize: "20px", color: "#c62828" }}>
                            <i className="fas fa-arrow-down"></i>
                          </div>
                          <h6
                            style={{
                              color: "#c62828",
                              fontWeight: "bold",
                              margin: "8px 0 4px",
                              fontSize: "14px",
                            }}
                          >
                            {cowPerformance.lowestProduction}L
                          </h6>
                          <small style={{ color: "#c62828", opacity: 0.8 }}>
                            Lowest
                          </small>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Daily Production Chart or Breeding Info */}
            <Col lg={8} className="mb-4">
              <Card style={styles.analyticsCard}>
                <Card.Header className="bg-transparent border-0">
                  <h5 style={styles.heading}>
                    <i
                      className={`fas ${
                        cowPerformance.isMale
                          ? "fa-info-circle"
                          : "fa-chart-line"
                      } me-2`}
                    ></i>
                    {cowPerformance.isMale
                      ? "Breeding Information"
                      : "Daily Production Trend"}
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    {cowPerformance.isMale
                      ? "Complete information about bulls and their functions"
                      : "Milk production volume per day in the selected period"}
                  </p>
                </Card.Header>
                <Card.Body>
                  {cowPerformance.isMale ? (
                    // Display breeding information for male cows
                    <div className="text-center py-4">
                      <div className="row justify-content-center">
                        <div className="col-md-8">
                          <Alert variant="info" className="mb-4">
                            <h5 className="alert-heading">
                              <i className="fas fa-male me-2"></i>
                              Stud Cows
                            </h5>
                            <p className="mb-0">
                              This cow is a stud used for breeding and stocking.
                              The stud does not produce milk, but plays an
                              important role in reproduction and genetic
                              development of the herd.
                            </p>
                          </Alert>

                          <Row className="g-4">
                            <Col md={6}>
                              <Card
                                className="h-100 border-0"
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                <Card.Body className="text-center">
                                  <i
                                    className="fas fa-dna text-primary mb-3"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                  <h6 className="fw-bold">Genetic Breeding</h6>
                                  <p className="small text-muted mb-0">
                                    Produce offspring with superior genetics
                                  </p>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card
                                className="h-100 border-0"
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                <Card.Body className="text-center">
                                  <i
                                    className="fas fa-heart text-danger mb-3"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                  <h6 className="fw-bold">Breeding</h6>
                                  <p className="small text-muted mb-0">
                                    Mating with parents to produce offspring
                                  </p>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card
                                className="h-100 border-0"
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                <Card.Body className="text-center">
                                  <i
                                    className="fas fa-shield-alt text-success mb-3"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                  <h6 className="fw-bold">Herd Security</h6>
                                  <p className="small text-muted mb-0">
                                    Protecting the herd from the threat of
                                    predators
                                  </p>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card
                                className="h-100 border-0"
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                <Card.Body className="text-center">
                                  <i
                                    className="fas fa-chart-line text-warning mb-3"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                  <h6 className="fw-bold">
                                    Quality Improvement
                                  </h6>
                                  <p className="small text-muted mb-0">
                                    Improve the quality of the flock's offspring
                                  </p>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={cowPerformance.dailyData}>
                        <defs>
                          <linearGradient
                            id="colorVolume"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3D90D7"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3D90D7"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorSessions"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#28a745"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#28a745"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: "#e0e6ed" }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: "#e0e6ed" }}
                          label={{
                            value: "Volume (L)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: "#e0e6ed" }}
                          label={{
                            value: "Jumlah Sesi",
                            angle: 90,
                            position: "insideRight",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e6ed",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value, name) => [
                            name === "volume" ? `${value}L` : value,
                            name === "volume"
                              ? "Volume Produksi"
                              : name === "sessions"
                              ? "Jumlah Sesi"
                              : name,
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="#3D90D7"
                          fill="url(#colorVolume)"
                          strokeWidth={3}
                          yAxisId="left"
                          activeDot={{
                            r: 6,
                            stroke: "#3D90D7",
                            strokeWidth: 2,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sessions"
                          stroke="#28a745"
                          fill="url(#colorSessions)"
                          strokeWidth={2}
                          yAxisId="right"
                          activeDot={{
                            r: 6,
                            stroke: "#28a745",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </motion.div>
      )}
      {/* Cows Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card style={styles.card}>
          <Card.Header className="bg-white border-bottom-0">
            <h5 style={styles.heading}>
              <i className="fas fa-cow me-2"></i>
              {currentUser.role_id === 3
                ? "The Cows You Manage"
                : "All Cows on the Farm"}
            </h5>
            <p style={styles.subheading} className="mb-0">
              Click on the cow card to see detailed analysis.
            </p>
          </Card.Header>
          <Card.Body>
            {cows.length === 0 ? (
              <div className="text-center py-5">
                <i
                  className="fas fa-cow text-muted"
                  style={{ fontSize: "48px" }}
                ></i>
                <p className="text-muted mt-3">
                  {currentUser.role_id === 3
                    ? "There are no cows assigned to you yet"
                    : "There is no data on cattle yet"}
                </p>
              </div>
            ) : (
              <Row className="g-3">
                {cows.map((cow, index) => {
                  const lactationPhase = getLactationPhase(cow);
                  const isSelected = selectedCow?.id === cow.id;
                  const isMale =
                    cow.gender && cow.gender.toLowerCase() === "male";

                  return (
                    <Col lg={3} md={4} sm={6} key={cow.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card
                          style={{
                            ...styles.cowCard,
                            ...(isSelected ? styles.selectedCard : {}),
                          }}
                          onClick={() => setSelectedCow(cow)}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6
                                  className="mb-1 fw-bold"
                                  style={{ color: "#2c3e50" }}
                                >
                                  {cow.name}
                                </h6>
                                <small className="text-muted">
                                  ID: {cow.id}
                                </small>
                              </div>
                              <div className="text-end">
                                <div style={{ fontSize: "24px" }}>
                                  {isMale ? "🐂" : "🐄"}
                                </div>
                              </div>
                            </div>

                            <div className="mb-2">
                              <Badge
                                bg={getLactationColor(lactationPhase)}
                                className="me-2"
                                title={getLactationDescription(lactationPhase)}
                              >
                                {lactationPhase}
                              </Badge>
                              <Badge
                                bg="outline-secondary"
                                className="border text-secondary"
                              >
                                {cow.breed}
                              </Badge>
                            </div>

                            <Row className="small text-muted">
                              <Col xs={6}>
                                <div>
                                  <i className="fas fa-birthday-cake me-1"></i>
                                  {formatAge(cow.birth)}
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div>
                                  <i className="fas fa-venus-mars me-1"></i>
                                  {cow.gender}
                                </div>
                              </Col>
                            </Row>

                            {/* Show lactation description */}
                            <div className="mt-2">
                              <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                {getLactationDescription(lactationPhase)}
                              </small>
                            </div>

                            {currentUser.role_id !== 3 && cow.farmerName && (
                              <div className="mt-2 pt-2 border-top">
                                <small className="text-muted">
                                  <i className="fas fa-user me-1"></i>
                                  Farmer: {cow.farmerName}
                                </small>
                              </div>
                            )}

                            {isSelected && (
                              <div className="mt-2 pt-2 border-top">
                                <small className="text-primary fw-bold">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Selected for analysis
                                </small>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card.Body>
        </Card>
      </motion.div>
      {/* Instructions */}
      {!selectedCow && cows.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Alert variant="info" className="text-center">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Choose a cow</strong> from the card above to see detailed
            milk production analysis or breeding information
          </Alert>
        </motion.div>
      )}
    </Container>
  );
};

export default CowsMilkAnalysis;
