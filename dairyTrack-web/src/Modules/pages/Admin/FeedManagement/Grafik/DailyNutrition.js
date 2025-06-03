import React, { useState, useEffect, useMemo } from "react";
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
        setDailyFeeds(response.data);
      } else {
        console.error("Unexpected response:", response);
        setDailyFeeds([]);
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

  // Extract unique cows for dropdown
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
      endDate.setHours(0, 0, 0, 0);
      return feed.cow_id === parseInt(selectedCow) && feedDate >= startDate && feedDate <= endDate;
    });

    let periods = [];
    const nutrientMap = new Map(); // To track all unique nutrients and their units

    if (filterType === "week" || filterType === "today" || filterType === "custom") {
      // Daily grouping
      const current = new Date(start);
      while (current <= new Date(end)) {
        const dayData = filteredFeeds.filter((feed) => {
          const feedDate = new Date(feed.date);
          return feedDate.toDateString() === current.toDateString();
        });

        const dailyNutrients = {};
        dayData.forEach((feed) => {
          feed.items.forEach((item) => {
            item.nutrients.forEach((nutrient) => {
              const key = `${nutrient.nutrisi_name}-${nutrient.unit}`;
              if (!nutrientMap.has(key)) {
                nutrientMap.set(key, { name: nutrient.nutrisi_name, unit: nutrient.unit });
              }
              if (!dailyNutrients[key]) dailyNutrients[key] = 0;
              dailyNutrients[key] += parseFloat(nutrient.amount || 0);
            });
          });
        });

        periods.push({
          label: current.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
          nutrients: dailyNutrients,
        });
        current.setDate(current.getDate() + 1);
      }
    } else if (filterType === "month") {
      // Weekly grouping
      let current = new Date(start);
      const endDate = new Date(end);

      while (current <= endDate) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekData = filteredFeeds.filter((feed) => {
          const feedDate = new Date(feed.date);
          return feedDate >= weekStart && feedDate <= (weekEnd <= endDate ? weekEnd : endDate);
        });

        const weeklyNutrients = {};
        weekData.forEach((feed) => {
          feed.items.forEach((item) => {
            item.nutrients.forEach((nutrient) => {
              const key = `${nutrient.nutrisi_name}-${nutrient.unit}`;
              if (!nutrientMap.has(key)) {
                nutrientMap.set(key, { name: nutrient.nutrisi_name, unit: nutrient.unit });
              }
              if (!weeklyNutrients[key]) weeklyNutrients[key] = 0;
              weeklyNutrients[key] += parseFloat(nutrient.amount || 0);
            });
          });
        });

        periods.push({
          label: `${weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`,
          nutrients: weeklyNutrients,
        });

        current.setDate(current.getDate() + 7);
      }
    } else if (filterType === "year") {
      // Monthly grouping
      const year = new Date(start).getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthStart = new Date(year, i, 1);
        const monthEnd = new Date(year, i + 1, 0);
        const monthData = filteredFeeds.filter((feed) => {
          const feedDate = new Date(feed.date);
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

        return {
          label: monthStart.toLocaleString("id-ID", { month: "short", year: "numeric" }),
          nutrients: monthlyNutrients,
        };
      });

      periods = months;
    }

    // Convert nutrientMap to array of nutrients
    const nutrients = Array.from(nutrientMap.entries()).map(([key, value]) => ({
      key,
      name: value.name,
      unit: value.unit,
    }));

    return { periods, nutrients };
  }, [dailyFeeds, selectedCow, filterType, dateRange]);

  // Prepare chart data for grouped bar chart
  const chartData = useMemo(() => {
    const { periods, nutrients } = nutritionSummary;
    if (periods.length === 0 || nutrients.length === 0) return { series: [], categories: [] };

    const series = nutrients.map((nutrient) => ({
      name: `${nutrient.name} (${nutrient.unit})`,
      data: periods.map((period) => {
        const value = period.nutrients[nutrient.key] || 0;
        return value.toFixed(2);
      }),
    }));

    const categories = periods.map((period) => period.label);

    return { series, categories };
  }, [nutritionSummary]);

  const chartOptions = useMemo(() => ({
    chart: {
      height: 400,
      type: "bar",
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      zoom: {
        enabled: true,
        type: "xy",
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
      pan: {
        enabled: true,
        mode: "xy",
      },
      width: "100%", // Ensure chart stays within container
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 6,
      },
    },
    colors: ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6c757d", "#ff69b4", "#20c997"],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
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
    xaxis: {
      categories: chartData.categories,
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
        text: "Jumlah Nutrisi",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          color: "#333",
        },
      },
      labels: {
        formatter: (val) => `${val}`,
      },
    },
    fill: {
      opacity: 0.9,
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
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          const nutrient = nutritionSummary.nutrients[seriesIndex];
          return `${val} ${nutrient.unit}`;
        },
      },
    },
    grid: {
      borderColor: "#eee",
    },
  }), [chartData, nutritionSummary]);

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
          <Row>
            <Col md={4} className="mb-3">
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
            <Col md={4} className="mb-3">
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
            </Col>
            {filterType === "custom" && (
              <>
                <Col md={4} className="mb-3">
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
                <Col md={4} className="mb-3">
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
              </>
            )}
            <Col md={2} className="mb-3 d-flex align-items-end">
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
            </Col>
          </Row>
        </div>
      </motion.div>

      {/* Nutrition Summary Section */}
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
              }}
            >
              <div className="card-body">
                <h5 className="card-title mb-4 text-gray-800 fw-bold">
                  Ringkasan Nutrisi untuk {uniqueCows.find((cow) => cow.id === parseInt(selectedCow))?.name}
                </h5>
                <div id="nutrition-chart">
                  <ReactApexChart
                    options={chartOptions}
                    series={chartData.series}
                    type="bar"
                    height={400}
                  />
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
                                {(period.nutrients[nutrient.key] || 0).toFixed(2)}
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