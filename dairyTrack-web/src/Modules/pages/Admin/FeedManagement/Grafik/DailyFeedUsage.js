import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import ReactApexChart from "react-apexcharts";
import { getFeedUsageByDate } from "../../../../controllers/feedItemController";
import { listFeedTypes } from "../../../../controllers/feedTypeController";
import { listNutritions } from "../../../../controllers/nutritionController";

const FeedUsageChartPage = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [feedUsageData, setFeedUsageData] = useState([]);
  const [nutritionCount, setNutritionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filterType, setFilterType] = useState("custom");
  const [intervalType, setIntervalType] = useState("day");
  const [barCount, setBarCount] = useState(7);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chartRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [feedTypesResponse, feedUsageResponse] = await Promise.all([
        listFeedTypes(),
        getFeedUsageByDate({
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        }),
      ]);

      if (feedTypesResponse.success && feedTypesResponse.feedTypes) {
        setFeedTypes(feedTypesResponse.feedTypes);
      } else {
        setFeedTypes([]);
      }

      if (feedUsageResponse.success && Array.isArray(feedUsageResponse.data)) {
        // Less strict filtering to include all data within the year
        const filteredData = feedUsageResponse.data.filter((item) => {
          const itemDate = new Date(item.date);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          // Normalize dates to start of day
          itemDate.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999); // Include end of day
          return itemDate >= startDate && itemDate <= endDate;
        });
        setFeedUsageData(filteredData);
        if (filteredData.length === 0) {
          setError("Tidak ada data penggunaan pakan untuk rentang tanggal ini.");
        }
      } else {
        setFeedUsageData([]);
        setError("Gagal memuat data penggunaan pakan.");
      }
    } catch (err) {
      setError(err.message || "Gagal memuat data penggunaan pakan.");
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: err.message || "Terjadi kesalahan saat memuat data.",
      });
      setFeedTypes([]);
      setFeedUsageData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNutritions = async () => {
      const response = await listNutritions();
      if (response.success && response.nutritions) {
        setNutritionCount(response.nutritions.length);
      } else {
        setNutritionCount(0);
      }
    };

    fetchNutritions();
    fetchData();
    return () => {
      setFeedUsageData([]);
    };
  }, [dateRange.startDate, dateRange.endDate]);

  const activeFeeds = useMemo(() => {
    const allFeedNames = [
      ...new Set(
        feedUsageData.flatMap((day) => day.feeds.map((feed) => feed.feed_name))
      ),
    ];
    return allFeedNames.slice(0, 5);
  }, [feedUsageData]);

  const uniqueFeedTypesCount = feedTypes.length;
  const uniqueConsumedFeedsCount = useMemo(() => {
    return feedUsageData.length > 0
      ? new Set(feedUsageData.flatMap((day) => day.feeds.map((feed) => feed.feed_id))).size
      : 0;
  }, [feedUsageData]);
  const totalFeedQuantity = useMemo(() => {
    return feedUsageData.length > 0
      ? feedUsageData
          .reduce((sum, day) => {
            return sum + day.feeds.reduce((daySum, feed) => daySum + parseFloat(feed.quantity_kg || 0), 0);
          }, 0)
          .toFixed(1)
      : "0.0";
  }, [feedUsageData]);

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
        end = new Date(today.setDate(today.getDate() + (6 - today.getDay()))).toISOString().split("T")[0];
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

  const getISOWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const chartData = useMemo(() => {
    if (!feedUsageData || feedUsageData.length === 0 || activeFeeds.length === 0) {
      return { dates: [], series: [] };
    }

    const { start, end } = getDateRange();
    // Less strict filtering to include all data within the year
    const filteredData = feedUsageData.filter((item) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(start);
      const endDate = new Date(end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate && itemDate <= endDate;
    });

    if (filteredData.length === 0) {
      return { dates: [], series: [] };
    }

    const groupByInterval = (data, interval) => {
      const grouped = {};
      data.forEach((item) => {
        const itemDate = new Date(item.date);
        let key;
        switch (interval) {
          case "day":
            key = itemDate.toISOString().split("T")[0];
            break;
          case "week":
            key = getISOWeek(itemDate);
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
        if (!grouped[key]) {
          grouped[key] = [];
        }
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
        .map(([date, items]) => ({
          date,
          feedData: activeFeeds.map((feedName) =>
            items.reduce((sum, day) => {
              const feed = day.feeds.find((f) => f.feed_name === feedName);
              return sum + (feed ? parseFloat(feed.quantity_kg || 0) : 0);
            }, 0)
          ),
        }));
    };

    let groupedData;
    if (filterType === "year") {
      const year = new Date(start).getFullYear();
      groupedData = Array.from({ length: 12 }, (_, i) => {
        const monthStart = new Date(year, i, 1);
        const monthEnd = new Date(year, i + 1, 0);
        monthStart.setHours(0, 0, 0, 0);
        monthEnd.setHours(23, 59, 59, 999);
        const monthData = filteredData.filter((item) => {
          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate >= monthStart && itemDate <= monthEnd;
        });
        return {
          date: monthStart.toLocaleString("id-ID", { month: "long" }),
          feedData: activeFeeds.map((feedName) =>
            monthData.reduce((sum, day) => {
              const feed = day.feeds.find((f) => f.feed_name === feedName);
              return sum + (feed ? parseFloat(feed.quantity_kg || 0) : 0);
            }, 0)
          ),
        };
      });
    } else if (filterType === "today") {
      groupedData = groupByInterval(filteredData, "day");
    } else if (filterType === "week") {
      groupedData = groupByInterval(filteredData, "day");
    } else if (filterType === "month") {
      groupedData = groupByInterval(filteredData, "week");
    } else {
      groupedData = groupByInterval(filteredData, intervalType);
    }

    const dates = groupedData.map((item) => item.date);
    const nonZeroSeries = activeFeeds.map((feedName, index) => {
      const data = groupedData.map((item) => {
        const value = item.feedData[index];
        return value > 0 ? parseFloat(value.toFixed(1)) : null;
      });
      return data.length > 0 ? { name: feedName, data } : null;
    }).filter((series) => series !== null);

    return {
      dates,
      series: nonZeroSeries,
    };
  }, [feedUsageData, filterType, dateRange, activeFeeds, intervalType]);

  const barChartOptions = useMemo(() => {
    const visibleBars = Math.min(barCount, chartData.dates.length);

    return {
      series: chartData.series,
      chart: {
        height: isFullScreen ? 600 : 400,
        type: "bar",
        toolbar: { show: false },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
          zoomedArea: {
            fill: {
              color: "#90CAF9",
              opacity: 0.4,
            },
            stroke: {
              color: "#0D47A1",
              opacity: 0.4,
              width: 1,
            },
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
            if (chartData.dates.length > 0) {
              const totalBars = chartData.dates.length;
              const minX = 0;
              const maxX = Math.min(visibleBars - 1, totalBars - 1);
              chart.updateOptions({
                xaxis: {
                  min: minX,
                  max: maxX,
                },
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
      dataLabels: {
        enabled: true,
        formatter: (val) => (val !== null ? val.toFixed(1) : "0.0"),
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#333"],
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      colors: ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6c757d"],
      xaxis: {
        categories: chartData.dates,
        labels: {
          rotate: -45,
          style: {
            fontSize: "12px",
            fontWeight: 500,
            colors: "#333",
          },
          formatter: (value) => {
            if (intervalType === "day") {
              return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
            } else if (intervalType === "week") {
              return `Minggu ${value.split("-W")[1]}`;
            } else if (intervalType === "month") {
              return new Date(`${value}-01`).toLocaleString("id-ID", { month: "short" });
            }
            return value;
          },
        },
      },
      yaxis: {
        forceNiceScale: true,
        min: 0,
        max: Math.max(...chartData.series.flatMap((s) => s.data.filter(val => val !== null)), 0) * 1.2 || 10,
        title: {
          text: undefined,
        },
        labels: {
          formatter: (val) => (val !== null ? val.toFixed(1) : "0.0"),
          style: {
            fontSize: "12px",
            colors: "#333",
          },
        },
      },
      title: {
        text: "Jumlah Pakan (kg)",
        align: "left",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          color: "#333",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val) => (val !== null ? `${val.toFixed(1)} kg` : "0.0 kg"),
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const date = w.globals.categoryLabels[dataPointIndex];
          const feedName = w.globals.seriesNames[seriesIndex];
          const value = series[seriesIndex][dataPointIndex];
          return `<div class="arrow_box">
            <span>${date}</span><br/>
            <span>${feedName}: ${value !== null ? value.toFixed(1) : "0.0"} kg</span>
          </div>`;
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        fontSize: "14px",
        fontWeight: 500,
        labels: {
          colors: "#333",
        },
      },
      grid: {
        borderColor: "#eee",
      },
    };
  }, [chartData, barCount, isFullScreen, intervalType]);

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
            endDate: new Date(today.setDate(today.getDate() + (6 - today.getDay()))).toISOString().split("T")[0],
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

  const handleZoomIn = () => {
    if (chartRef.current && chartData.dates.length > 0) {
      const newBarCount = Math.max(barCount - 2, 3);
      setBarCount(newBarCount);
      const totalBars = chartData.dates.length;
      const minX = 0;
      const maxX = Math.min(newBarCount - 1, totalBars - 1);
      chartRef.current.chart.updateOptions({
        xaxis: { min: minX, max: maxX },
      });
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current && chartData.dates.length > 0) {
      const newBarCount = Math.min(barCount + 2, chartData.dates.length);
      setBarCount(newBarCount);
      const totalBars = chartData.dates.length;
      const minX = 0;
      const maxX = Math.min(newBarCount - 1, totalBars - 1);
      chartRef.current.chart.updateOptions({
        xaxis: { min: minX, max: maxX },
      });
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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
          <h2 className="text-xl font-bold text-gray-800">Dashboard Penggunaan Pakan</h2>
          <p className="text-muted">Ringkasan penggunaan pakan ternak harian</p>
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

      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Jumlah Jenis Pakan</h6>
                  <h2 className="mt-2 mb-0">{uniqueFeedTypesCount}</h2>
                </div>
                <div>
                  <i className="fas fa-boxes fa-3x opacity-50"></i>
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
                  <h6 className="card-title mb-0">Jumlah Pakan</h6>
                  <h2 className="mt-2 mb-0">{uniqueConsumedFeedsCount}</h2>
                </div>
                <div>
                  <i className="fas fa-box-open fa-3x opacity-50"></i>
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
                  <h6 className="card-title mb-0">Total Konsumsi Pakan</h6>
                  <h2 className="mt-2 mb-0">{totalFeedQuantity} kg</h2>
                </div>
                <div>
                  <i className="fas fa-weight fa-3x opacity-50"></i>
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
                  <h6 className="card-title mb-0">Jumlah Nutrisi</h6>
                  <h2 className="mt-2 mb-0">{nutritionCount}</h2>
                </div>
                <div>
                  <i className="fas fa-leaf fa-3x opacity-50"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label fw-bold">Tipe Filter</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                }}
                disabled={loading}
                style={{ borderRadius: "8px", borderColor: "#e0e0e0" }}
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="custom">Kustom</option>
              </select>
            </div>
            {filterType === "custom" && (
              <>
                <div className="col-md-2 mb-3">
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
                </div>
                <div className="col-md-3 mb-3">
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
                </div>
                <div className="col-md-3 mb-3">
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
                </div>
              </>
            )}
            <div className="col-md-1 mb-3 d-flex align-items-end">
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
            </div>
          </div>
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
          <p className="mt-3 text-muted">Memuat data penggunaan pakan...</p>
        </motion.div>
      ) : feedUsageData.length === 0 ? (
        <motion.div
          className="alert alert-warning text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="ri-error-warning-line me-2"></i>
          Tidak ada data penggunaan pakan tersedia untuk rentang tanggal yang dipilih.
        </motion.div>
      ) : (
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="col-xl-12">
            <Card
              className="shadow-sm border-0"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title text-gray-800 fw-bold">
                    Penggunaan Pakan Harian
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
                      disabled={barCount >= chartData.dates.length}
                    >
                      <i className="ri-zoom-out-line"></i> –
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={toggleFullScreen}
                      className="ms-2"
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="ri-fullscreen-line"></i> {isFullScreen ? "Keluar" : "Full Screen"}
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
                      minWidth: `${Math.max(1000, chartData.dates.length * 150)}px`,
                    }}
                  >
                    <ReactApexChart
                      ref={chartRef}
                      options={barChartOptions}
                      series={barChartOptions.series}
                      type="bar"
                      height={barChartOptions.chart.height}
                      width="100%"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FeedUsageChartPage;