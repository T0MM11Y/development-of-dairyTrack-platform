import React, { useState, useEffect, useMemo } from "react";
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
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filterType, setFilterType] = useState("custom");

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

      // Handle feed types
      if (feedTypesResponse.success && feedTypesResponse.feedTypes) {
        setFeedTypes(feedTypesResponse.feedTypes);
      } else {
        console.error("Unexpected feed types response:", feedTypesResponse);
        setFeedTypes([]);
      }

      // Handle feed usage data
      if (feedUsageResponse.success && Array.isArray(feedUsageResponse.data)) {
        const filteredData = feedUsageResponse.data.filter((item) => {
          const itemDate = new Date(item.date);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);

          itemDate.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          return itemDate >= startDate && itemDate <= endDate;
        });

        console.log("Filtered feedUsageData:", filteredData); // Debugging
        setFeedUsageData(filteredData);

        if (filteredData.length === 0 && feedUsageResponse.data.length > 0) {
          console.warn("Data received but none matched the date filter");
        }
      } else {
        console.error("Unexpected feed usage response:", feedUsageResponse);
        setFeedUsageData([]);
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
        console.error("Failed to fetch nutritions:", response.message);
        setNutritionCount(0);
      }
    };

    fetchNutritions();
    fetchData();
    return () => {
      setFeedUsageData([]);
    };
  }, [dateRange.startDate, dateRange.endDate]);

  // Dynamically determine feed names from API response (up to 5 feeds)
  const activeFeeds = useMemo(() => {
    const allFeedNames = [
      ...new Set(
        feedUsageData.flatMap((day) => day.feeds.map((feed) => feed.feed_name))
      ),
    ];
    return allFeedNames.slice(0, 5);
  }, [feedUsageData]);

  // Calculate metrics for cards
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
          .toFixed(2)
      : "0.00";
  }, [feedUsageData]);

  // Helper function to get date range for filters
  const getDateRange = () => {
    const today = new Date();
    let start, end;

    switch (filterType) {
      case "today":
        start = end = today.toISOString().split("T")[0];
        break;
      case "week":
        start = new Date(today.setDate(today.getDate() - today.getDay()))
          .toISOString()
          .split("T")[0];
        end = new Date(today.setDate(today.getDate() + (6 - today.getDay())))
          .toISOString()
          .split("T")[0];
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        end = new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0];
        break;
      case "custom":
        start = dateRange.startDate;
        end = dateRange.endDate;
        break;
      default:
        start = end = today.toISOString().split("T")[0];
    }

    console.log("getDateRange:", { start, end }); // Debugging
    return { start, end };
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!feedUsageData || feedUsageData.length === 0 || activeFeeds.length === 0) {
      console.log("chartData: feedUsageData or activeFeeds kosong"); // Debugging
      return { dates: [], series: [] };
    }

    const { start, end } = getDateRange();
    const filteredData = feedUsageData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(start) && itemDate <= new Date(end);
    });

    console.log("chartData filteredData:", filteredData); // Debugging

    if (filterType === "week") {
      // Daily totals for the current week
      const days = [];
      const current = new Date(start);
      while (current <= new Date(end)) {
        const dayData = filteredData.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === current.toDateString();
        });
        const feedData = activeFeeds.map((feedName) => {
          const total = dayData.reduce((sum, day) => {
            const feed = day.feeds.find((f) => f.feed_name === feedName);
            return sum + (feed ? parseFloat(feed.quantity_kg || 0) : 0);
          }, 0);
          return total > 0 ? total : null; // Exclude zero values
        });
        if (feedData.some((val) => val !== null)) {
          days.push({
            date: current.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            feedData,
          });
        }
        current.setDate(current.getDate() + 1);
      }

      const nonZeroSeries = activeFeeds.map((feedName, index) => {
        const data = days.map((day) => {
          const value = day.feedData[index];
          return value !== null ? value : null;
        }).filter((val) => val !== null);
        return data.length > 0 ? { name: feedName, data } : null;
      }).filter((series) => series !== null);

      return {
        dates: days.map((day) => day.date),
        series: nonZeroSeries,
      };
    } else if (filterType === "month") {
      // Weekly totals for the current month
      const weeks = [];
      let current = new Date(start);
      const endDate = new Date(end);

      while (current <= endDate) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekData = filteredData.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= weekStart && itemDate <= (weekEnd <= endDate ? weekEnd : endDate);
        });

        const feedData = activeFeeds.map((feedName) => {
          const total = weekData.reduce((sum, day) => {
            const feed = day.feeds.find((f) => f.feed_name === feedName);
            return sum + (feed ? parseFloat(feed.quantity_kg || 0) : 0);
          }, 0);
          return total > 0 ? total : null; // Exclude zero values
        });

        if (feedData.some((val) => val !== null)) {
          weeks.push({
            date: `${weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`,
            feedData,
          });
        }

        current.setDate(current.getDate() + 7);
      }

      const nonZeroSeries = activeFeeds.map((feedName, index) => {
        const data = weeks.map((week) => {
          const value = week.feedData[index];
          return value !== null ? value : null;
        }).filter((val) => val !== null);
        return data.length > 0 ? { name: feedName, data } : null;
      }).filter((series) => series !== null);

      return {
        dates: weeks.map((week) => week.date),
        series: nonZeroSeries,
      };
    } else if (filterType === "year") {
      // Monthly totals for the current year
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthStart = new Date(new Date(start).getFullYear(), i, 1);
        const monthEnd = new Date(new Date(start).getFullYear(), i + 1, 0);
        const monthData = filteredData.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= monthStart && itemDate <= monthEnd;
        });

        const feedData = activeFeeds.map((feedName) => {
          const total = monthData.reduce((sum, day) => {
            const feed = day.feeds.find((f) => f.feed_name === feedName);
            return sum + (feed ? parseFloat(feed.quantity_kg || 0) : 0);
          }, 0);
          return total > 0 ? total : null; // Exclude zero values
        });

        return {
          date: monthStart.toLocaleString("id-ID", { month: "short", year: "numeric" }),
          feedData,
        };
      });

      const validMonths = months.filter((month) =>
        month.feedData.some((val) => val !== null)
      );

      const nonZeroSeries = activeFeeds.map((feedName, index) => {
        const data = validMonths.map((month) => {
          const value = month.feedData[index];
          return value !== null ? value : null;
        }).filter((val) => val !== null);
        return data.length > 0 ? { name: feedName, data } : null;
      }).filter((series) => series !== null);

      return {
        dates: validMonths.map((month) => month.date),
        series: nonZeroSeries,
      };
    } else {
      // Daily totals for today or custom range
      const dailyData = filteredData.map((dateEntry) => {
        const date = dateEntry.date;
        const feedMap = new Map();
        dateEntry.feeds.forEach((feed) => {
          feedMap.set(feed.feed_name, parseFloat(feed.quantity_kg) || 0);
        });
        return {
          date,
          feedData: activeFeeds.map((feedName) => feedMap.get(feedName) || 0),
        };
      });

      const nonZeroSeries = activeFeeds.map((feedName) => {
        const data = dailyData.map((day) => {
          const index = activeFeeds.indexOf(feedName);
          const value = day.feedData[index];
          return value > 0 ? value : null; // Exclude zero values
        }).filter((val) => val !== null);
        return data.length > 0 ? { name: feedName, data } : null;
      }).filter((series) => series !== null);

      return {
        dates: dailyData.map((item) =>
          new Date(item.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        ),
        series: nonZeroSeries,
      };
    }
  }, [feedUsageData, filterType, dateRange, activeFeeds]);

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

    // Set date range based on filterType if not custom
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
            startDate: new Date(today.setDate(today.getDate() - today.getDay()))
              .toISOString()
              .split("T")[0],
            endDate: new Date(today.setDate(today.getDate() + (6 - today.getDay())))
              .toISOString()
              .split("T")[0],
          };
          break;
        case "month":
          newDateRange = {
            startDate: new Date(today.getFullYear(), today.getMonth(), 1)
              .toISOString()
              .split("T")[0],
            endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0)
              .toISOString()
              .split("T")[0],
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

    console.log("Applying filters:", { dateRange: newDateRange, filterType }); // Debugging
    fetchData();
  };

  const barChartOptions = useMemo(() => {
    if (!chartData || chartData.dates.length === 0 || chartData.series.length === 0) {
      console.log("barChartOptions: chartData kosong"); // Debugging
      return {
        series: [],
        chart: {
          height: 400,
          type: "bar",
          toolbar: { show: false },
        },
        xaxis: {
          categories: [],
        },
      };
    }

    console.log("barChartOptions series:", chartData.series); // Debugging

    return {
      series: chartData.series,
      chart: {
        height: 400,
        type: "bar",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val} kg`,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
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
        },
      },
      yaxis: {
        title: {
          text: "Jumlah Pakan (kg)",
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        labels: {
          formatter: (val) => `${val} kg`,
          style: {
            fontSize: "12px",
            colors: "#333",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} kg`,
        },
        style: {
          fontSize: "12px",
        },
        marker: {
          show: true,
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
  }, [chartData]);

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

      {/* Stats Cards */}
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

      {/* Filter Section */}
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
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Tipe Filter</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => {
                  console.log("Selected Filter Type:", e.target.value); // Debugging
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
                <div className="col-md-4 mb-3">
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
                <div className="col-md-4 mb-3">
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
            <div className="col-md-2 mb-3 d-flex align-items-end">
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
                <i className="ri-filter-3-line me-1"></i> Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Section */}
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
              }}
            >
              <div className="card-body">
                <h5 className="card-title mb-4 text-gray-800 fw-bold">
                  Penggunaan Pakan Harian
                </h5>
                <div id="feed-usage-chart">
                  <ReactApexChart
                    options={barChartOptions}
                    series={barChartOptions.series}
                    type="bar"
                    height={400}
                  />
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