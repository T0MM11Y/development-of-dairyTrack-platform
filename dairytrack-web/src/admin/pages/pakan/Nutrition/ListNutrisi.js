import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";

// Import Recharts for line graph visualization
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

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
      
      // Create chart data with formatted dates and session info
      const formattedChartData = sortedData.map(item => ({
        date: formatChartDate(item.date),
        fullDate: item.date,
        session: item.session,
        dateSession: `${formatChartDate(item.date)} (${item.session.charAt(0).toUpperCase() + item.session.slice(1)})`,
        protein: parseFloat(item.total_protein) || 0,
        energy: parseFloat(item.total_energy) / 1000 || 0, // Convert to thousands for better visualization
        fiber: parseFloat(item.total_fiber) || 0
      }));
      
      setChartData(formattedChartData);
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

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Ringkasan Nutrisi Pakan</h2>
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
          {/* Nutrition Chart */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title mb-4">
                Grafik Nilai Nutrisi
                {selectedCow && <span className="text-primary ms-2">({cowNames[selectedCow] || `Sapi #${selectedCow}`})</span>}
              </h4>
              
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
                <div style={{ height: "400px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="dateSession" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Protein/Serat (g)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Energi (ribu kcal)', angle: 90, position: 'insideRight' }} />
                      <Tooltip 
                        formatter={(value, name) => {
                          switch (name) {
                            case 'protein':
                              return [`${value.toFixed(2)} g`, 'Protein'];
                            case 'energy':
                              return [`${(value * 1000).toFixed(2)} kcal`, 'Energi'];
                            case 'fiber':
                              return [`${value.toFixed(2)} g`, 'Serat'];
                            default:
                              return [value, name];
                          }
                        }}
                        labelFormatter={(label) => `Tanggal: ${label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="protein" 
                        name="Protein" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="energy" 
                        name="Energi" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="fiber" 
                        name="Serat" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ stroke: '#ffc658', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
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
                        <i className="ri-leaf-line fa-2x text-gray-300"></i>
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
                        <i className="ri-flashlight-line fa-2x text-gray-300"></i>
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
                        <i className="ri-plant-line fa-2x text-gray-300"></i>
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
                        <i className="ri-calendar-check-line fa-2x text-gray-300"></i>
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
                <h4 className="card-title mb-4">
                  Riwayat Nutrisi Harian
                  {selectedCow && <span className="text-primary ms-2">({cowNames[selectedCow] || `Sapi #${selectedCow}`})</span>}
                </h4>
                {filteredData.length === 0 ? (
                  <div className="alert alert-info text-center">
                    Tidak ada data nutrisi tersedia untuk filter yang dipilih.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped mb-0">
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