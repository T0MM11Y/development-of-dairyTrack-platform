import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, Form, Button, Spinner, Row, Col, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import ReactApexChart from "react-apexcharts";
import { getAllDailyFeeds } from "../../../../controllers/feedScheduleController";

const NutritionSummaryPage = () => {
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCow, setSelectedCow] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filterType, setFilterType] = useState("today");
  const [intervalType, setIntervalType] = useState("day");
  const [barCount, setBarCount] = useState(7);
  const chartRef = useRef(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      };
      const response = await getAllDailyFeeds(params);
      if (response.success && Array.isArray(response.data)) {
        const filteredData = response.data.filter((item) => {
          const itemDate = new Date(item.date);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          itemDate.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return itemDate >= startDate && itemDate <= endDate;
        });
        setDailyFeeds(filteredData);
        if (filteredData.length === 0) {
          setError("Tidak ada data jadwal pakan untuk rentang tanggal ini.");
        }
      } else {
        setDailyFeeds([]);
        setError("Gagal memuat data jadwal pakan.");
      }
    } catch (err) {
      setError(err.message || "Gagal memuat data jadwal pakan.");
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: err.message || "Terjadi kesalahan saat memuat data.",
      });
      setDailyFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      setDailyFeeds([]);
    };
  }, [dateRange.startDate, dateRange.endDate]);

  // Unique cows
  const uniqueCows = useMemo(() => {
    const cows = [
      ...new Set(
        dailyFeeds.map((feed) => JSON.stringify({ id: feed.cow_id, name: feed.cow_name }))
      ),
    ].map((cow) => JSON.parse(cow));
    return cows;
  }, [dailyFeeds]);

  // Helper function to get date range for filters
  const getDateRange = () => {
    const today = new Date();
    let start, end;

    switch (filterType) {
      case "today":
        start = end = today.toISOString().split("T")[0];
        setIntervalType("day");
        break;
      case "week":
        start = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split("T")[0];
        end = new Date(today.setDate(today.getDate() + 6)).toISOString().split("T")[0];
        setIntervalType("day");
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        setIntervalType("week");
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        end = new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0];
        setIntervalType("month");
        break;
      case "custom":
        start = dateRange.startDate;
        end = dateRange.endDate;
        break;
      default:
        start = end = today.toISOString().split("T")[0];
        setIntervalType("day");
    }

    return { start, end };
  };

  const handleApplyFilters = () => {
    if (filterType === "custom") {
      if (!dateRange.startDate || !dateRange.endDate) {
        Swal.fire({
          title: "Perhatian!",
          text: "Tanggal mulai dan akhir harus diisi.",
          icon: "warning",
        });
        return;
      }
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        Swal.fire({
          title: "Perhatian!",
          text: "Tanggal mulai harus sebelum tanggal akhir.",
          icon: "warning",
        });
        return;
      }
    }

    const today = new Date();
    let newDateRange = { ...dateRange };
    if (filterType !== "custom") {
      switch (filterType) {
        case "today":
          newDateRange = {
            startDate: today.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
          };
          break;
        case "week":
          newDateRange = {
            startDate: new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split("T")[0],
            endDate: new Date(today.setDate(today.getDate() + 6)).toISOString().split("T")[0],
          };
          break;
        case "month":
          newDateRange = {
            startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0],
            endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0],
          };
          break;
        case "year":
          newDateRange = {
            startDate: new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0],
            endDate: new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0],
          };
          break;
        default:
          break;
      }
      setDateRange(newDateRange);
    }

    setBarCount(7);
    fetchData();
  };

  // Calculate nutrition summary with time-based grouping
  const nutritionSummary = useMemo(() => {
    if (!selectedCow) return { periods: [], nutrients: [] };

    const { start, end } = getDateRange();
    const filteredFeeds = dailyFeeds.filter((feed) => {
      const feedDate = new Date(feed.date);
      const startDate = new Date(start);
      const endDate = new Date(end);
      feedDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return feed.cow_id === parseInt(selectedCow) && feedDate >= startDate && feedDate <= endDate;
    });

    let periods = [];
    const nutrientMap = new Map();

    const groupByInterval = (data, interval) => {
      const grouped = {};
      data.forEach((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        let key;
        switch (interval) {
          case "day":
            key = itemDate.toISOString().split("T")[0];
            break;
          case "week":
            const weekStart = new Date(itemDate);
            weekStart.setDate(itemDate.getDate() - itemDate.getDay());
            key = `${weekStart.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })} - ${new Date(weekStart.setDate(weekStart.getDate() + 6)).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}`;
            break;
          case "month":
            key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`;
            break;
          case "year":
            key = itemDate.getFullYear().toString();
            break;
          default:
            key = itemDate.toISOString().split("T")[0];
        }
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      return Object.entries(grouped)
        .sort(([dateA], [dateB]) => {
          if (interval === "month") {
            const [yearA, monthA] = dateA.split("-").map(Number);
            const [yearB, monthB] = dateB.split("-").map(Number);
            return yearA === yearB ? monthA - monthB : yearA - yearB;
          }
          return dateA.localeCompare(dateB);
        })
        .map(([date, items]) => {
          const nutrients = {};
          items.forEach((feed) => {
            feed.items.forEach((item) => {
              item.nutrients.forEach((nutrient) => {
                const key = `${nutrient.nutrisi_name}-${nutrient.unit}`;
                if (!nutrientMap.has(key)) {
                  nutrientMap.set(key, { name: nutrient.nutrisi_name, unit: nutrient.unit });
                }
                if (!nutrients[key]) nutrients[key] = 0;
                nutrients[key] += parseFloat(nutrient.amount || 0);
              });
            });
          });
          return {
            label: interval === "month" ? new Date(`${date}-01`).toLocaleString("id-ID", { month: "long" }) : date,
            nutrients,
          };
        });
    };

    if (filterType === "year") {
      const year = new Date(start).getFullYear();
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        monthStart.setHours(0, 0, 0, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthData = filteredFeeds.filter((feed) => {
          const feedDate = new Date(feed.date);
          feedDate.setHours(0, 0, 0, 0);
          return feedDate >= monthStart && feedDate <= monthEnd;
        });

        const monthlyNutrients = {};
        monthData.forEach((feed) => {
          feed.items.forEach((item) => {
            item.nutrients.forEach((nutrient) => {
              const key = `${nutrient.nutrisi_name}-${nutrient.unit}`;
              if (!nutrientMap.has(key)) {
                nutrientMap.set(key, { name: nutrient.nutrisi_name, unit: nutrient.unit });
              }
              if (!monthlyNutrients[key]) monthlyNutrients[key] = 0;
              monthlyNutrients[key] += parseFloat(nutrient.amount || 0);
            });
          });
        });

        periods.push({
          label: monthStart.toLocaleString("id-ID", { month: "long" }),
          nutrients: monthlyNutrients,
        });
      }
    } else if (filterType === "today" || filterType === "week" || filterType === "month" || filterType === "custom") {
      periods = groupByInterval(filteredFeeds, filterType === "custom" ? intervalType : filterType === "month" ? "week" : "day");
    }

    const nutrients = Array.from(nutrientMap.entries()).map(([key, value]) => ({
      key,
      name: value.name,
      unit: value.unit,
    }));

    return { periods, nutrients };
  }, [dailyFeeds, selectedCow, filterType, dateRange, intervalType]);

  // Prepare chart data for grouped bar chart
  const chartData = useMemo(() => {
    const { periods, nutrients } = nutritionSummary;
    if (periods.length === 0 || nutrients.length === 0) return { series: [], categories: [] };

    const series = nutrients.map((nutrient) => ({
      name: `${nutrient.name} (${nutrient.unit})`,
      data: periods.map((period) => {
        const value = period.nutrients[nutrient.key] || 0;
        return parseFloat(value.toFixed(2));
      }),
    }));

    const categories = periods.map((period) => period.label);
    return { series, categories };
  }, [nutritionSummary]);

  // Helper function to format numbers for display
  const formatNumber = (num) => {
    if (num === 0) return "-";
    return parseFloat(num.toFixed(2)).toString();
  };

  const chartOptions = useMemo(() => {
    const visibleBars = Math.min(barCount, chartData.categories.length);

    return {
      chart: {
        height: 400,
        type: "bar",
        toolbar: { show: false },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
          zoomedArea: {
            fill: { color: "#90CAF9", opacity: 0.4 },
            stroke: { color: "#0D47A1", opacity: 0.4, width: 1 },
          },
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        events: {
          mounted: (chart) => {
            chart.windowResizeHandler();
            if (chartData.categories.length > 0) {
              const totalBars = chartData.categories.length;
              const minX = 0;
              const maxX = Math.min(visibleBars - 1, totalBars - 1);
              chart.updateOptions({
                xaxis: { min: minX, max: maxX },
              });
            }
          },
          zoomed: (chart, { xaxis }) => {
            const zoomedBars = Math.round(xaxis.max - xaxis.min + 1);
            setBarCount(zoomedBars);
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: `${Math.max(30, 100 - visibleBars * 5)}%`,
          borderRadius: 6,
        },
      },
      colors: ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6c757d", "#ff69b4", "#20c997"],
      dataLabels: {
        enabled: true,
        formatter: (val) => formatNumber(val),
        style: { fontSize: "12px", fontWeight: "bold", colors: ["#333"] },
        offsetY: -20,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: chartData.categories,
        labels: {
          rotate: -45,
          style: { fontSize: "12px", fontWeight: 500, colors: "#333" },
          formatter: (value) => value,
        },
      },
      yaxis: {
        title: {
          text: "Jumlah Nutrisi",
          style: { fontSize: "14px", fontWeight: "bold", color: "#333" },
        },
        labels: {
          formatter: (val) => formatNumber(val),
        },
        min: 0,
        max: Math.max(...chartData.series.flatMap((s) => s.data.filter(val => val !== null)), 0) * 1.2 || 10,
      },
      fill: { opacity: 0.9 },
      legend: {
        position: "top",
        horizontalAlign: "center",
        fontSize: "14px",
        fontWeight: 500,
        labels: { colors: "#333" },
      },
      tooltip: {
        y: {
          formatter: (val, { seriesIndex }) => {
            const nutrient = nutritionSummary.nutrients[seriesIndex];
            return `${formatNumber(val)} ${nutrient.unit}`;
          },
        },
      },
      grid: { borderColor: "#eee" },
    };
  }, [chartData, nutritionSummary, barCount]);

  const handleZoomIn = () => {
    if (chartRef.current && chartData.categories.length > 0) {
      const newBarCount = Math.max(barCount - 2, 3);
      setBarCount(newBarCount);
      const totalBars = chartData.categories.length;
      const minX = 0;
      const maxX = Math.min(newBarCount - 1, totalBars - 1);
      chartRef.current.chart.updateOptions({
        xaxis: { min: minX, max: maxX },
      });
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current && chartData.categories.length > 0) {
      const newBarCount = Math.min(barCount + 2, chartData.categories.length);
      setBarCount(newBarCount);
      const totalBars = chartData.categories.length;
      const minX = 0;
      const maxX = Math.min(newBarCount - 1, totalBars - 1);
      chartRef.current.chart.updateOptions({
        xaxis: { min: minX, max: maxX },
      });
    }
  };

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ringkasan Nutrisi Sapi</h2>
          <p className="text-muted">Lihat total nutrisi yang dikonsumsi sapi berdasarkan jadwal pakan</p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-secondary waves-effect waves-light"
          disabled={loading}
          style={{
            borderRadius: "8px",
            background: "linear-gradient(90deg, #3498db 0%, #2c3e50 100%)",
            border: "none",
            color: "#fff",
            letterSpacing: "1.3px",
            fontWeight: "600",
            fontSize: "0.8rem",
          }}
        >
          <i className="ri-refresh-line me-1"></i> Refresh
        </button>
      </div>

      <motion.div
        className="card mb-4 shadow-sm border-0"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="card-body">
          <Row>
            <Col md={3} className="mb-3">
              <label className="form-label fw-bold">Pilih Sapi</label>
              <select
                className="form-select"
                value={selectedCow}
                onChange={(e) => setSelectedCow(e.target.value)}
                disabled={loading}
                style={{ borderRadius: "8px", borderColor: "#e0e0e0" }}
              >
                <option value="">-- Pilih Sapi --</option>
                {uniqueCows.map((cow) => (
                  <option key={cow.id} value={cow.id}>
                    {cow.name}
                  </option>
                ))}
              </select>
            </Col>
            <Col md={3} className="mb-3">
              <label className="form-label fw-bold">Tipe Filter</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={loading}
                style={{ borderRadius: "8px", borderColor: "#e0e0e0" }}
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="custom">Kustom</option>
              </select>
            </Col>
            {filterType === "custom" && (
              <Col md={3} className="mb-3">
                <label className="form-label fw-bold">Interval</label>
                <select
                  className="form-select"
                  value={intervalType}
                  onChange={(e) => setIntervalType(e.target.value)}
                  disabled={loading}
                  style={{ borderRadius: "8px", borderColor: "#e0e0e0" }}
                >
                  <option value="day">Hari</option>
                  <option value="week">Minggu</option>
                  <option value="month">Bulan</option>
                  <option value="year">Tahun</option>
                </select>
              </Col>
            )}
            <Col md={1} className="mb-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={handleApplyFilters}
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #3498db 0%, #2c3e50 100%)",
                  border: "none",
                  letterSpacing: "1.3px",
                  fontWeight: "600",
                  fontSize: "0.8rem",
                }}
              >
                <i className="ri-filter-3-line me-1"></i> Terapkan
              </button>
            </Col>
          </Row>
          {filterType === "custom" && (
            <Row className="mt-3">
              <Col md={6} className="mb-3">
                <label className="form-label fw-bold">Tanggal Mulai</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  disabled={loading}
                  style={{ borderRadius: "8px", borderColor: "#e0e0e0" }}
                />
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label fw-bold">Tanggal Akhir</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  disabled={loading}
                  style={{ borderRadius: "8px", borderColor: "#e0e0e0" }}
                />
              </Col>
            </Row>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="alert alert-danger mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <motion.div
          className="text-center py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Memuat data nutrisi...</p>
        </motion.div>
      ) : dailyFeeds.length === 0 ? (
        <motion.div
          className="alert alert-warning text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="ri-error-warning-line me-2"></i>
          Tidak ada data jadwal pakan tersedia untuk rentang tanggal yang dipilih.
        </motion.div>
      ) : !selectedCow ? (
        <motion.div
          className="alert alert-info text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="ri-information-line me-2"></i>
          Silakan pilih sapi untuk melihat ringkasan nutrisi.
        </motion.div>
      ) : nutritionSummary.periods.length === 0 ? (
        <motion.div
          className="alert alert-warning text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="ri-error-warning-line me-2"></i>
          Tidak ada data nutrisi tersedia untuk sapi yang dipilih pada rentang tanggal ini.
        </motion.div>
      ) : (
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Col xl={12}>
            <Card
              className="shadow-sm border-0"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                overflowX: "auto",
              }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title text-gray-800 fw-bold">
                    Ringkasan Nutrisi untuk{" "}
                    {uniqueCows.find((cow) => cow.id === parseInt(selectedCow))?.name}
                  </h5>
                  <div>
                    <Button
                      variant="outline-secondary"
                      onClick={handleZoomIn}
                      className="me-2"
                      style={{ borderRadius: "8px", padding: "4px 8px" }}
                      disabled={barCount <= 3}
                    >
                      <i className="ri-zoom-in-line"></i> +
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={handleZoomOut}
                      style={{ borderRadius: "8px", padding: "4px 8px" }}
                      disabled={barCount >= chartData.categories.length}
                    >
                      <i className="ri-zoom-out-line"></i> –
                    </Button>
                  </div>
                </div>
                <div
                  style={{
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    position: "relative",
                    minWidth: "100%",
                  }}
                >
                  <div
                    style={{
                      minWidth: `${Math.max(1000, chartData.categories.length * 150)}px`,
                    }}
                  >
                    <ReactApexChart
                      ref={chartRef}
                      options={chartOptions}
                      series={chartData.series}
                      type="bar"
                      height={400}
                      width="100%"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h6 className="mb-3 text-gray-800 fw-bold">Detail Data Nutrisi</h6>
                  <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Nutrisi</th>
                          {nutritionSummary.periods.map((period, index) => (
                            <th key={index}>{period.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {nutritionSummary.nutrients.map((nutrient, index) => (
                          <tr key={index}>
                            <td>{`${nutrient.name} (${nutrient.unit})`}</td>
                            {nutritionSummary.periods.map((period, pIndex) => (
                              <td key={pIndex}>
                                {formatNumber(period.nutrients[nutrient.key] || 0)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NutritionSummaryPage;