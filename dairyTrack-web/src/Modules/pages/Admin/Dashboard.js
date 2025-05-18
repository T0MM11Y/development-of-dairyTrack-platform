import React, { useState, useEffect } from "react";
import {
  FaPaw,
  FaBreadSlice,
  FaGlassWhiskey,
  FaMoneyBillWave,
  FaNotesMedical,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getDailySummaries } from "../../controllers/milkProductionController";
import { getAllFeedStocks } from "../../controllers/feedStockController";
import financeController from "../../controllers/financeController";
import { getHealthChecks } from "../../controllers/healthCheckController";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [milkProductionData, setMilkProductionData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch cow count (assuming we can get this from health checks)
        const healthChecksResponse = await getHealthChecks();
        const uniqueCows = new Set();
        healthChecksResponse.forEach((check) => {
          uniqueCows.add(check.cow_id);
        });

        // Fetch feed stock
        const feedStockResponse = await getAllFeedStocks();
        const totalFeedStock = feedStockResponse.reduce(
          (total, stock) => total + (parseFloat(stock.quantity_kg) || 0),
          0
        );

        // Fetch milk production
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);

        const formattedToday = today.toISOString().split("T")[0];
        const formattedStartDate = startDate.toISOString().split("T")[0];

        const milkResponse = await getDailySummaries({
          start_date: formattedStartDate,
          end_date: formattedToday,
        });

        if (milkResponse.success) {
          setMilkProductionData(milkResponse.summaries);
        }

        // Calculate today's milk production
        const todaysMilk = milkResponse.success
          ? milkResponse.summaries.find((s) => s.date === formattedToday)
              ?.total_volume || 0
          : 0;

        // Fetch monthly income
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const incomeResponse = await financeController.getIncomes(
          `start_date=${monthStart}&end_date=${formattedToday}`
        );

        const monthlyIncome = incomeResponse.success
          ? incomeResponse.incomes.reduce(
              (total, income) => total + (parseFloat(income.amount) || 0),
              0
            )
          : 0;

        // Set stats
        setStats([
          {
            title: "Total Sapi",
            value: uniqueCows.size.toString(),
            icon: <FaPaw />,
            color: "primary",
          },
          {
            title: "Stok Pakan (kg)",
            value: totalFeedStock.toLocaleString("id-ID"),
            icon: <FaBreadSlice />,
            color: "success",
          },
          {
            title: "Produksi Susu (hari ini)",
            value: `${todaysMilk.toLocaleString("id-ID")} L`,
            icon: <FaGlassWhiskey />,
            color: "info",
          },
          {
            title: "Pendapatan (bulan ini)",
            value: `Rp ${(monthlyIncome / 1000000).toLocaleString("id-ID", {
              maximumFractionDigits: 1,
            })} Jt`,
            icon: <FaMoneyBillWave />,
            color: "warning",
          },
        ]);

        // Get recent activities
        const recentActivities = [];

        // Add recent health checks
        if (healthChecksResponse.length > 0) {
          const recentChecks = healthChecksResponse
            .slice()
            .sort((a, b) => new Date(b.check_date) - new Date(a.check_date))
            .slice(0, 3);

          recentChecks.forEach((check) => {
            const checkDate = new Date(check.check_date);
            const timeDiff = Math.floor((today - checkDate) / (1000 * 60 * 60));
            recentActivities.push({
              time:
                timeDiff <= 24
                  ? `${timeDiff} jam lalu`
                  : `${Math.floor(timeDiff / 24)} hari lalu`,
              content: `Pemeriksaan kesehatan: ${check.diagnosis || "Rutin"}`,
            });
          });
        }

        // Add recent milking sessions
        if (milkResponse.success && milkResponse.summaries.length > 0) {
          const recentMilking = milkResponse.summaries
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 2);

          recentMilking.forEach((session) => {
            recentActivities.push({
              time: `${new Date(session.date).toLocaleDateString("id-ID")}`,
              content: `Produksi susu: ${session.total_volume} L`,
            });
          });
        }

        setRecentActivities(recentActivities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div
        className="dashboard sb-admin-content d-flex justify-content-center align-items-center"
        style={{ minHeight: "500px" }}
      ></div>
    );
  }

  // Prepare chart data
  const chartData = milkProductionData
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      volume: item.total_volume,
    }));

  return (
    <div className="dashboard sb-admin-content">
      <h1 className="page-header">Dashboard Overview</h1>

      <div className="row mb-4">
        {stats.map((stat, index) => (
          <div className="col-xl-3 col-md-6 mb-4" key={index}>
            <div className={`card border-left-${stat.color} shadow h-100 py-2`}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div
                      className={`text-xs font-weight-bold text-${stat.color} text-uppercase mb-1`}
                    >
                      {stat.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stat.value}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className={`icon-circle bg-${stat.color}-light`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                Grafik Produksi Susu Mingguan
              </h6>
            </div>
            <div className="card-body">
              <div className="chart-area" style={{ height: "320px" }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        label={{
                          value: "Volume (L)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        name="Volume Susu (L)"
                        stroke="#36b9cc"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center">
                    Tidak ada data produksi susu untuk ditampilkan
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                Aktivitas Terkini
              </h6>
            </div>
            <div className="card-body">
              <div className="activity-feed">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div className="feed-item" key={index}>
                      <div className="feed-time">{activity.time}</div>
                      <div className="feed-content">{activity.content}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">Tidak ada aktivitas terkini</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
