import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Table,
  Form,
  InputGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { format } from "date-fns";

// Import controllers
import {
  getMilkBatchesByStatus,
  getExpiryAnalysis,
  getMilkBatchesBySpecificStatus,
  updateExpiredMilkBatches,
  showCriticalAlerts,
  formatTimeRemainingFromExpiryDate,
  getUrgencyLevelFromExpiryDate,
} from "../../../../controllers/milkExpiryCheckController.js";

// Constants
const URGENCY_COLORS = {
  overdue: "#dc3545",
  warning: "#ffc107",
  caution: "#28a745",
  safe: "#6c757d",
  unknown: "#343a40",
};

const URGENCY_ORDER = {
  overdue: 0,
  warning: 1,
  caution: 2,
  safe: 3,
  unknown: 4,
};

const STATUS_COLORS = {
  FRESH: "#28a745",
  EXPIRED: "#dc3545",
  USED: "#6c757d",
};

// Styles object
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
  alertCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    overflow: "hidden",
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

const MilkExpiryCheck = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [batchesByStatus, setBatchesByStatus] = useState(null);
  const [expiryAnalysis, setExpiryAnalysis] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Load data function
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statusResult, analysisResult] = await Promise.all([
        getMilkBatchesByStatus(),
        getExpiryAnalysis(),
      ]);

      if (statusResult.success) setBatchesByStatus(statusResult.data);
      if (analysisResult.success) setExpiryAnalysis(analysisResult.data);

      await showCriticalAlerts();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh effect
  useEffect(() => {
    loadAllData();

    if (!autoRefresh) return;

    const interval = setInterval(loadAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handler functions
  const handleUpdateExpired = async () => {
    const result = await updateExpiredMilkBatches();
    if (result.success && !result.canceled) {
      await loadAllData();
    }
  };

  const handleViewDetails = async (status) => {
    try {
      const result = await getMilkBatchesBySpecificStatus(
        status.toUpperCase(),
        1,
        50
      );
      if (result.success) {
        setSelectedStatus(status);
        setSelectedBatches(result.batches);
        setDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading batch details:", error);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setUrgencyFilter("all");
  };

  // Process batch data with urgency calculation
  const processBatchData = (batch) => {
    const normalizedBatch = {
      ...batch,
      status: batch.status?.toUpperCase() || "UNKNOWN",
    };
    let urgencyLevel = "unknown";
    let hoursRemaining = null;

    if (normalizedBatch.expiry_date && normalizedBatch.status === "FRESH") {
      try {
        const diffInMs =
          new Date(normalizedBatch.expiry_date).getTime() -
          new Date().getTime();
        hoursRemaining = diffInMs / (1000 * 60 * 60);
        urgencyLevel = getUrgencyLevelFromExpiryDate(
          normalizedBatch.expiry_date
        );
      } catch (error) {
        console.error("Error processing batch expiry:", error);
      }
    } else if (normalizedBatch.status === "EXPIRED") {
      urgencyLevel = "overdue";
      hoursRemaining = -1;
    } else if (normalizedBatch.status === "USED") {
      urgencyLevel = "safe";
    }

    return {
      ...normalizedBatch,
      hours_until_expiry: hoursRemaining,
      urgency_level: urgencyLevel,
    };
  };

  // Memoized calculations
  const urgencyMetrics = useMemo(() => {
    if (!expiryAnalysis) return null;
    return {
      warning: expiryAnalysis.expiring_soon_2_hours?.length || 0,
      caution: expiryAnalysis.expiring_4_hours?.length || 0,
    };
  }, [expiryAnalysis]);

  const statusChartData = useMemo(() => {
    if (!batchesByStatus) return [];
    const { summary } = batchesByStatus;
    return [
      {
        name: "Fresh",
        value: summary?.fresh_count || 0,
        volume: summary?.total_fresh_volume || 0,
        color: STATUS_COLORS.FRESH,
      },
      {
        name: "Expired",
        value: summary?.expired_count || 0,
        volume: summary?.total_expired_volume || 0,
        color: STATUS_COLORS.EXPIRED,
      },
      {
        name: "Used",
        value: summary?.used_count || 0,
        volume: summary?.total_used_volume || 0,
        color: STATUS_COLORS.USED,
      },
    ];
  }, [batchesByStatus]);

  const allBatchesData = useMemo(() => {
    if (!batchesByStatus) return [];

    const allBatches = [
      ...(batchesByStatus.fresh || []),
      ...(batchesByStatus.expired || []),
      ...(batchesByStatus.used || []),
    ];

    return allBatches
      .map(processBatchData)
      .filter(Boolean)
      .sort((a, b) => {
        const urgencyDiff =
          (URGENCY_ORDER[a.urgency_level] || 4) -
          (URGENCY_ORDER[b.urgency_level] || 4);
        if (urgencyDiff !== 0) return urgencyDiff;

        if (a.hours_until_expiry !== null && b.hours_until_expiry !== null) {
          return a.hours_until_expiry - b.hours_until_expiry;
        }
        return 0;
      });
  }, [batchesByStatus]);

  const filteredBatchesData = useMemo(() => {
    return allBatchesData.filter((batch) => {
      const statusMatch =
        statusFilter === "all" || batch.status === statusFilter.toUpperCase();
      const searchMatch =
        searchTerm === "" ||
        [
          batch.batch_number,
          batch.total_volume?.toString(),
          batch.cow_name,
          batch.cow_id?.toString(),
        ].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const urgencyMatch =
        urgencyFilter === "all" || batch.urgency_level === urgencyFilter;

      return statusMatch && searchMatch && urgencyMatch;
    });
  }, [allBatchesData, statusFilter, searchTerm, urgencyFilter]);

  const totalSummary = useMemo(() => {
    if (!batchesByStatus?.summary) return null;

    const { summary } = batchesByStatus;
    const totalBatches =
      (summary.fresh_count || 0) +
      (summary.expired_count || 0) +
      (summary.used_count || 0);
    const totalVolume =
      (summary.total_fresh_volume || 0) +
      (summary.total_expired_volume || 0) +
      (summary.total_used_volume || 0);

    const calculatePercentage = (count) =>
      totalBatches > 0 ? ((count / totalBatches) * 100).toFixed(1) : "0.0";

    return {
      totalBatches,
      totalVolume,
      freshPercentage: calculatePercentage(summary.fresh_count || 0),
      expiredPercentage: calculatePercentage(summary.expired_count || 0),
      usedPercentage: calculatePercentage(summary.used_count || 0),
    };
  }, [batchesByStatus]);

  const filteredSummary = useMemo(() => {
    const counts = {
      fresh: filteredBatchesData.filter((batch) => batch.status === "FRESH")
        .length,
      expired: filteredBatchesData.filter((batch) => batch.status === "EXPIRED")
        .length,
      used: filteredBatchesData.filter((batch) => batch.status === "USED")
        .length,
    };

    return {
      ...counts,
      freshCount: counts.fresh,
      expiredCount: counts.expired,
      usedCount: counts.used,
      safeCount: counts.fresh,
      totalVolume: filteredBatchesData.reduce(
        (sum, batch) => sum + (batch.total_volume || 0),
        0
      ),
      totalFiltered: filteredBatchesData.length,
    };
  }, [filteredBatchesData]);

  // Component helpers
  const renderSummaryCard = (title, count, volume, color, icon, status) => (
    <Col lg={4} md={6}>
      <Card style={styles.alertCard} onClick={() => handleViewDetails(status)}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1" style={{ color, fontWeight: "bold" }}>
                {count}
              </h3>
              <p className="mb-0 text-muted">{title}</p>
              <small style={{ color }}>{volume}L Total</small>
            </div>
            <div style={{ fontSize: "48px", color }}>
              <i className={`fas fa-${icon}`}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  const renderStatusBadge = (status) => {
    const badgeClass =
      status === "FRESH"
        ? "bg-success"
        : status === "EXPIRED"
        ? "bg-danger"
        : "bg-secondary";
    return (
      <Badge
        className={`${badgeClass} text-white`}
        style={{
          fontSize: "10px",
          padding: "4px 8px",
          borderRadius: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {status}
      </Badge>
    );
  };

  const renderTimeRemaining = (batch) => {
    if (!batch.expiry_date || batch.status === "EXPIRED") {
      return <span style={{ color: "#adb5bd", fontStyle: "italic" }}>-</span>;
    }

    const timeRemaining = formatTimeRemainingFromExpiryDate(batch.expiry_date);
    if (timeRemaining.includes("Overdue")) {
      return <span style={{ color: "#adb5bd", fontStyle: "italic" }}>-</span>;
    }

    return (
      <div className="d-flex align-items-center">
        <i
          className="fas fa-clock me-2"
          style={{
            color: URGENCY_COLORS[batch.urgency_level],
            fontSize: "12px",
          }}
        ></i>
        <span
          style={{
            color: URGENCY_COLORS[batch.urgency_level],
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          {timeRemaining}
        </span>
      </div>
    );
  };

  const hasActiveFilters =
    statusFilter !== "all" || searchTerm !== "" || urgencyFilter !== "all";

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
          <p className="mt-3 text-muted">Loading milk expiry data...</p>
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
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 style={styles.heading}>
              <i className="fas fa-clock me-2"></i>Milk Expiry Check & Analysis
            </h2>
            <p style={styles.subheading}>
              Monitor milk batch expiry status with 8-hour shelf life tracking
              {batchesByStatus?.user_managed_cows && (
                <span className="ms-2 badge bg-info">
                  {batchesByStatus.user_managed_cows.length} managed cows
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {batchesByStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Row className="g-3">
            {renderSummaryCard(
              "Fresh Batches",
              batchesByStatus.summary?.fresh_count || 0,
              batchesByStatus.summary?.total_fresh_volume || 0,
              STATUS_COLORS.FRESH,
              "check-circle",
              "FRESH"
            )}
            {renderSummaryCard(
              "Expired Batches",
              batchesByStatus.summary?.expired_count || 0,
              batchesByStatus.summary?.total_expired_volume || 0,
              STATUS_COLORS.EXPIRED,
              "times-circle",
              "EXPIRED"
            )}
            {renderSummaryCard(
              "Used Batches",
              batchesByStatus.summary?.used_count || 0,
              batchesByStatus.summary?.total_used_volume || 0,
              STATUS_COLORS.USED,
              "archive",
              "USED"
            )}
          </Row>
        </motion.div>
      )}

      {/* Chart */}
      <Row className="mb-4">
        <Col lg={12} className="mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card style={styles.analyticsCard}>
              <Card.Header className="bg-transparent border-0">
                <h5 style={styles.heading}>
                  <i className="fas fa-chart-bar me-2"></i>Batch Status
                  Distribution
                </h5>
                <p style={styles.subheading} className="mb-0">
                  Current distribution of milk batches by status
                </p>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" barSize={50}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card style={styles.filterCard}>
          <Card.Header className="bg-transparent border-0">
            <h5 style={styles.heading}>
              <i className="fas fa-filter me-2"></i>Filter & Search Batches
            </h5>
            <p style={styles.subheading} className="mb-0">
              Find specific batches using filters and search
            </p>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col lg={4} md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">
                    <i className="fas fa-search me-1"></i>Search Batches
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by batch number, volume, cow..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderRadius: "10px 0 0 10px",
                        border: "2px solid #e9ecef",
                        fontSize: "14px",
                      }}
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSearchTerm("")}
                        style={{
                          borderRadius: "0 10px 10px 0",
                          border: "2px solid #e9ecef",
                          borderLeft: "none",
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col lg={3} md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">
                    <i className="fas fa-tags me-1"></i>Filter by Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #e9ecef",
                      fontSize: "14px",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="FRESH">Fresh</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="USED">Used</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col lg={2} md={6} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  onClick={clearFilters}
                  className="w-100"
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #e9ecef",
                    fontSize: "14px",
                  }}
                >
                  <i className="fas fa-eraser me-1"></i>Clear
                </Button>
              </Col>
            </Row>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-3 p-3 bg-white rounded">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="small fw-bold text-muted">
                    Active Filters:
                  </span>

                  {statusFilter !== "all" && (
                    <Badge bg="primary" className="d-flex align-items-center">
                      Status: {statusFilter}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-1 text-white"
                        onClick={() => setStatusFilter("all")}
                        style={{ fontSize: "12px" }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </Badge>
                  )}

                  {urgencyFilter !== "all" && (
                    <Badge bg="warning" className="d-flex align-items-center">
                      Urgency: {urgencyFilter}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-1 text-dark"
                        onClick={() => setUrgencyFilter("all")}
                        style={{ fontSize: "12px" }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </Badge>
                  )}

                  {searchTerm !== "" && (
                    <Badge bg="info" className="d-flex align-items-center">
                      Search: "{searchTerm}"
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-1 text-white"
                        onClick={() => setSearchTerm("")}
                        style={{ fontSize: "12px" }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </Badge>
                  )}

                  <span className="small text-muted ms-2">
                    Showing {filteredBatchesData.length} of{" "}
                    {allBatchesData.length} batches
                  </span>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Batches Table */}
      {batchesByStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card style={styles.analyticsCard}>
            <Card.Header className="bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 style={styles.heading}>
                    <i className="fas fa-table me-2"></i>All Milk Batches
                    Overview
                    {hasActiveFilters && (
                      <Badge bg="secondary" className="ms-2">
                        Filtered
                      </Badge>
                    )}
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    {hasActiveFilters
                      ? `Filtered list of milk batches from your managed cows (${filteredBatchesData.length} of ${allBatchesData.length} total)`
                      : "Complete list of milk batches from your managed cows with status and expiry information"}
                  </p>
                </div>
                <div className="text-end">
                  <h6 className="mb-0 text-primary">
                    {hasActiveFilters ? "Filtered:" : "Total:"}{" "}
                    {filteredSummary.totalFiltered} Batches
                  </h6>
                  <small className="text-muted">
                    {filteredSummary.totalVolume}L Total Volume
                  </small>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Summary Stats */}
              <Row className="mb-3">
                {["fresh", "expired", "used"].map((type, index) => (
                  <Col lg={3} md={6} className="mb-2" key={type}>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor:
                              Object.values(STATUS_COLORS)[index],
                            borderRadius: "50%",
                          }}
                        ></div>
                      </div>
                      <div>
                        <strong
                          className={`text-${
                            type === "fresh"
                              ? "success"
                              : type === "expired"
                              ? "danger"
                              : "secondary"
                          }`}
                        >
                          {filteredSummary[`${type}Count`]}
                        </strong>
                        <small className="text-muted ms-1">
                          {type.charAt(0).toUpperCase() + type.slice(1)} (
                          {filteredSummary.totalFiltered > 0
                            ? (
                                (filteredSummary[`${type}Count`] /
                                  filteredSummary.totalFiltered) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </small>
                      </div>
                    </div>
                  </Col>
                ))}
                <Col lg={3} md={6} className="mb-2">
                  <div className="text-center">
                    <strong className="text-primary">
                      {filteredSummary.totalVolume}L
                    </strong>
                    <br />
                    <small className="text-muted">Total Volume</small>
                  </div>
                </Col>
              </Row>

              {/* Table */}
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  border: "1px solid #e9ecef",
                  borderRadius: "12px",
                }}
                className="table-responsive"
              >
                <Table hover size="sm" style={{ marginBottom: 0 }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      background:
                        "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                      zIndex: 10,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    <tr>
                      {[
                        "#",
                        "Batch Number",
                        "Volume",
                        "Status",
                        "Production",
                        "Expiry",
                        "Time Remaining",
                      ].map((header, index) => (
                        <th
                          key={header}
                          style={{
                            padding: index === 0 ? "12px 8px" : "12px",
                            fontWeight: "600",
                            fontSize: "12px",
                            color: "#495057",
                            borderBottom: "none",
                          }}
                        >
                          {index > 0 && (
                            <i
                              className={`fas fa-${
                                [
                                  "barcode",
                                  "tint",
                                  "check-circle",
                                  "calendar",
                                  "calendar-times",
                                  "clock",
                                ][index - 1]
                              } me-1`}
                            ></i>
                          )}
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatchesData.map((batch, index) => {
                      const urgencyColors = {
                        overdue: { bg: "#fff5f5", border: "#dc3545" },
                        warning: { bg: "#fffef0", border: "#ffc107" },
                        caution: { bg: "#f0fff4", border: "#28a745" },
                        safe: { bg: "transparent", border: "transparent" },
                        unknown: { bg: "transparent", border: "transparent" },
                      };

                      const rowStyle =
                        urgencyColors[batch.urgency_level] ||
                        urgencyColors.unknown;

                      return (
                        <tr
                          key={batch.id}
                          style={{
                            backgroundColor: rowStyle.bg,
                            borderLeft: `4px solid ${rowStyle.border}`,
                            transition: "all 0.2s ease",
                          }}
                          className="table-row-hover"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.01)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 8px",
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "#6c757d",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor:
                                    STATUS_COLORS[batch.status] || "#6c757d",
                                  marginRight: "8px",
                                }}
                              ></div>
                              <strong
                                style={{ fontSize: "13px", color: "#2c3e50" }}
                              >
                                {batch.batch_number}
                              </strong>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Badge
                              style={{
                                background:
                                  "linear-gradient(135deg, #3D90D7 0%, #2c7bd0 100%)",
                                color: "white",
                                fontSize: "11px",
                                padding: "4px 8px",
                                borderRadius: "8px",
                              }}
                            >
                              <i
                                className="fas fa-tint me-1"
                                style={{ fontSize: "10px" }}
                              ></i>
                              {batch.total_volume || 0}L
                            </Badge>
                          </td>
                          <td style={{ padding: "12px" }}>
                            {renderStatusBadge(batch.status)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "12px",
                              color: "#495057",
                            }}
                          >
                            {batch.production_date ? (
                              <div>
                                <div style={{ fontWeight: "500" }}>
                                  {format(
                                    new Date(batch.production_date),
                                    "dd/MM/yyyy"
                                  )}
                                </div>
                                <small style={{ color: "#6c757d" }}>
                                  {format(
                                    new Date(batch.production_date),
                                    "HH:mm"
                                  )}
                                </small>
                              </div>
                            ) : (
                              <span
                                style={{
                                  color: "#adb5bd",
                                  fontStyle: "italic",
                                }}
                              >
                                N/A
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "12px",
                              color: "#495057",
                            }}
                          >
                            {batch.expiry_date ? (
                              <div>
                                <div style={{ fontWeight: "500" }}>
                                  {format(
                                    new Date(batch.expiry_date),
                                    "dd/MM/yyyy"
                                  )}
                                </div>
                                <small style={{ color: "#6c757d" }}>
                                  {format(new Date(batch.expiry_date), "HH:mm")}
                                </small>
                              </div>
                            ) : (
                              <span
                                style={{
                                  color: "#adb5bd",
                                  fontStyle: "italic",
                                }}
                              >
                                N/A
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {renderTimeRemaining(batch)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {/* No data states */}
                {filteredBatchesData.length === 0 &&
                  allBatchesData.length > 0 && (
                    <div
                      className="text-center py-5"
                      style={{ borderTop: "1px solid #dee2e6" }}
                    >
                      <i
                        className="fas fa-search text-muted"
                        style={{ fontSize: "48px" }}
                      ></i>
                      <h5 className="mt-3 text-muted">
                        No Matching Batches Found
                      </h5>
                      <p className="text-muted">
                        Try adjusting your search criteria or filters to find
                        the batches you're looking for.
                      </p>
                      <Button variant="outline-primary" onClick={clearFilters}>
                        <i className="fas fa-eraser me-1"></i>Clear All Filters
                      </Button>
                    </div>
                  )}

                {filteredBatchesData.length === 0 &&
                  allBatchesData.length === 0 && (
                    <div
                      className="text-center py-5"
                      style={{ borderTop: "1px solid #dee2e6" }}
                    >
                      <i
                        className="fas fa-inbox text-muted"
                        style={{ fontSize: "48px" }}
                      ></i>
                      <h5 className="mt-3 text-muted">No Batches Found</h5>
                      <p className="text-muted">
                        There are no milk batches from your managed cows to
                        display at this time.
                      </p>
                    </div>
                  )}
              </div>

              {/* Table Footer */}
              <div className="mt-3 p-3 bg-light rounded">
                <Row>
                  <Col md={3}>
                    <strong>Total Batches:</strong>
                    <br />
                    <span className="h5 text-primary">
                      {filteredSummary.totalFiltered}
                      {hasActiveFilters && (
                        <small className="text-muted">
                          {" "}
                          / {allBatchesData.length}
                        </small>
                      )}
                    </span>
                  </Col>
                  <Col md={3}>
                    <strong>Total Volume:</strong>
                    <br />
                    <span className="h5 text-info">
                      {filteredSummary.totalVolume}L
                    </span>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Detail Modal */}
      <Modal show={detailModal} onHide={() => setDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-list me-2"></i>
            {selectedStatus ? selectedStatus.toUpperCase() : ""} Batches Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBatches.length === 0 ? (
            <div className="text-center py-4">
              <i
                className="fas fa-inbox text-muted"
                style={{ fontSize: "48px" }}
              ></i>
              <p className="text-muted mt-3">
                No batches found for this status from your managed cows
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    {[
                      "Batch Number",
                      "Volume",
                      "Production Date",
                      "Expiry Date",
                      "Status",
                    ].map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedBatches.map((batch) => (
                    <tr key={batch.id}>
                      <td>
                        <strong>{batch.batch_number}</strong>
                      </td>
                      <td>{batch.total_volume || 0}L</td>
                      <td>
                        {batch.production_date
                          ? format(
                              new Date(batch.production_date),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        {batch.expiry_date
                          ? format(
                              new Date(batch.expiry_date),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        <Badge
                          bg={
                            batch.status?.toUpperCase() === "FRESH"
                              ? "success"
                              : batch.status?.toUpperCase() === "EXPIRED"
                              ? "danger"
                              : "secondary"
                          }
                        >
                          {batch.status?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .table-row-hover {
          cursor: pointer;
        }
        .table-responsive::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .table-responsive::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </Container>
  );
};

export default MilkExpiryCheck;
