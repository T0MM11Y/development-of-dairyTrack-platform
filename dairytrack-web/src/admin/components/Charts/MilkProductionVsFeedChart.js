import React, { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import Swal from "sweetalert2";
import { getFeedUsageByDate } from "../../../api/pakan/dailyFeedItem"; // Adjust path as needed
import { getFeedTypes } from "../../../api/pakan/feedType"; // Adjust path as needed

const MilkProductionVsFeedChart = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [feedUsageData, setFeedUsageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [tempDateRange, setTempDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Fetch Feed Data
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

      if (feedTypesResponse.success && feedTypesResponse.feedTypes) {
        setFeedTypes(feedTypesResponse.feedTypes);
      } else {
        console.error("Unexpected feed types response:", feedTypesResponse);
        setFeedTypes([]);
      }

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
      setFeedUsageData([]);
    };
  }, [dateRange.startDate, dateRange.endDate]);

  // Handle date filter change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setTempDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filter
  const applyFilter = () => {
    // Validate dates
    const startDate = new Date(tempDateRange.startDate);
    const endDate = new Date(tempDateRange.endDate);

    if (startDate > endDate) {
      Swal.fire({
        title: "Error!",
        text: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir.",
        icon: "error",
      });
      return;
    }

    setDateRange({
      startDate: tempDateRange.startDate,
      endDate: tempDateRange.endDate
    });
  };

  // Reset filter to last 30 days
  const resetFilter = () => {
    const newStartDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];
    const newEndDate = new Date().toISOString().split("T")[0];
    
    setTempDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
    
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
  };

  // Prepare Chart Data
  const chartData = useMemo(() => {
    if (!feedUsageData || feedUsageData.length === 0) {
      return { dates: [], series: [] };
    }

    const dates = feedUsageData.map((item) => item.date); // ISO format for datetime x-axis
    const feedNames = [...new Set(feedUsageData.flatMap((day) => day.feeds.map((feed) => feed.feed_name)))];

    const series = feedNames.map((feedName) => ({
      name: feedName,
      data: feedUsageData.map((day) => {
        const feed = day.feeds.find((f) => f.feed_name === feedName);
        return feed ? parseFloat(feed.quantity_kg) : 0;
      }),
    }));

    return { dates, series };
  }, [feedUsageData]);

  // Chart Options (Styled like the original)
  const areaChartOptions = {
    series: chartData.series,
    chart: { height: 350, type: "area" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      type: "datetime",
      categories: chartData.dates,
    },
    tooltip: { x: { format: "dd/MM/yy" } },
  };

  return (
    <div className="row">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="card-title mb-0">Feed Consumption</h4>
              <div className="d-flex filter-container">
                <div className="date-filter d-flex align-items-center">
                  <div className="me-3">
                    <label htmlFor="startDate" className="form-label me-2">Dari:</label>
                    <input 
                      type="date" 
                      id="startDate" 
                      name="startDate" 
                      className="form-control" 
                      value={tempDateRange.startDate} 
                      onChange={handleDateChange}
                    />
                  </div>
                  <div className="me-3">
                    <label htmlFor="endDate" className="form-label me-2">Sampai:</label>
                    <input 
                      type="date" 
                      id="endDate" 
                      name="endDate" 
                      className="form-control" 
                      value={tempDateRange.endDate} 
                      onChange={handleDateChange}
                    />
                  </div>
                  <div className="d-flex">
                    <button 
                      className="btn btn-primary me-2" 
                      onClick={applyFilter}
                      disabled={loading}
                    >
                      <i className="ri-filter-3-line me-1"></i> Terapkan
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={resetFilter}
                      disabled={loading}
                    >
                      <i className="ri-refresh-line me-1"></i> Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="date-range-info mb-3">
              <span className="text-muted">
                Menampilkan data: <strong>{new Date(dateRange.startDate).toLocaleDateString('id-ID')}</strong> - <strong>{new Date(dateRange.endDate).toLocaleDateString('id-ID')}</strong>
              </span>
            </div>

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
              <ReactApexChart
                options={areaChartOptions}
                series={areaChartOptions.series}
                type="area"
                height={350}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilkProductionVsFeedChart;