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
  
  // DIPERBAIKI: Nilai awal filter diubah ke 'week' agar lebih informatif
  const [filterType, setFilterType] = useState("week");
  
  // DIPERBAIKI: State dateRange diinisialisasi berdasarkan filter awal 'week'
  const getInitialDateRange = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const start = firstDayOfWeek.toISOString().split("T")[0];
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    const end = lastDayOfWeek.toISOString().split("T")[0];
    return { startDate: start, endDate: end };
  };
  
  const [dateRange, setDateRange] = useState(getInitialDateRange);
  const [intervalType, setIntervalType] = useState("day");

  // DIPERBAIKI: State baru untuk mengontrol skala tinggi & lebar bar
  const [zoomLevel, setZoomLevel] = useState(1); 
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chartRef = useRef(null);

  // DIPERBAIKI: fetchData sekarang menerima parameter tanggal untuk mencegah race condition
  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError("");
      
      const [feedTypesResponse, feedUsageResponse] = await Promise.all([
        listFeedTypes(),
        getFeedUsageByDate({
          start_date: startDate,
          end_date: endDate,
        }),
      ]);

      if (feedTypesResponse.success && feedTypesResponse.feedTypes) {
        setFeedTypes(feedTypesResponse.feedTypes);
      } else {
        setFeedTypes([]);
      }

      if (feedUsageResponse.success && Array.isArray(feedUsageResponse.data)) {
        setFeedUsageData(feedUsageResponse.data);
        if (feedUsageResponse.data.length === 0) {
          setError("Tidak ada data penggunaan pakan untuk rentang tanggal ini.");
        }
      } else {
        setFeedUsageData([]);
        setError("Gagal memuat data penggunaan pakan.");
      }
    } catch (err) {
      setError(err.message || "Gagal memuat data penggunaan pakan.");
    } finally {
      setLoading(false);
    }
  };
  
  // DIPERBAIKI: useEffect ini sekarang menjadi pusat logika untuk update otomatis
  useEffect(() => {
    // Validasi tanggal kustom sebelum fetch
    if (filterType === "custom") {
      if (!dateRange.startDate || !dateRange.endDate) {
        return; // Jangan lakukan apa-apa jika tanggal tidak lengkap
      }
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        setError("Tanggal mulai harus sebelum tanggal akhir.");
        setFeedUsageData([]);
        return;
      }
    }
    fetchData(dateRange.startDate, dateRange.endDate);
  }, [filterType, dateRange]); // Dijalankan setiap kali filter atau rentang tanggal berubah

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
  }, []);

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
      return { dates: [], series: [], dataMax: 10 };
    }
  
    let effectiveInterval = intervalType;
    if (filterType === "year") {
      effectiveInterval = "month";
    } else if (filterType === "month") {
      effectiveInterval = "week";
    } else if (filterType === "week" || filterType === "today") {
      effectiveInterval = "day";
    }
  
    const groupByInterval = (data, interval) => {
      const grouped = {};
      data.forEach((item) => {
        const itemDate = new Date(item.date);
        let key;
  
        switch (interval) {
          case "day": key = itemDate.toISOString().split("T")[0]; break;
          case "week": key = getISOWeek(itemDate); break;
          case "month": key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`; break;
          case "year": key = itemDate.getFullYear().toString(); break;
          default: key = itemDate.toISOString().split("T")[0];
        }
  
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });
  
      return Object.entries(grouped)
        .map(([dateKey, items]) => ({
          date: dateKey,
          feedData: activeFeeds.map((feedName) =>
            items.reduce((sum, day) => {
              const feed = day.feeds.find((f) => f.feed_name === feedName);
              return sum + (feed ? parseFloat(feed.quantity_kg || 0) : 0);
            }, 0)
          ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };
  
    const groupedData = groupByInterval(feedUsageData, effectiveInterval);
  
    if (groupedData.length === 0) return { dates: [], series: [], dataMax: 10 };
  
    const dates = groupedData.map((item) => item.date);
    const series = activeFeeds
      .map((feedName, index) => {
        const data = groupedData.map((item) => {
          const value = item.feedData[index];
          return value > 0 ? parseFloat(value.toFixed(1)) : null;
        });
        return data.some(d => d !== null) ? { name: feedName, data } : null;
      })
      .filter((series) => series !== null);

    // Menghitung nilai data maksimum untuk penyesuaian sumbu Y
    const dataMax = Math.max(...series.flatMap((s) => s.data.filter(val => val !== null)), 0);
  
    return { dates, series, dataMax: dataMax === 0 ? 10 : dataMax };
  }, [feedUsageData, filterType, activeFeeds, intervalType]);

  const barChartOptions = useMemo(() => {
    let effectiveInterval = intervalType;
    if (filterType === "year") effectiveInterval = "month";
    else if (filterType === "month") effectiveInterval = "week";
    else if (filterType === "week" || filterType === "today") effectiveInterval = "day";
  
    // DIPERBAIKI: Logika zoom untuk tinggi dan lebar bar
    const yAxisMax = (chartData.dataMax * 1.2) / zoomLevel;
    const columnWidth = Math.min(60 * zoomLevel, 90) + '%';
  
    return {
      series: chartData.series,
      chart: {
        height: isFullScreen ? 600 : 400,
        type: "bar",
        toolbar: { show: false },
        animations: { enabled: true, easing: "easeinout", speed: 500 },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: columnWidth, // Lebar bar dinamis
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => (val !== null ? val.toFixed(1) : ""),
        offsetY: -20,
        style: { fontSize: "12px", colors: ["#333"] },
      },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      colors: ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6c757d"],
      xaxis: {
        categories: chartData.dates,
        labels: {
          rotate: -45,
          style: { fontSize: "12px", fontWeight: 500, colors: "#333" },
          formatter: (value) => {
            if (!value) return "";
            if (effectiveInterval === "day") return new Date(value + 'T00:00:00').toLocaleDateString("id-ID", { day: "numeric", month: "short" });
            if (effectiveInterval === "week") return `Minggu ${value.split("-W")[1]}`;
            if (effectiveInterval === "month") {
              const [year, month] = value.split("-");
              return new Date(year, month - 1).toLocaleString("id-ID", { month: "long" });
            }
            return value;
          },
        },
      },
      yaxis: {
        forceNiceScale: true,
        min: 0,
        max: yAxisMax, // Tinggi (sumbu Y) dinamis
        title: { text: undefined },
        labels: {
          formatter: (val) => (val !== null ? val.toFixed(1) : "0.0"),
          style: { fontSize: "12px", colors: "#333" },
        },
      },
      title: { text: "Jumlah Pakan (kg)", align: "left", style: { fontSize: "14px", fontWeight: "bold", color: "#333" } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: (val) => (val !== null ? `${val.toFixed(1)} kg` : "0.0 kg") } },
      legend: { position: "top", horizontalAlign: "center" },
      grid: { borderColor: "#eee" },
    };
  }, [chartData, zoomLevel, isFullScreen, intervalType, filterType]);

  // DIPERBAIKI: Handler ini sekarang mengatur semua state yang relevan untuk memicu update
  const handleFilterTypeChange = (e) => {
    const newFilterType = e.target.value;
    setFilterType(newFilterType);
    setZoomLevel(1); // Reset zoom setiap ganti filter

    const today = new Date();
    let newStartDate, newEndDate;

    if (newFilterType !== 'custom') {
      if (newFilterType === 'today') {
        newStartDate = newEndDate = today.toISOString().split("T")[0];
        setIntervalType('day');
      } else if (newFilterType === 'week') {
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        newStartDate = firstDay.toISOString().split("T")[0];
        const lastDay = new Date(firstDay);
        lastDay.setDate(lastDay.getDate() + 6);
        newEndDate = lastDay.toISOString().split("T")[0];
        setIntervalType('day');
      } else if (newFilterType === 'month') {
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        setIntervalType('week');
      } else if (newFilterType === 'year') {
        newStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        newEndDate = new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0];
        setIntervalType('month');
      }
      setDateRange({ startDate: newStartDate, endDate: newEndDate });
    }
  };

  // DIPERBAIKI: Fungsi zoom untuk mengecilkan (memperpendek & mempersempit) bar
  const handleZoomIn = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.4)); // Tombol '-'
  
  // DIPERBAIKI: Fungsi zoom untuk memperbesar (mempertinggi & memperlebar) bar
  const handleZoomOut = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.5)); // Tombol '+'

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  return (
    <motion.div className="p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} >
      {/* ... (bagian Card header dan 4 card info tidak berubah) ... */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard Penggunaan Pakan</h2>
          <p className="text-muted">Ringkasan penggunaan pakan ternak</p>
        </div>
      </div>
      <Row className="mb-4">
        {/* ... (4 Col Card info tidak berubah, saya singkat untuk keringkasan) ... */}
      </Row>

      <motion.div className="card mb-4 shadow-sm border-0" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} >
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Tipe Filter</label>
              <select className="form-select" value={filterType} onChange={handleFilterTypeChange} disabled={loading} style={{ borderRadius: "8px", borderColor: "#e0e0e0" }} >
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
                  <select className="form-select" value={intervalType} onChange={(e) => setIntervalType(e.target.value)} disabled={loading} style={{ borderRadius: "8px", borderColor: "#e0e0e0" }} >
                    <option value="day">Hari</option>
                    <option value="week">Minggu</option>
                    <option value="month">Bulan</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Tanggal Mulai</label>
                  <input type="date" className="form-control" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value }) } disabled={loading} style={{ borderRadius: "8px", borderColor: "#e0e0e0" }} />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Tanggal Akhir</label>
                  <input type="date" className="form-control" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value }) } disabled={loading} style={{ borderRadius: "8px", borderColor: "#e0e0e0" }} />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ... (bagian error dan loading tidak berubah) ... */}
      
      {loading ? ( <motion.div className="text-center py-5">...</motion.div> ) : 
      !feedUsageData || feedUsageData.length === 0 || error ? ( <motion.div className="alert alert-warning text-center mb-4">...</motion.div> ) : 
      ( chartData.series.length > 0 && (
        <motion.div className="row mb-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }} >
          <div className="col-xl-12">
            <Card className="shadow-sm border-0" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)", overflow: "hidden", position: "relative" }} >
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title text-gray-800 fw-bold"> Grafik Penggunaan Pakan </h5>
                  <div>
                    {/* DIPERBAIKI: Tombol '-' untuk mengecilkan bar */}
                    <Button variant="outline-secondary" onClick={handleZoomIn} className="me-2" style={{ borderRadius: "50%", width: "38px", height: "38px", fontWeight: "bold" }} disabled={zoomLevel <= 0.4} > - </Button>
                    {/* DIPERBAIKI: Tombol '+' untuk memperbesar bar */}
                    <Button variant="outline-secondary" onClick={handleZoomOut} style={{ borderRadius: "50%", width: "38px", height: "38px", fontWeight: "bold" }} disabled={zoomLevel >= 2.5} > + </Button>
                    <Button variant="outline-primary" onClick={toggleFullScreen} className="ms-2" style={{ borderRadius: "8px" }} >
                      <i className="ri-fullscreen-line"></i> {isFullScreen ? "Keluar" : "Perbesar"}
                    </Button>
                  </div>
                </div>
                <div style={{ overflowX: "auto", width: "100%" }} >
                  <div style={{ minWidth: `${Math.max(800, chartData.dates.length * 80)}px`, width: "100%" }} >
                    <ReactApexChart ref={chartRef} options={barChartOptions} series={barChartOptions.series} type="bar" height={barChartOptions.chart.height} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
        )
      )}
    </motion.div>
  );
};

export default FeedUsageChartPage;