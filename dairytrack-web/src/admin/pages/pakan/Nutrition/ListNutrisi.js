import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import ReactApexChart from "react-apexcharts";

const FeedNutritionSummaryPage = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cowNames, setCowNames] = useState({});
  const [selectedCow, setSelectedCow] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [chartData, setChartData] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch feeds and cows data in parallel
      const [feedsResponse, cowsData] = await Promise.all([
        getAllDailyFeeds(),
        getCows().catch(err => {
          console.error("Failed to fetch cows:", err);
          return [];
        })
      ]);
      
      // Process feeds
      if (feedsResponse.success && feedsResponse.data) {
        setNutritionData(feedsResponse.data);
      } else {
        console.error("Unexpected response format", feedsResponse);
        setNutritionData([]);
      }
      
      // Create lookup map for cow names
      const cowMap = {};
      cowsData.forEach(cow => {
        cowMap[cow.id] = cow.name;
      });
      setCowNames(cowMap);
      
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setNutritionData([]);
      
      Swal.fire({
        title: "Error!",
        text: "Failed to load nutrition data.",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format date for chart (shorter version)
  const formatChartDate = (dateString) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format currency for consistency
  const formatValue = (value, unit = "") => {
    return `${parseFloat(value).toFixed(2)} ${unit}`;
  };

  // Filter data based on selected cow and date range
  const filteredData = nutritionData.filter(item => {
    const dateMatch = new Date(item.date) >= new Date(dateRange.startDate) && 
                      new Date(item.date) <= new Date(dateRange.endDate);
    const cowMatch = selectedCow ? item.cow_id.toString() === selectedCow : false;
    return dateMatch && cowMatch;
  });

  // Get unique cow IDs for the dropdown
  const uniqueCows = [...new Set(nutritionData.map(item => item.cow_id))];

  // Prepare chart data when filtered data or selected cow changes
  useEffect(() => {
    if (selectedCow) {
      // Sort data by date
      const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Group data by date and session
      const groupedData = {};
      
      sortedData.forEach(item => {
        const date = formatChartDate(item.date);
        const session = item.session.charAt(0).toUpperCase() + item.session.slice(1);
        const key = `${date} (${session})`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            date: date,
            fullDate: item.date,
            session: session,
            protein: parseFloat(item.total_protein) || 0,
            energy: parseFloat(item.total_energy) / 1000 || 0, // Convert to thousands for better visualization
            fiber: parseFloat(item.total_fiber) || 0
          };
        }
      });
      
      setChartData(Object.values(groupedData));
    } else {
      setChartData([]);
    }
  }, [filteredData, selectedCow]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleCowChange = (e) => {
    setSelectedCow(e.target.value);
  };

  const handleApplyFilters = () => {
    if (!selectedCow) {
      Swal.fire({
        title: "Perhatian!",
        text: "Silakan pilih sapi terlebih dahulu untuk melihat grafik.",
        icon: "warning"
      });
    }
  };

  // Create ApexCharts options similar to finance chart
  const areaChartOptions = {
    series: [
      {
        name: "Protein (g)",
        data: chartData.map(item => item.protein)
      },
      {
        name: "Energi (ribu kcal)",
        data: chartData.map(item => item.energy)
      },
      {
        name: "Serat (g)",
        data: chartData.map(item => item.fiber)
      }
    ],
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    colors: ["#8884d8", "#82ca9d", "#ffc658"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: chartData.map(item => `${item.date} (${item.session})`),
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val, { seriesIndex }) {
          const units = ["g", "kcal", "g"];
          if (seriesIndex === 1) {
            return `${(val * 1000).toFixed(2)} kcal`;
          }
          return `${val.toFixed(2)} ${units[seriesIndex]}`;
        }
      }
    },
    legend: {
      position: 'top'
    }
  };

  // Create pie chart for nutrition distribution
  const pieChartOptions = {
    series: chartData.length > 0 ? [
      chartData.reduce((sum, item) => sum + item.protein, 0) / chartData.length,
      chartData.reduce((sum, item) => sum + item.energy * 1000, 0) / chartData.length,
      chartData.reduce((sum, item) => sum + item.fiber, 0) / chartData.length
    ] : [0, 0, 0],
    chart: {
      type: "donut",
      height: 300
    },
    labels: ["Protein", "Energi", "Serat"],
    colors: ["#8884d8", "#82ca9d", "#ffc658"],
    legend: {
      position: "bottom"
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ],
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toFixed(1) + "%";
      }
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ringkasan Nutrisi Pakan</h2>
          <p className="text-muted">Analisis nutrisi pakan harian sapi</p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-secondary waves-effect waves-light"
        >
          <i className="ri-refresh-line me-1"></i> Refresh
        </button>
      </div>

      {/* Filter controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Pilih Sapi <span className="text-danger">*</span></label>
              <select 
                className="form-select" 
                value={selectedCow} 
                onChange={handleCowChange}
                required
              >
                <option value="">-- Pilih Sapi --</option>
                {uniqueCows.map(cowId => (
                  <option key={cowId} value={cowId}>
                    {cowNames[cowId] || `Sapi #${cowId}`}
                  </option>
                ))}
              </select>
              {!selectedCow && (
                <small className="text-muted">Sapi harus dipilih untuk melihat grafik</small>
              )}
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label fw-bold">Tanggal Mulai</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label fw-bold">Tanggal Akhir</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <div className="col-md-2 mb-3 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100"
                onClick={handleApplyFilters}
              >
                <i className="ri-filter-3-line me-1"></i> Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data nutrisi...</p>
        </div>
      ) : (
        <>
          {/* Nutrition Chart Row */}
          <div className="row mb-4">
            {/* Area Chart */}
            <div className="col-xl-8">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    Grafik Nilai Nutrisi
                    {selectedCow && <span className="text-primary ms-2">({cowNames[selectedCow] || `Sapi #${selectedCow}`})</span>}
                  </h5>
                  
                  {!selectedCow ? (
                    <div className="alert alert-info text-center p-4">
                      <i className="ri-information-line fs-3 mb-3"></i>
                      <h5>Silakan Pilih Sapi</h5>
                      <p>Untuk melihat grafik nutrisi, harap pilih sapi terlebih dahulu.</p>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="alert alert-warning text-center">
                      <i className="ri-error-warning-line me-2"></i>
                      Tidak ada data nutrisi tersedia untuk sapi dan rentang tanggal yang dipilih.
                    </div>
                  ) : (
                    <div id="nutrition-chart">
                      <ReactApexChart
                        options={areaChartOptions}
                        series={areaChartOptions.series}
                        type="area"
                        height={350}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nutrition Distribution Chart */}
            <div className="col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Distribusi Nutrisi</h5>
                  {!selectedCow || chartData.length === 0 ? (
                    <div className="alert alert-info text-center p-3">
                      <i className="ri-information-line me-2"></i>
                      Data nutrisi tidak tersedia
                    </div>
                  ) : (
                    <div id="nutrition-distribution-chart">
                      <ReactApexChart
                        options={pieChartOptions}
                        series={pieChartOptions.series}
                        type="donut"
                        height={250}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Summary Cards */}
          {selectedCow && filteredData.length > 0 && (
            <div className="row mb-4">
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Rata-rata Protein
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {(filteredData.reduce((sum, item) => sum + parseFloat(item.total_protein || 0), 0) / filteredData.length).toFixed(2)} g
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="avatar-sm rounded-circle bg-primary bg-soft p-4 ms-3">
                          <span className="avatar-title rounded-circle h4 mb-0">🍖</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                          Rata-rata Energi
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {(filteredData.reduce((sum, item) => sum + parseFloat(item.total_energy || 0), 0) / filteredData.length).toFixed(2)} kcal
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="avatar-sm rounded-circle bg-success bg-soft p-4 ms-3">
                          <span className="avatar-title rounded-circle h4 mb-0">⚡</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-warning shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                          Rata-rata Serat
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {(filteredData.reduce((sum, item) => sum + parseFloat(item.total_fiber || 0), 0) / filteredData.length).toFixed(2)} g
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="avatar-sm rounded-circle bg-warning bg-soft p-4 ms-3">
                          <span className="avatar-title rounded-circle h4 mb-0">🌿</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-info shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                          Total Pemberian Pakan
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {filteredData.length} kali
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="avatar-sm rounded-circle bg-info bg-soft p-4 ms-3">
                          <span className="avatar-title rounded-circle h4 mb-0">🐄</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {selectedCow && (
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title">
                    Riwayat Nutrisi Harian
                    {selectedCow && <span className="text-primary ms-2">({cowNames[selectedCow] || `Sapi #${selectedCow}`})</span>}
                  </h4>
                  <button className="btn btn-sm btn-primary">
                    <i className="ri-download-2-line me-1"></i> Export
                  </button>
                </div>
                {filteredData.length === 0 ? (
                  <div className="alert alert-info text-center">
                    Tidak ada data nutrisi tersedia untuk filter yang dipilih.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-centered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="text-center">#</th>
                          <th>Tanggal</th>
                          <th>Sesi</th>
                          <th>Cuaca</th>
                          <th className="text-center">Protein (g)</th>
                          <th className="text-center">Energi (kcal)</th>
                          <th className="text-center">Serat (g)</th>
                          <th className="text-center">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>{formatDate(item.date)}</td>
                            <td>{item.session.charAt(0).toUpperCase() + item.session.slice(1)}</td>
                            <td>{item.weather ? item.weather.charAt(0).toUpperCase() + item.weather.slice(1) : "-"}</td>
                            <td className="text-center fw-bold text-primary">{parseFloat(item.total_protein).toFixed(2)}</td>
                            <td className="text-center fw-bold text-success">{parseFloat(item.total_energy).toFixed(2)}</td>
                            <td className="text-center fw-bold text-warning">{parseFloat(item.total_fiber).toFixed(2)}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => {
                                  // Show detailed feed items if available
                                  if (item.feedItems && item.feedItems.length > 0) {
                                    const feedItemsHtml = item.feedItems.map(feedItem => 
                                      `<tr>
                                        <td>${feedItem.feed.name}</td>
                                        <td class="text-end">${feedItem.quantity}</td>
                                        <td class="text-end">${parseFloat(feedItem.feed.protein).toFixed(2)}</td>
                                        <td class="text-end">${parseFloat(feedItem.feed.energy).toFixed(2)}</td>
                                        <td class="text-end">${parseFloat(feedItem.feed.fiber).toFixed(2)}</td>
                                      </tr>`
                                    ).join("");
                                    
                                    Swal.fire({
                                      title: `Detail Pakan - ${cowNames[item.cow_id] || `Sapi #${item.cow_id}`}`,
                                      html: `
                                        <div class="text-start">
                                          <p><strong>Tanggal:</strong> ${formatDate(item.date)}</p>
                                          <p><strong>Sesi:</strong> ${item.session}</p>
                                          <p><strong>Cuaca:</strong> ${item.weather || '-'}</p>
                                          <table class="table table-bordered">
                                            <thead>
                                              <tr>
                                                <th>Nama Pakan</th>
                                                <th class="text-end">Jumlah</th>
                                                <th class="text-end">Protein</th>
                                                <th class="text-end">Energi</th>
                                                <th class="text-end">Serat</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              ${feedItemsHtml}
                                            </tbody>
                                          </table>
                                        </div>
                                      `,
                                      width: '800px'
                                    });
                                  } else {
                                    Swal.fire({
                                      title: "Info",
                                      text: "Tidak ada detail pakan tersedia.",
                                      icon: "info"
                                    });
                                  }
                                }}
                                title="Lihat Detail"
                              >
                                <i className="ri-eye-line"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedNutritionSummaryPage;