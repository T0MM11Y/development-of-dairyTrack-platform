import React, { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import Swal from "sweetalert2";
import {getFeedUsageByDate } from "../../../api/pakan/dailyFeedItem"; // Adjust path as needed
import {getFeedTypes } from "../../../api/pakan/feedType"; // Adjust path as needed

const MilkProductionVsFeedChart = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [feedUsageData, setFeedUsageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
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
            <h4 className="card-title mb-4">Feed Consumption</h4>
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