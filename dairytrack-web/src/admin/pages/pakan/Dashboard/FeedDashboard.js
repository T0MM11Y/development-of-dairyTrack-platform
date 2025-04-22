import { useState, useEffect, useMemo } from "react";
import { getFeedUsageByDate } from "../../../../api/pakan/dailyFeedItem";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import Swal from "sweetalert2";
import ReactApexChart from "react-apexcharts";

const FeedConsumptionDashboard = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [feedUsageData, setFeedUsageData] = useState([]); // Ubah inisialisasi ke array kosong
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedTypesResponse, feedUsageResponse] = await Promise.all([
        getFeedTypes(),
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
        // Filter data to ensure it's within the selected date range
        const filteredData = feedUsageResponse.data.filter(item => {
          const itemDate = new Date(item.date);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          
          // Set times to midnight for accurate date comparison
          itemDate.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          
          return itemDate >= startDate && itemDate <= endDate;
        });
        
        setFeedUsageData(filteredData);
        
        if (filteredData.length === 0 && feedUsageResponse.data.length > 0) {
          console.warn("Data was received from API but none matched the date filter");
        }
      } else {
        console.error("Unexpected feed usage response:", feedUsageResponse);
        setFeedUsageData([]);
      }
    } catch (error) {
      console.error("API Error:", error.message, error.stack);
      setFeedTypes([]);
      setFeedUsageData([]);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat data pakan. Silakan coba lagi.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      setFeedUsageData([]); // Cleanup
    };
  }, [dateRange.startDate, dateRange.endDate]);

  // Calculate metrics for cards
  const uniqueFeedTypesCount = feedTypes.length;
  const uniqueConsumedFeedsCount = useMemo(() => {
    return feedUsageData.length > 0
      ? new Set(feedUsageData.flatMap(day => day.feeds.map(feed => feed.feed_id))).size
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

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!feedUsageData || feedUsageData.length === 0) {
      return { dates: [], series: [] };
    }

    const dates = feedUsageData.map(item =>
      new Date(item.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })
    );

    const feedNames = [...new Set(
      feedUsageData.flatMap(day => day.feeds.map(feed => feed.feed_name))
    )];

    const series = feedNames.map(feedName => ({
      name: feedName,
      data: feedUsageData.map(day => {
        const feed = day.feeds.find(f => f.feed_name === feedName);
        return feed ? parseFloat(feed.quantity_kg) : 0;
      }),
    }));

    return { dates, series };
  }, [feedUsageData]);

  const handleApplyFilters = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      Swal.fire({
        title: "Perhatian!",
        text: "Silakan pilih rentang tanggal yang valid.",
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
    fetchData();
  };

  const areaChartOptions = {
    series: chartData.series,
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff4d94"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartData.dates,
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Jumlah Pakan (kg)",
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} kg`,
      },
    },
    legend: {
      position: "top",
    },
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard Konsumsi Pakan</h2>
          <p className="text-muted">Ringkasan konsumsi pakan ternak</p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-secondary waves-effect waves-light"
          disabled={loading}
        >
          <i className="ri-refresh-line me-1"></i> Refresh
        </button>
      </div>

      {/* Cards Section */}
      <div className="row mb-4">
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Jumlah Jenis Pakan
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {uniqueFeedTypesCount}
                  </div>
                </div>
                <div className="col-auto">
                  <div className="avatar-sm rounded-circle bg-primary bg-soft p-4 ms-3">
                    <span className="avatar-title rounded-circle h4 mb-0">
                      🥕
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Jumlah Pakan
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {uniqueConsumedFeedsCount}
                  </div>
                </div>
                <div className="col-auto">
                  <div className="avatar-sm rounded-circle bg-success bg-soft p-4 ms-3">
                    <span className="avatar-title rounded-circle h4 mb-0">
                      📦
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Konsumsi Pakan
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalFeedQuantity} kg
                  </div>
                </div>
                <div className="col-auto">
                  <div className="avatar-sm rounded-circle bg-info bg-soft p-4 ms-3">
                    <span className="avatar-title rounded-circle h4 mb-0">
                      🐄
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-5 mb-3">
              <label className="form-label fw-bold">Tanggal Mulai</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="col-md-5 mb-3">
              <label className="form-label fw-bold">Tanggal Akhir</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="col-md-2 mb-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                <i className="ri-filter-3-line me-1"></i> Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data pakan...</p>
        </div>
      ) : feedUsageData.length === 0 ? (
        <div className="alert alert-warning text-center">
          <i className="ri-error-warning-line me-2"></i>
          Tidak ada data konsumsi pakan tersedia untuk rentang tanggal yang dipilih.
        </div>
      ) : (
        <div className="row mb-4">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Konsumsi Pakan Harian</h5>
                <div id="feed-consumption-chart">
                  <ReactApexChart
                    options={areaChartOptions}
                    series={areaChartOptions.series}
                    type="area"
                    height={350}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedConsumptionDashboard;