import React, { useState, useEffect } from "react";
import {
  getMilkFreshnessAnalysis,
  getMilkFreshnessStats,
  getCriticalMilkBatches,
  runMilkFreshnessCheck,
  exportMilkFreshnessToPDF,
} from "../../../controllers/milkFreshnessController";
import {
  Card,
  Container,
  Row,
  Col,
  Table,
  Button,
  Badge,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import {
  FaFileDownload,
  FaBell,
  FaRedoAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import Chart from "react-apexcharts";
import moment from "moment";
import "moment/locale/id";
import Swal from "sweetalert2";

moment.locale("id");

const FreshnessMilk = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [freshMilkBatches, setFreshMilkBatches] = useState([]);
  const [criticalBatches, setCriticalBatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingFreshness, setCheckingFreshness] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    try {
      // Fetch all data in parallel
      const [analysisResponse, statsResponse, criticalResponse] =
        await Promise.all([
          getMilkFreshnessAnalysis(),
          getMilkFreshnessStats(),
          getCriticalMilkBatches(24),
        ]);

      if (analysisResponse.success) {
        setFreshMilkBatches(analysisResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (criticalResponse.success) {
        setCriticalBatches(criticalResponse.data);
      }
    } catch (error) {
      console.error("Error fetching milk freshness data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleFreshnessCheck = async () => {
    setCheckingFreshness(true);
    const result = await runMilkFreshnessCheck();
    if (result.success) {
      // Refresh data after successful check
      await fetchAllData();
    }
    setCheckingFreshness(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    await exportMilkFreshnessToPDF();
    setExporting(false);
  };

  // Chart configuration for freshness distribution
  const getFreshnessChartConfig = () => {
    // Count batches by freshness status
    const statusCount = {
      fresh: 0,
      warning: 0,
      critical: 0,
      expired: 0,
      unknown: 0,
    };
    freshMilkBatches.forEach((batch) => {
      statusCount[batch.freshness_status] =
        (statusCount[batch.freshness_status] || 0) + 1;
    });

    return {
      options: {
        chart: {
          type: "pie",
        },
        labels: ["Fresh", "Warning", "Critical", "Expired", "Unknown"],
        colors: ["#28a745", "#ffc107", "#fd7e14", "#dc3545", "#6c757d"],
        legend: {
          position: "bottom",
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 300,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
      series: [
        statusCount.fresh || 0,
        statusCount.warning || 0,
        statusCount.critical || 0,
        statusCount.expired || 0,
        statusCount.unknown || 0,
      ],
    };
  };

  const getFreshnessStatusBadge = (status) => {
    switch (status) {
      case "fresh":
        return <Badge bg="success">Segar</Badge>;
      case "warning":
        return (
          <Badge bg="warning" text="dark">
            Perhatian
          </Badge>
        );
      case "critical":
        return <Badge bg="danger">Kritis</Badge>;
      case "expired":
        return <Badge bg="dark">Kadaluarsa</Badge>;
      default:
        return <Badge bg="secondary">Tidak Diketahui</Badge>;
    }
  };

  const getFreshnessProgressBar = (percentage) => {
    let variant = "success";
    if (percentage < 30) variant = "danger";
    else if (percentage < 60) variant = "warning";

    return (
      <ProgressBar
        now={percentage}
        label={`${percentage}%`}
        variant={variant}
        style={{ height: "10px" }}
      />
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Analisis Kesegaran Susu</h2>
          <div className="d-flex gap-2 mb-4">
            <Button
              variant="outline-primary"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <FaRedoAlt />
              )}{" "}
              Refresh Data
            </Button>
            <Button
              variant="outline-warning"
              onClick={handleFreshnessCheck}
              disabled={checkingFreshness}
            >
              {checkingFreshness ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <FaBell />
              )}{" "}
              Cek Kesegaran & Notifikasi
            </Button>
            <Button
              variant="outline-success"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <FaFileDownload />
              )}{" "}
              Export PDF
            </Button>
          </div>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Memuat data kesegaran susu...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Total Batch Susu Segar</Card.Title>
                  <h3 className="text-primary">
                    {stats?.fresh?.batch_count || 0} Batch
                  </h3>
                  <Card.Text>
                    Total Volume: {(stats?.fresh?.total_volume || 0).toFixed(1)}{" "}
                    Liter
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 bg-warning text-dark">
                <Card.Body>
                  <Card.Title>Batch Susu Kritis</Card.Title>
                  <h3 className="text-dark">
                    {stats?.critical?.batch_count || 0} Batch
                  </h3>
                  <Card.Text>
                    Total Volume:{" "}
                    {(stats?.critical?.total_volume || 0).toFixed(1)} Liter
                    <br />
                    <small>Kadaluarsa dalam 24 jam</small>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 bg-danger text-white">
                <Card.Body>
                  <Card.Title>Batch Susu Kadaluarsa</Card.Title>
                  <h3 className="text-white">
                    {stats?.expired?.batch_count || 0} Batch
                  </h3>
                  <Card.Text>
                    Total Volume:{" "}
                    {(stats?.expired?.total_volume || 0).toFixed(1)} Liter
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 bg-success text-white">
                <Card.Body>
                  <Card.Title>Batch Susu Terpakai</Card.Title>
                  <h3 className="text-white">
                    {stats?.used?.batch_count || 0} Batch
                  </h3>
                  <Card.Text>
                    Total Volume: {(stats?.used?.total_volume || 0).toFixed(1)}{" "}
                    Liter
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Freshness Distribution Chart */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>Distribusi Kesegaran Susu</Card.Header>
                <Card.Body>
                  {freshMilkBatches.length > 0 ? (
                    <Chart
                      options={getFreshnessChartConfig().options}
                      series={getFreshnessChartConfig().series}
                      type="pie"
                      height={350}
                    />
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">
                        Tidak ada data batch susu segar
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Batch Susu Kritis</span>
                    <FaExclamationTriangle className="text-warning" />
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {criticalBatches.length > 0 ? (
                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                      <Table hover responsive className="mb-0">
                        <thead>
                          <tr>
                            <th>Batch</th>
                            <th>Sapi</th>
                            <th>Volume</th>
                            <th>Sisa Waktu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criticalBatches.map((batch) => (
                            <tr key={batch.id}>
                              <td>{batch.batch_number}</td>
                              <td>{batch.cow_name || "Tidak Diketahui"}</td>
                              <td>{batch.total_volume.toFixed(1)} L</td>
                              <td>
                                <strong
                                  className={`text-${
                                    batch.hours_left < 12 ? "danger" : "warning"
                                  }`}
                                >
                                  {batch.hours_left
                                    ? `${batch.hours_left.toFixed(1)} jam`
                                    : "Tidak diketahui"}
                                </strong>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">Tidak ada batch susu kritis</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Detailed Milk Batches Table */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Detail Batch Susu Segar</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ overflowX: "auto" }}>
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>No. Batch</th>
                      <th>Sapi</th>
                      <th>Pemerah</th>
                      <th>Volume</th>
                      <th>Tanggal Produksi</th>
                      <th>Tanggal Kadaluarsa</th>
                      <th>Sisa Waktu</th>
                      <th>Kesegaran</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freshMilkBatches.length > 0 ? (
                      freshMilkBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td>{batch.batch_number}</td>
                          <td>{batch.cow_name || "Tidak Diketahui"}</td>
                          <td>{batch.milker_name || "Tidak Diketahui"}</td>
                          <td>{batch.total_volume.toFixed(1)} L</td>
                          <td>
                            {moment(batch.production_date).format(
                              "DD MMM YYYY, HH:mm"
                            )}
                          </td>
                          <td>
                            {moment(batch.expiry_date).format(
                              "DD MMM YYYY, HH:mm"
                            )}
                          </td>
                          <td>
                            {batch.hours_left
                              ? `${batch.hours_left.toFixed(1)} jam`
                              : "Tidak diketahui"}
                          </td>
                          <td style={{ width: "150px" }}>
                            {batch.freshness_percentage !== null
                              ? getFreshnessProgressBar(
                                  batch.freshness_percentage
                                )
                              : "Tidak diketahui"}
                          </td>
                          <td>
                            {getFreshnessStatusBadge(batch.freshness_status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <p className="text-muted">
                            Tidak ada data batch susu segar
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default FreshnessMilk;
