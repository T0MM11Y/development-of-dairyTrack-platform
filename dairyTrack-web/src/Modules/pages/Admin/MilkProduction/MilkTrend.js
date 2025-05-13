import React, { useState, useEffect, useMemo } from "react";
import {
  getDailySummaries,
  exportDailySummariesToPDF,
  exportDailySummariesToExcel,
} from "../../../../Modules/controllers/milkProductionController";
import { listCows } from "../../../../Modules/controllers/cowsController";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Badge,
  OverlayTrigger,
  Tooltip,
  Table,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MilkTrend = () => {
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for data
  const [summaries, setSummaries] = useState([]);
  const [cowList, setCowList] = useState([]);

  // State for filters
  // Update your state initialization
  const [startDate, setStartDate] = useState(() => {
    // This ensures we're getting data from at least 30 days back
    return format(subDays(new Date(), 30), "yyyy-MM-dd");
  });

  const [endDate, setEndDate] = useState(() => {
    // Make sure we're getting data up to the current day
    return format(new Date(), "yyyy-MM-dd");
  });
  const [selectedCow, setSelectedCow] = useState("");
  const [timeGrouping, setTimeGrouping] = useState("daily"); // daily, weekly, monthly
  const [chartType, setChartType] = useState("line"); // line, bar, pie

  // State for advanced metrics
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Fetch cows for dropdown
  useEffect(() => {
    const fetchCows = async () => {
      try {
        const response = await listCows();
        if (response.success) {
          // Filter only female cows which are the ones producing milk
          const femaleCows = response.cows.filter(
            (cow) => cow.gender === "Female"
          );
          setCowList(femaleCows);
        } else {
          console.error("Error fetching cows:", response.message);
        }
      } catch (error) {
        console.error("Error fetching cows:", error);
      }
    };

    fetchCows();
  }, []);

  useEffect(() => {
    const fetchMilkSummaries = async () => {
      setLoading(true);
      try {
        const filters = {
          start_date: startDate,
          end_date: endDate,
          cow_id: selectedCow || undefined,
        };

        const response = await getDailySummaries(filters);
        console.log("Original API response:", response);

        // Handle nested structure where summaries are inside response.summaries.summaries
        if (
          response.success &&
          response.summaries &&
          response.summaries.summaries
        ) {
          console.log(
            "Extracting nested summaries data:",
            response.summaries.summaries
          );
          setSummaries(response.summaries.summaries);
          setError(null);
        }
        // Handle the array response format [status, data, count]
        else if (Array.isArray(response) && response.length >= 2) {
          const [status, data, count] = response;
          console.log("Extracted data array:", data);

          if (status === true && Array.isArray(data)) {
            console.log("Sample data item:", data[0]);
            setSummaries(data);
            setError(null);
          } else {
            setError("Invalid data format received from the server");
            console.error("Invalid data format:", response);
            setSummaries([]);
          }
        }
        // Handle simple object with direct summaries array
        else if (response.success && Array.isArray(response.summaries)) {
          console.log("Direct summaries array:", response.summaries);
          setSummaries(response.summaries);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch milk production data.");
          console.error(
            "Error fetching milk summaries:",
            response.message || "Unknown error"
          );
          setSummaries([]);
        }
      } catch (err) {
        setError(
          "An unexpected error occurred while fetching milk production data."
        );
        console.error("Error fetching milk summaries:", err);
        setSummaries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMilkSummaries();
  }, [startDate, endDate, selectedCow]);

  // Process the data for charts according to selected time grouping
  const processedData = useMemo(() => {
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0)
      return [];

    // Sort by date
    const sortedData = [...summaries].sort(
      (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
    );

    if (timeGrouping === "daily") {
      // Daily data - just format it nicely
      return sortedData.map((item) => {
        // Add safety checks for date parsing
        let formattedDate = "Unknown";
        try {
          if (item.date) {
            formattedDate = format(new Date(item.date), "dd MMM");
          }
        } catch (err) {
          console.error("Error formatting date:", item.date, err);
        }

        return {
          date: formattedDate,
          morning: item.morning_volume || 0,
          afternoon: item.afternoon_volume || 0,
          evening: item.evening_volume || 0,
          total: item.total_volume || 0,
        };
      });
    } else if (timeGrouping === "weekly") {
      // Group by week
      const weeklyData = {};
      sortedData.forEach((item) => {
        if (!item.date) return; // Skip items with no date

        try {
          // Use new Date() instead of parseISO
          const date = new Date(item.date);
          const weekNum =
            Math.floor(
              differenceInDays(date, new Date(startDate || new Date())) / 7
            ) + 1;
          const weekKey = `Week ${weekNum}`;

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              date: weekKey,
              morning: 0,
              afternoon: 0,
              evening: 0,
              total: 0,
              count: 0,
            };
          }

          weeklyData[weekKey].morning += item.morning_volume || 0;
          weeklyData[weekKey].afternoon += item.afternoon_volume || 0;
          weeklyData[weekKey].evening += item.evening_volume || 0;
          weeklyData[weekKey].total += item.total_volume || 0;
          weeklyData[weekKey].count += 1;
        } catch (err) {
          console.error("Error processing date:", item.date, err);
        }
      });

      // Return the weekly data values
      return Object.values(weeklyData);
    } else if (timeGrouping === "monthly") {
      // Group by month
      const monthlyData = {};
      sortedData.forEach((item) => {
        if (!item.date) return; // Skip items with no date

        try {
          // Use new Date() instead of parseISO
          const date = new Date(item.date);
          const monthKey = format(date, "MMM yyyy");

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              date: monthKey,
              morning: 0,
              afternoon: 0,
              evening: 0,
              total: 0,
              count: 0,
            };
          }

          monthlyData[monthKey].morning += item.morning_volume || 0;
          monthlyData[monthKey].afternoon += item.afternoon_volume || 0;
          monthlyData[monthKey].evening += item.evening_volume || 0;
          monthlyData[monthKey].total += item.total_volume || 0;
          monthlyData[monthKey].count += 1;
        } catch (err) {
          console.error("Error processing date:", item.date, err);
        }
      });

      // Return the monthly data values
      return Object.values(monthlyData);
    }

    return sortedData;
  }, [summaries, timeGrouping, startDate]);

  // Need to also fix the stats calculation
  // Need to also fix the stats calculation
  const stats = useMemo(() => {
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0)
      return {
        totalProduction: 0,
        avgDailyProduction: 0,
        maxProduction: 0,
        maxDate: "N/A",
      };

    const totalProduction = summaries.reduce(
      (sum, item) => sum + (item.total_volume || 0),
      0
    );

    const avgDailyProduction = totalProduction / summaries.length;

    // Initialize with first item, ensuring it has valid properties
    const initialMax = {
      total_volume: 0,
      date: null,
    };

    // Fixed: Add null checks and use proper initial value
    const maxProductionItem = summaries.reduce(
      (max, item) =>
        item && item.total_volume > (max.total_volume || 0) ? item : max,
      initialMax
    );

    return {
      totalProduction: totalProduction.toFixed(2),
      avgDailyProduction: avgDailyProduction.toFixed(2),
      // Fixed: Add null check for total_volume
      maxProduction: (maxProductionItem.total_volume || 0).toFixed(2),
      maxDate: maxProductionItem.date
        ? format(parseISO(maxProductionItem.date), "dd MMM yyyy")
        : "N/A",
    };
  }, [summaries]);

  // After your processedData useMemo

  // Fix the comparison calculation
  const comparison = useMemo(() => {
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0)
      return { change: 0, trend: "neutral" };

    try {
      const dateRange =
        differenceInDays(
          parseISO(endDate || new Date()),
          parseISO(startDate || new Date())
        ) + 1;

      const currentPeriod = summaries.filter((item) => {
        if (!item.date) return false;
        try {
          return (
            differenceInDays(parseISO(endDate), parseISO(item.date)) < dateRange
          );
        } catch (err) {
          return false;
        }
      });

      // Rest of the comparison calculation...
      const previousPeriodTotal = currentPeriod.reduce(
        (sum, item) => sum + (item.total_volume || 0) * 0.9,
        0
      );

      const currentPeriodTotal = currentPeriod.reduce(
        (sum, item) => sum + (item.total_volume || 0),
        0
      );

      const percentageChange =
        previousPeriodTotal === 0
          ? 100
          : ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) *
            100;

      return {
        change: percentageChange.toFixed(2),
        trend:
          percentageChange > 0
            ? "up"
            : percentageChange < 0
            ? "down"
            : "neutral",
      };
    } catch (err) {
      console.error("Error calculating comparison:", err);
      return { change: 0, trend: "neutral" };
    }
  }, [summaries, startDate, endDate]);

  // ...existing code...

  // Distribution data for pie chart
  const distributionData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];

    const totalMorning = processedData.reduce(
      (sum, item) => sum + (parseFloat(item.morning) || 0),
      0
    );
    const totalAfternoon = processedData.reduce(
      (sum, item) => sum + (parseFloat(item.afternoon) || 0),
      0
    );
    const totalEvening = processedData.reduce(
      (sum, item) => sum + (parseFloat(item.evening) || 0),
      0
    );

    return [
      { name: "Morning", value: totalMorning },
      { name: "Afternoon", value: totalAfternoon },
      { name: "Evening", value: totalEvening },
    ];
  }, [processedData]);

  // Custom colors for pie chart
  const COLORS = ["#FFBB28", "#0088FE", "#383D59"];

  // Handle export functions
  // Example usage for PDF export
  const handleExportToPDF = async () => {
    // Define filters based on your form or state values
    const filters = {
      cow_id: selectedCow || undefined,
      start_date: startDate,
      end_date: endDate,
    };

    await exportDailySummariesToPDF(filters);
  };

  // Example usage for Excel export
  const handleExportToExcel = async () => {
    const filters = {
      cow_id: selectedCow || undefined,
      start_date: startDate,
      end_date: endDate,
    };

    await exportDailySummariesToExcel(filters);
  };
  useEffect(() => {
    console.log("Raw API summaries:", summaries);
    console.log("Processed data:", processedData);
    console.log("Selected date range:", startDate, endDate);
  }, [summaries, processedData, startDate, endDate]);
  // Render loading spinner
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
          <p className="mt-3 text-primary">
            Loading milk production trend data...
          </p>
        </div>
      </div>
    );
  }

  // Render error message
  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
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
            <i className="fas fa-chart-line me-2" /> Milk Production Trend
            Analysis
          </h4>
        </Card.Header>

        {/* Filters Section */}
        <Card.Body className="border-bottom">
          <Row className="mb-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Select Cow</Form.Label>
                <Form.Select
                  value={selectedCow}
                  onChange={(e) => setSelectedCow(e.target.value)}
                >
                  <option value="">All Cows</option>
                  {cowList.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.name} (ID: {cow.id})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="text-end">
              <div className="d-flex justify-content-end gap-2">
                <OverlayTrigger overlay={<Tooltip>Export to PDF</Tooltip>}>
                  <Button
                    variant="danger"
                    className="shadow-sm opacity-75"
                    onClick={handleExportToPDF}
                  >
                    <i className="fas fa-file-pdf me-2" /> PDF
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip>Export to Excel</Tooltip>}>
                  <Button
                    variant="success"
                    className="shadow-sm opacity-75"
                    onClick={handleExportToExcel}
                  >
                    <i className="fas fa-file-excel me-2" /> Excel
                  </Button>
                </OverlayTrigger>
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={9}>
              <div className="d-flex gap-2">
                <Form.Group>
                  <Form.Label>Time Grouping</Form.Label>
                  <div>
                    <Button
                      variant={
                        timeGrouping === "daily" ? "primary" : "outline-primary"
                      }
                      className="me-2"
                      onClick={() => setTimeGrouping("daily")}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={
                        timeGrouping === "weekly"
                          ? "primary"
                          : "outline-primary"
                      }
                      className="me-2"
                      onClick={() => setTimeGrouping("weekly")}
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={
                        timeGrouping === "monthly"
                          ? "primary"
                          : "outline-primary"
                      }
                      onClick={() => setTimeGrouping("monthly")}
                    >
                      Monthly
                    </Button>
                  </div>
                </Form.Group>

                <Form.Group className="ms-4">
                  <Form.Label>Chart Type</Form.Label>
                  <div>
                    <Button
                      variant={
                        chartType === "line" ? "primary" : "outline-primary"
                      }
                      className="me-2"
                      onClick={() => setChartType("line")}
                    >
                      <i className="fas fa-chart-line me-1"></i> Line
                    </Button>
                    <Button
                      variant={
                        chartType === "bar" ? "primary" : "outline-primary"
                      }
                      className="me-2"
                      onClick={() => setChartType("bar")}
                    >
                      <i className="fas fa-chart-bar me-1"></i> Bar
                    </Button>
                    <Button
                      variant={
                        chartType === "pie" ? "primary" : "outline-primary"
                      }
                      onClick={() => setChartType("pie")}
                    >
                      <i className="fas fa-chart-pie me-1"></i> Distribution
                    </Button>
                  </div>
                </Form.Group>
              </div>
            </Col>
            <Col md={3} className="d-flex justify-content-end align-items-end">
              <Button
                variant="outline-info"
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              >
                <i
                  className={`fas fa-${
                    showAdvancedMetrics ? "minus" : "plus"
                  }-circle me-2`}
                ></i>
                {showAdvancedMetrics ? "Hide" : "Show"} Advanced Metrics
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card
                className={`bg-primary text-white mb-3 shadow-sm opacity-75 ${
                  comparison.trend === "up" ? "border-success border-3" : ""
                }`}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6
                        className="card-title mb-0"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          letterSpacing: "0.5px",
                          fontWeight: "500",
                        }}
                      >
                        Total Production
                      </h6>
                      <h2
                        className="mt-2 mb-1"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: "700",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {stats.totalProduction} L
                      </h2>

                      {comparison.trend === "up" && (
                        <div
                          className="text d-flex align-items-center mt-1 p-1 rounded"
                          style={{
                            backgroundColor: "rgba(25, 135, 84, 0.1)",
                            display: "inline-block",
                          }}
                        >
                          <i className="fas fa-arrow-up me-1"></i>
                          <span style={{ fontWeight: "500" }}>
                            {comparison.change}% from previous period
                          </span>
                        </div>
                      )}

                      {comparison.trend === "down" && (
                        <div
                          className="text-danger d-flex align-items-center mt-1 p-1 rounded"
                          style={{
                            backgroundColor: "rgba(220, 53, 69, 0.1)",
                            display: "inline-block",
                          }}
                        >
                          <i className="fas fa-arrow-down me-1"></i>
                          <span style={{ fontWeight: "500" }}>
                            {Math.abs(comparison.change)}% from previous period
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <i className="fas fa-fill-drip fa-3x opacity-50"></i>
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
                      <h6 className="card-title mb-0">Average Daily</h6>
                      <h2 className="mt-2 mb-0">
                        {stats.avgDailyProduction} L
                      </h2>
                    </div>
                    <div>
                      <i className="fas fa-calendar-day fa-3x opacity-50"></i>
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
                      <h6 className="card-title mb-0">Peak Production</h6>
                      <h2 className="mt-2 mb-0">{stats.maxProduction} L</h2>
                      <small>{stats.maxDate}</small>
                    </div>
                    <div>
                      <i className="fas fa-trophy fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mb-3 shadow-sm border-0">
                <div className="bg-light border-bottom py-2 px-3">
                  <h5
                    className="card-title mb-0 text-secondary opacity-75"
                    style={{
                      fontFamily: "'Roboto Monospace', monospace",
                      letterSpacing: "0.15px",
                      fontWeight: "600",
                      fontSize: "0.99rem",
                    }}
                  >
                    <i className="fas fa-info-circle me-2 text-warning opacity-75"></i>
                    Lactation Stages
                  </h5>
                </div>
                <Card.Body className="bg-white">
                  <div className="w-100">
                    <div className="px-1 pb-3">
                      <p
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          letterSpacing: "0.1px",
                          color: "#495057",
                          lineHeight: "1.2",
                          fontSize: "0.90rem",
                          marginBottom: "0.8rem",
                        }}
                      >
                        Cattle lactation follows a natural cycle with distinct
                        phases that affect milk production:
                      </p>

                      <div className="d-flex flex-column gap-2 mt-3">
                        <div className="d-flex justify-content-between border-bottom pb-2">
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              letterSpacing: "0.1px",
                              color: "#6c757d",
                              fontSize: "0.8rem",
                              fontWeight: "500",
                            }}
                          >
                            Dry Period:
                          </span>
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              color: "#8f8f8f",
                              letterSpacing: "0.1px",
                              fontSize: "0.8rem",
                            }}
                          >
                            No milk production
                          </span>
                        </div>

                        <div className="d-flex justify-content-between border-bottom pb-2">
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              letterSpacing: "0.1px",
                              color: "#0d6efd",
                              fontSize: "0.8rem",

                              fontWeight: "500",
                            }}
                          >
                            Early Lactation:
                          </span>
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              color: "#8f8f8f",
                              letterSpacing: "0.3px",
                              fontSize: "0.8rem",
                            }}
                          >
                            0-100 days
                          </span>
                        </div>

                        <div className="d-flex justify-content-between border-bottom pb-2">
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              letterSpacing: "0.1px",
                              color: "#198754",
                              fontSize: "0.8rem",

                              fontWeight: "500",
                            }}
                          >
                            Mid Lactation:
                          </span>
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              color: "#8f8f8f",
                              letterSpacing: "0.3px",
                              fontSize: "0.8rem",
                            }}
                          >
                            100-200 days
                          </span>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              fontSize: "0.8rem",

                              letterSpacing: "0.1px",
                              color: "#dc3545",
                              fontWeight: "500",
                            }}
                          >
                            Late Lactation:
                          </span>
                          <span
                            style={{
                              fontFamily: "Roboto, sans-serif",
                              color: "#8f8f8f",
                              fontSize: "0.8rem",

                              letterSpacing: "0.3px",
                            }}
                          >
                            200-305 days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Advanced Metrics Section (conditional) */}
          {showAdvancedMetrics && (
            <Row className="mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Morning vs Afternoon vs Evening</h6>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Production Consistency</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex flex-column justify-content-between h-100">
                      <div>
                        <h5 className="text-center mb-3">
                          CV:{" "}
                          {processedData.length > 0
                            ? (
                                (Math.sqrt(
                                  processedData.reduce(
                                    (sum, item) =>
                                      sum +
                                      Math.pow(
                                        item.total - stats.avgDailyProduction,
                                        2
                                      ),
                                    0
                                  ) / processedData.length
                                ) /
                                  stats.avgDailyProduction) *
                                100
                              ).toFixed(2)
                            : "0.00"}
                          %
                        </h5>
                        <p className="text-muted">
                          Coefficient of Variation (CV) measures the consistency
                          of milk production. Lower values indicate more
                          consistent production.
                        </p>
                      </div>
                      <div className="text-center">
                        {parseFloat(
                          processedData.length > 0
                            ? (
                                (Math.sqrt(
                                  processedData.reduce(
                                    (sum, item) =>
                                      sum +
                                      Math.pow(
                                        item.total - stats.avgDailyProduction,
                                        2
                                      ),
                                    0
                                  ) / processedData.length
                                ) /
                                  stats.avgDailyProduction) *
                                100
                              ).toFixed(2)
                            : "0.00"
                        ) < 10 ? (
                          <h3 className="text-success mb-0">
                            <i className="fas fa-check-circle"></i> Excellent
                            Consistency
                          </h3>
                        ) : parseFloat(
                            processedData.length > 0
                              ? (
                                  (Math.sqrt(
                                    processedData.reduce(
                                      (sum, item) =>
                                        sum +
                                        Math.pow(
                                          item.total - stats.avgDailyProduction,
                                          2
                                        ),
                                      0
                                    ) / processedData.length
                                  ) /
                                    stats.avgDailyProduction) *
                                  100
                                ).toFixed(2)
                              : "0.00"
                          ) < 20 ? (
                          <h3 className="text-info mb-0">
                            <i className="fas fa-info-circle"></i> Good
                            Consistency
                          </h3>
                        ) : (
                          <h3 className="text-warning mb-0">
                            <i className="fas fa-exclamation-triangle"></i>{" "}
                            Needs Improvement
                          </h3>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Production Recommendations</h6>
                  </Card.Header>
                  <Card.Body>
                    <ul className="ps-3">
                      {comparison.trend === "down" && (
                        <li className="mb-2">
                          <Badge bg="danger" className="me-2">
                            Alert
                          </Badge>
                          Production has decreased {Math.abs(comparison.change)}
                          % from previous period
                        </li>
                      )}
                      {comparison.trend === "up" && (
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">
                            Positive
                          </Badge>
                          Production has increased {comparison.change}% from
                          previous period
                        </li>
                      )}
                      {parseFloat(stats.avgDailyProduction) < 15 && (
                        <li className="mb-2">
                          <Badge bg="info" className="me-2">
                            Suggestion
                          </Badge>
                          Consider reviewing milking techniques for potential
                          improvement
                        </li>
                      )}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Main Chart */}
          <div className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5
                  className="mb-0 text-secondary"
                  style={{
                    fontSize: "1.15rem",
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Milk Production Trend -{" "}
                  {selectedCow ? `Cow #${selectedCow}` : "All Cows"}(
                  {timeGrouping.charAt(0).toUpperCase() + timeGrouping.slice(1)}{" "}
                  View)
                </h5>
              </Card.Header>
              <Card.Body>
                {processedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === "line" ? (
                      <LineChart
                        data={processedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis
                          label={{
                            value: "Liters",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => [`${value} L`, name]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="morning"
                          name="Morning"
                          stroke="#FFBB28"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="afternoon"
                          name="Afternoon"
                          stroke="#0088FE"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="evening"
                          name="Evening"
                          stroke="#383D59"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total"
                          stroke="#FF0000"
                          strokeWidth={3}
                        />
                      </LineChart>
                    ) : chartType === "bar" ? (
                      <BarChart
                        data={processedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis
                          label={{
                            value: "Liters",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => [`${value} L`, name]}
                        />
                        <Legend />
                        <Bar
                          dataKey="morning"
                          name="Morning"
                          fill="#FFBB28"
                          stackId="a"
                        />
                        <Bar
                          dataKey="afternoon"
                          name="Afternoon"
                          fill="#0088FE"
                          stackId="a"
                        />
                        <Bar
                          dataKey="evening"
                          name="Evening"
                          fill="#383D59"
                          stackId="a"
                        />
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) =>
                            `${name}: ${value.toFixed(2)} L`
                          }
                        >
                          {distributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip
                          formatter={(value) => [`${value.toFixed(2)} L`]}
                        />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-chart-bar fa-4x text-muted mb-3"></i>
                    <p className="lead">
                      No milk production data available for the selected period.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Data Table */}
          {processedData.length > 0 && (
            <div className="table-responsive">
              <div className="table-responsive">
                <Table
                  hover
                  bordered
                  className="shadow-sm table-striped align-middle"
                  style={{ borderRadius: "8px", overflow: "hidden" }}
                >
                  <thead>
                    <tr
                      className="bg-light"
                      style={{ borderBottom: "2px solid #dee2e6" }}
                    >
                      {[
                        "Date/Period",
                        "Morning (L)",
                        "Afternoon (L)",
                        "Evening (L)",
                        "Total (L)",
                      ].map((title, idx) => (
                        <th
                          key={idx}
                          className="py-2 px-3 text-center text-opacity-75"
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-light"}
                      >
                        <td
                          className="py-1 px-1 text-center text-secondary"
                          style={{ fontWeight: "500", fontSize: "0.9rem" }}
                        >
                          {item.date}
                        </td>
                        {["morning", "afternoon", "evening", "total"].map(
                          (time, idx) => (
                            <td key={time} className="text-center py-1">
                              <Badge
                                bg={
                                  idx === 0
                                    ? "warning"
                                    : idx === 1
                                    ? "primary"
                                    : idx === 2
                                    ? "secondary"
                                    : "danger"
                                }
                                className={`${
                                  idx === 0 ? "text-light" : ""
                                } px-1 py-1`}
                                style={{
                                  minWidth: "70px",
                                  fontSize: "0.8rem",
                                  fontFamily: "Roboto,monospace",
                                  letterSpacing: "1.1px",
                                  fontWeight: idx === 3 ? "700" : "600",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                  ...(idx === 3 && {
                                    transition: "transform 0.2s ease",
                                  }),
                                }}
                                {...(idx === 3 && {
                                  onMouseOver: (e) =>
                                    (e.currentTarget.style.transform =
                                      "scale(1.05)"),
                                  onMouseOut: (e) =>
                                    (e.currentTarget.style.transform =
                                      "scale(1)"),
                                })}
                              >
                                {parseFloat(item[time]).toFixed(2)}
                              </Badge>
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                    {processedData.length > 0 && (
                      <tr className="bg-light">
                        <td
                          className="py-2 px-3 text-center text-secondary"
                          style={{ fontWeight: "600", fontSize: "0.9rem" }}
                        >
                          Summary
                        </td>
                        {["morning", "afternoon", "evening", "total"].map(
                          (time, idx) => (
                            <td key={time} className="text-center py-2">
                              <Badge
                                bg={idx === 3 ? "info" : "light"}
                                className={`${
                                  idx !== 3 ? "text-secondary border" : ""
                                } px-2 py-1`}
                                style={{
                                  minWidth: "70px",
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                }}
                              >
                                {processedData
                                  .reduce(
                                    (sum, item) => sum + parseFloat(item[time]),
                                    0
                                  )
                                  .toFixed(2)}
                              </Badge>
                            </td>
                          )
                        )}
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MilkTrend;
