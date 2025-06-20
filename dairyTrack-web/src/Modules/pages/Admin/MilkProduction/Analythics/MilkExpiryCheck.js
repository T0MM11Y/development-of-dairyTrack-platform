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
  ProgressBar,
} from "react-bootstrap";
import { motion } from "framer-motion";
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
  heading: {
    fontWeight: "500",
    color: "#3D90D7",
    fontSize: "18px",
    fontFamily: "Roboto, Monospace",
  },
  subheading: {
    fontSize: "13px",
    color: "#6c757d",
    fontFamily: "Roboto, sans-serif",
  },
  compactCard: {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler functions
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
  };

  // Process batch data
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
      return statusMatch && searchMatch;
    });
  }, [allBatchesData, statusFilter, searchTerm]);

  const totalSummary = useMemo(() => {
    if (!batchesByStatus?.summary) return null;
    const { summary } = batchesByStatus;
    const totalBatches =
      (summary.fresh_count || 0) +
      (summary.expired_count || 0) +
      (summary.used_count || 0);
    const calculatePercentage = (count) =>
      totalBatches > 0 ? ((count / totalBatches) * 100).toFixed(1) : "0.0";
    return {
      totalBatches,
      freshPercentage: calculatePercentage(summary.fresh_count || 0),
      expiredPercentage: calculatePercentage(summary.expired_count || 0),
      usedPercentage: calculatePercentage(summary.used_count || 0),
      freshCount: summary.fresh_count || 0,
      expiredCount: summary.expired_count || 0,
      usedCount: summary.used_count || 0,
    };
  }, [batchesByStatus]);

  // Component helpers
  const renderSummaryCard = (title, count, volume, color, icon, status) => (
    <Col lg={4} md={6} className="mb-2">
      <Card
        style={styles.compactCard}
        onClick={() => handleViewDetails(status)}
        className="h-100"
      >
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col xs={8}>
              <h4
                className="mb-1"
                style={{ color, fontWeight: "bold", fontSize: "20px" }}
              >
                {count}
              </h4>
              <p className="mb-0 text-muted small">{title}</p>
              <small style={{ color, fontSize: "11px" }}>{volume}L Total</small>
            </Col>
            <Col xs={4} className="text-end">
              <i
                className={`fas fa-${icon}`}
                style={{ fontSize: "28px", color }}
              ></i>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );

  const renderStatusRow = (label, count, percent, color) => (
    <div className="mb-2">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="d-flex align-items-center">
          <i
            className="fas fa-circle me-2"
            style={{ color, fontSize: "10px" }}
          ></i>
          <span style={{ fontWeight: "500", fontSize: "13px" }}>{label}</span>
        </div>
        <span style={{ fontSize: "12px", color: "#6c757d" }}>
          {count} ({percent}%)
        </span>
      </div>
      <ProgressBar
        now={parseFloat(percent)}
        style={{ height: "6px", borderRadius: "6px" }}
      >
        <ProgressBar
          now={parseFloat(percent)}
          style={{ backgroundColor: color, borderRadius: "6px" }}
        />
      </ProgressBar>
    </div>
  );

  const hasActiveFilters = statusFilter !== "all" || searchTerm !== "";

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted small">Loading milk expiry data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-3">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3"
      >
        <h2 style={styles.heading}>
          <i className="fas fa-clock me-2"></i>Milk Expiry Check & Analysis
        </h2>
        <p style={styles.subheading} className="mb-0">
          Monitor milk batch expiry status with 8-hour shelf life tracking
          {batchesByStatus?.user_managed_cows && (
            <Badge bg="info" className="ms-2 small">
              {batchesByStatus.user_managed_cows.length} managed cows
            </Badge>
          )}
        </p>
      </motion.div>

      {/* Compact Summary Cards */}
      {batchesByStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <Row className="g-2">
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

      {/* Compact Statistics */}
      {totalSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <Card style={styles.compactCard}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center mb-3">
                <i
                  className="fas fa-chart-bar me-2"
                  style={{ color: "#6c757d", fontSize: "20px" }}
                ></i>
                <h6 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                  Status Distribution
                </h6>
              </div>
              {renderStatusRow(
                "Fresh",
                totalSummary.freshCount,
                totalSummary.freshPercentage,
                STATUS_COLORS.FRESH
              )}
              {renderStatusRow(
                "Expired",
                totalSummary.expiredCount,
                totalSummary.expiredPercentage,
                STATUS_COLORS.EXPIRED
              )}
              {renderStatusRow(
                "Used",
                totalSummary.usedCount,
                totalSummary.usedPercentage,
                STATUS_COLORS.USED
              )}
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Compact Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3"
      >
        <Card style={styles.compactCard}>
          <Card.Body className="p-3">
            <Row className="g-2 align-items-end">
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted mb-1">
                  <i className="fas fa-search me-1"></i>Search
                </Form.Label>
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ fontSize: "13px" }}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted mb-1">
                  <i className="fas fa-filter me-1"></i>Status
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ fontSize: "13px" }}
                >
                  <option value="all">All Status</option>
                  <option value="FRESH">Fresh</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="USED">Used</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                  className="w-100"
                >
                  <i className="fas fa-eraser me-1"></i>Clear
                </Button>
              </Col>
              <Col md={2} className="text-end">
                <small className="text-muted">
                  {filteredBatchesData.length} of {allBatchesData.length}{" "}
                  batches
                </small>
              </Col>
            </Row>
            {hasActiveFilters && (
              <div className="mt-2 d-flex flex-wrap gap-1">
                {statusFilter !== "all" && (
                  <Badge bg="primary" className="small">
                    Status: {statusFilter}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 ms-1 text-white"
                      onClick={() => setStatusFilter("all")}
                      style={{ fontSize: "10px" }}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </Badge>
                )}
                {searchTerm !== "" && (
                  <Badge bg="info" className="small">
                    Search: "{searchTerm}"
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 ms-1 text-white"
                      onClick={() => setSearchTerm("")}
                      style={{ fontSize: "10px" }}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Compact Table */}
      {batchesByStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card style={styles.compactCard}>
            <Card.Header className="bg-transparent border-0 pb-1">
              <div className="d-flex justify-content-between align-items-center">
                <h6 style={styles.heading} className="mb-0">
                  <i className="fas fa-table me-2"></i>Batches Overview
                  {hasActiveFilters && (
                    <Badge bg="secondary" className="ms-2 small">
                      Filtered
                    </Badge>
                  )}
                </h6>
                <small className="text-muted">
                  {filteredBatchesData.length} Total
                </small>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div
                style={{ maxHeight: "400px", overflowY: "auto" }}
                className="table-responsive"
              >
                <Table hover size="sm" className="mb-0">
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#f8f9fa",
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      {[
                        "#",
                        "Batch",
                        "Volume",
                        "Status",
                        "Expiry",
                        "Time Left",
                      ].map((header, index) => (
                        <th
                          key={header}
                          style={{
                            padding: "8px",
                            fontWeight: "600",
                            fontSize: "11px",
                            color: "#495057",
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatchesData.slice(0, 50).map((batch, index) => {
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
                            borderLeft: `3px solid ${rowStyle.border}`,
                          }}
                        >
                          <td
                            style={{
                              padding: "6px 8px",
                              fontSize: "11px",
                              color: "#6c757d",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <div className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor:
                                    STATUS_COLORS[batch.status] || "#6c757d",
                                  marginRight: "6px",
                                }}
                              ></div>
                              <span
                                style={{ fontSize: "12px", fontWeight: "500" }}
                              >
                                {batch.batch_number}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <Badge
                              style={{
                                background: "#3D90D7",
                                fontSize: "10px",
                                padding: "2px 6px",
                              }}
                            >
                              {batch.total_volume || 0}L
                            </Badge>
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <Badge
                              className={`${
                                batch.status === "FRESH"
                                  ? "bg-success"
                                  : batch.status === "EXPIRED"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                              style={{ fontSize: "9px", padding: "2px 6px" }}
                            >
                              {batch.status}
                            </Badge>
                          </td>
                          <td style={{ padding: "6px 8px", fontSize: "11px" }}>
                            {batch.expiry_date ? (
                              <div>
                                <div>
                                  {format(
                                    new Date(batch.expiry_date),
                                    "dd/MM/yyyy"
                                  )}
                                </div>
                                <small
                                  style={{ color: "#6c757d", fontSize: "10px" }}
                                >
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
                          <td style={{ padding: "6px 8px" }}>
                            {batch.expiry_date &&
                            batch.status !== "EXPIRED" &&
                            !formatTimeRemainingFromExpiryDate(
                              batch.expiry_date
                            ).includes("Overdue") ? (
                              <span
                                style={{
                                  color: URGENCY_COLORS[batch.urgency_level],
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                }}
                              >
                                {formatTimeRemainingFromExpiryDate(
                                  batch.expiry_date
                                )}
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#adb5bd",
                                  fontStyle: "italic",
                                  fontSize: "11px",
                                }}
                              >
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {filteredBatchesData.length === 0 && (
                  <div className="text-center py-4">
                    <i
                      className="fas fa-inbox text-muted"
                      style={{ fontSize: "32px" }}
                    ></i>
                    <p className="text-muted mt-2 mb-0">No batches found</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Compact Modal */}
      <Modal show={detailModal} onHide={() => setDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>
            <i className="fas fa-list me-2"></i>
            {selectedStatus} Batches
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBatches.length === 0 ? (
            <div className="text-center py-3">
              <i
                className="fas fa-inbox text-muted"
                style={{ fontSize: "32px" }}
              ></i>
              <p className="text-muted mt-2">No batches found</p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <Table striped hover responsive size="sm">
                <thead>
                  <tr>
                    {["Batch", "Volume", "Production", "Expiry", "Status"].map(
                      (header) => (
                        <th key={header} style={{ fontSize: "12px" }}>
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedBatches.map((batch) => (
                    <tr key={batch.id}>
                      <td style={{ fontSize: "11px" }}>
                        <strong>{batch.batch_number}</strong>
                      </td>
                      <td style={{ fontSize: "11px" }}>
                        {batch.total_volume || 0}L
                      </td>
                      <td style={{ fontSize: "11px" }}>
                        {batch.production_date
                          ? format(
                              new Date(batch.production_date),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </td>
                      <td style={{ fontSize: "11px" }}>
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
                          style={{ fontSize: "9px" }}
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDetailModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Compact Custom CSS */}
      <style jsx>{`
        .table-responsive::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 6px;
        }
        .table-responsive::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </Container>
  );
};

export default MilkExpiryCheck;
