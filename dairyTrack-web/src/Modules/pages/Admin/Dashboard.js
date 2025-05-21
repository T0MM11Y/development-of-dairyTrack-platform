import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";
import {
  FaPaw,
  FaMoneyBillWave,
  FaShoppingCart,
  FaBoxOpen,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Droplet, Wheat, Activity, PawPrint, LucideUsers } from "lucide-react";
import Swal from "sweetalert2";
import { listCows } from "../../controllers/cowsController";
import { getAllUsers } from "../../controllers/usersController";
import { getMilkingSessions } from "../../controllers/milkProductionController";
import { getFeedUsageByDate } from "../../controllers/feedItemController";
import { listCowsByUser } from "../../controllers/cattleDistributionController";
import financeController from "../../controllers/financeController.js";
import { getHealthChecks } from "../../controllers/healthCheckController";
import { getOrders } from "../../controllers/orderController";
import { getProductStocks } from "../../controllers/productStockController";

// Validate financeController
if (
  !financeController ||
  typeof financeController.getIncomes !== "function" ||
  typeof financeController.getExpenses !== "function"
) {
  console.error(
    "Error: financeController is not a valid module or missing getIncomes/getExpenses functions"
  );
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load finance controller. Please check the application configuration.",
  });
}

// Animation variants for Framer Motion
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalCows, setTotalCows] = useState(0);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [stats, setStats] = useState([]);
  const [milkProductionData, setMilkProductionData] = useState([]);
  const [feedUsageData, setFeedUsageData] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [healthCheckData, setHealthCheckData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productStocks, setProductStocks] = useState([]);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userManagedCows, setUserManagedCows] = useState([]);

  // Animation hooks
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const { ref: chartsRef, inView: chartsInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Fetch current user from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);

  // Fetch user-managed cows
  useEffect(() => {
    const fetchUserManagedCows = async () => {
      if (currentUser?.user_id) {
        try {
          const { success, cows } = await listCowsByUser(currentUser.user_id);
          if (success && cows) {
            setUserManagedCows(cows);
          }
        } catch (err) {
          console.error("Error fetching user's cows:", err);
        }
      }
    };

    fetchUserManagedCows();
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Total Cows
        const cowsResponse = await listCows();
        if (cowsResponse.success) {
          setTotalCows(cowsResponse.cows.length);
        } else {
          throw new Error(cowsResponse.message || "Failed to fetch cows.");
        }

        // Fetch Total Farmers
        const usersResponse = await getAllUsers();
        if (usersResponse.success) {
          const farmers = usersResponse.users.filter(
            (user) => user.role === "farmer"
          );
          setTotalFarmers(farmers.length);
        } else {
          throw new Error(usersResponse.message || "Failed to fetch users.");
        }

        // Define shared date variables
        const today = "2025-05-20";
        const startDate = new Date("2025-05-18");
        const endDate = new Date("2025-05-24");

        // Fetch Milking Sessions
        const milkingResponse = await getMilkingSessions();
        let todayMilkVolume = "0.00";
        let milkProductionData = [];

        if (milkingResponse.success && milkingResponse.sessions) {
          let filteredSessions = milkingResponse.sessions;

          if (currentUser?.role_id !== 1 && userManagedCows.length > 0) {
            const managedCowIds = userManagedCows.map((cow) => String(cow.id));
            filteredSessions = filteredSessions.filter((session) =>
              managedCowIds.includes(String(session.cow_id))
            );
          }

          todayMilkVolume = filteredSessions
            .filter((session) => session.milking_time.startsWith(today))
            .reduce((sum, session) => sum + parseFloat(session.volume || 0), 0)
            .toFixed(2);

          const milkByDate = {};
          for (
            let date = new Date(startDate);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            const formattedDate = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            milkByDate[formattedDate] = 0;
          }

          filteredSessions.forEach((session) => {
            const date = new Date(session.milking_time).toLocaleDateString(
              "id-ID",
              { day: "numeric", month: "short" }
            );
            if (milkByDate[date] !== undefined) {
              milkByDate[date] += parseFloat(session.volume || 0);
            }
          });

          milkProductionData = Object.entries(milkByDate).map(
            ([date, volume]) => ({
              date,
              volume: parseFloat(volume.toFixed(2)),
            })
          );
        } else {
          throw new Error(
            milkingResponse.message || "Failed to fetch milking sessions."
          );
        }

        // Fetch Feed Usage Data
        const feedResponse = await getFeedUsageByDate({
          start_date: "2025-05-18",
          end_date: "2025-05-24",
        });

        let todayFeedQuantity = "0.00";
        let feedUsageData = [];

        if (feedResponse.success && Array.isArray(feedResponse.data)) {
          todayFeedQuantity = feedResponse.data
            .filter((item) => item.date.startsWith(today))
            .reduce((sum, day) => {
              return (
                sum +
                day.feeds.reduce(
                  (daySum, feed) => daySum + parseFloat(feed.quantity_kg || 0),
                  0
                )
              );
            }, 0)
            .toFixed(2);

          const feedByDate = {};
          for (
            let date = new Date(startDate);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            const formattedDate = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            feedByDate[formattedDate] = 0;
          }

          feedResponse.data.forEach((day) => {
            const date = new Date(day.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            if (feedByDate[date] !== undefined) {
              feedByDate[date] += day.feeds.reduce(
                (sum, feed) => sum + parseFloat(feed.quantity_kg || 0),
                0
              );
            }
          });

          feedUsageData = Object.entries(feedByDate).map(
            ([date, quantity]) => ({
              date,
              feed: parseFloat(quantity.toFixed(2)),
            })
          );
        } else {
          console.error("Unexpected feed usage response:", feedResponse);
        }

        // Fetch Finance Data
        const queryParams = new URLSearchParams();
        queryParams.append("start_date", "2025-05-18");
        queryParams.append("end_date", "2025-05-24");
        const queryString = queryParams.toString();

        let incomes, expenses;
        try {
          const [incomeResponse, expenseResponse] = await Promise.all([
            financeController.getIncomes(queryString),
            financeController.getExpenses(queryString),
          ]);

          if (!incomeResponse.success) {
            throw new Error(
              incomeResponse.message || "Failed to fetch incomes."
            );
          }
          if (!expenseResponse.success) {
            throw new Error(
              expenseResponse.message || "Failed to fetch expenses."
            );
          }

          incomes = incomeResponse.incomes || [];
          expenses = expenseResponse.expenses || [];
        } catch (err) {
          console.error("Error fetching finance data:", err);
          throw new Error("Failed to fetch finance data: " + err.message);
        }

        let totalIncome = "0.00";
        let totalExpense = "0.00";
        let financeChartData = [];

        const financeByDate = {};
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const formattedDate = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });
          financeByDate[formattedDate] = { income: 0, expense: 0 };
        }

        incomes.forEach((transaction) => {
          const date = new Date(
            transaction.transaction_date
          ).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          if (financeByDate[date]) {
            const amount = parseFloat(transaction.amount) / 1000000; // Convert to millions
            financeByDate[date].income += amount;
          }
        });

        expenses.forEach((transaction) => {
          const date = new Date(
            transaction.transaction_date
          ).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          if (financeByDate[date]) {
            const amount = parseFloat(transaction.amount) / 1000000; // Convert to millions
            financeByDate[date].expense += amount;
          }
        });

        totalIncome = incomes
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
          .toFixed(2);

        totalExpense = expenses
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
          .toFixed(2);

        financeChartData = Object.entries(financeByDate).map(
          ([date, values]) => ({
            date,
            income: parseFloat(values.income.toFixed(2)),
            expense: parseFloat(values.expense.toFixed(2)),
          })
        );

        // Fetch Health Checks
        const healthResponse = await getHealthChecks();
        let totalHealthChecks = 0;
        let healthCheckData = [];

        if (Array.isArray(healthResponse)) {
          const uniqueHealthChecks = Array.from(
            new Map(healthResponse.map((check) => [check.id, check])).values()
          );

          let filteredHealthChecks = uniqueHealthChecks;

          if (currentUser?.role_id !== 1 && userManagedCows.length > 0) {
            const managedCowIds = userManagedCows.map((cow) => cow.id);
            filteredHealthChecks = filteredHealthChecks.filter((check) =>
              managedCowIds.includes(check?.cow?.id)
            );
          }

          if (currentUser?.role_id === 2 && userManagedCows.length === 0) {
            filteredHealthChecks = uniqueHealthChecks;
          }

          totalHealthChecks = filteredHealthChecks.length;

          const healthByDate = {};
          for (
            let date = new Date(startDate);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            const formattedDate = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            healthByDate[formattedDate] = 0;
          }

          filteredHealthChecks.forEach((check) => {
            const checkupDate = new Date(check.checkup_date);
            if (isNaN(checkupDate.getTime())) {
              console.warn("Invalid checkup_date:", check.checkup_date);
              return;
            }
            const date = checkupDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            if (healthByDate[date] !== undefined) {
              healthByDate[date] += 1;
            }
          });

          healthCheckData = Object.entries(healthByDate).map(
            ([date, checks]) => ({
              date,
              checks,
            })
          );
        } else {
          console.error("Unexpected health checks response:", healthResponse);
        }

        // Fetch Orders
        // Fetch Orders
        let ordersData = [];
        try {
          const ordersResponse = await getOrders();
          console.log("Orders Response:", ordersResponse); // Debug log
          if (ordersResponse.success && Array.isArray(ordersResponse.orders)) {
            ordersData = ordersResponse.orders.map((order) => ({
              order_no: order.order_no || "N/A",
              customer_name: order.customer_name || "Unknown",
              total: parseFloat(order.total_price || 0).toLocaleString(
                "id-ID",
                {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }
              ),
              status: order.status || "Unknown",
            }));
          } else {
            console.error("Invalid orders response:", ordersResponse);
            throw new Error("Failed to fetch valid orders data.");
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError(err.message || "Failed to fetch orders.");
        }
        setOrders(ordersData);
        console.log("Orders State Updated:", ordersData); // Debug log

        // Fetch Product Stocks
        let stocksData = [];
        try {
          const stocksResponse = await getProductStocks();
          if (
            stocksResponse.success &&
            Array.isArray(stocksResponse.product_stocks)
          ) {
            stocksData = stocksResponse.product_stocks
              .map((stock) => ({
                product: stock.product?.name || "Unknown",
                quantity: stock.quantity || "0",
                expiry_date: stock.expiry_date
                  ? new Date(stock.expiry_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A",
              }))
              .sort(
                (a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)
              );
          } else {
            console.warn("Failed to fetch product stocks, using mock data.");
            stocksData = [
              {
                product: "Susu Coklat",
                quantity: "5 liter",
                expiry_date: "20 Mei 2025",
              },
              {
                product: "Susu Strawberry",
                quantity: "5 liter",
                expiry_date: "20 Mei 2025",
              },
              {
                product: "Susu Strawberry",
                quantity: "1 liter",
                expiry_date: "22 Mei 2025",
              },
            ];
          }
        } catch (err) {
          console.error("Error fetching product stocks:", err);
        }

        // Calculate Cow Efficiency
        const efficiencyData = feedUsageData.map((feed, i) => ({
          date: feed.date,
          efficiency:
            milkProductionData[i] && feed.feed > 0
              ? (milkProductionData[i].volume / feed.feed).toFixed(2)
              : 0,
        }));

        // Generate Recent Activities
        const recentActivities = [
          {
            time: "2 jam lalu",
            content: `Pemeriksaan kesehatan: ${totalHealthChecks} sapi diperiksa`,
            icon: <Activity className="text-purple" />,
          },
          {
            time: "5 jam lalu",
            content: `Produksi susu: ${todayMilkVolume} L`,
            icon: <Droplet className="text-info" />,
          },
          {
            time: "8 jam lalu",
            content: `Konsumsi pakan: ${todayFeedQuantity} kg`,
            icon: <Wheat className="text-warning" />,
          },
          {
            time: "1 hari lalu",
            content: `Pendapatan: Rp ${(
              parseFloat(totalIncome) / 1000000
            ).toFixed(2)} Jt`,
            icon: <FaMoneyBillWave className="text-success" />,
          },
        ];

        // Update Stats
        const updatedStats = [
          {
            title: "Konsumsi Pakan (hari ini)",
            value: `${todayFeedQuantity} kg`,
            icon: <Wheat className="text-warning" />,
            color: "warning",
          },
          {
            title: "Produksi Susu (hari ini)",
            value: `${todayMilkVolume} L`,
            icon: <Droplet className="text-info" />,
            color: "info",
          },
          {
            title: "Pendapatan (minggu ini)",
            value: `Rp ${(parseFloat(totalIncome) / 1000000).toFixed(2)} Jt`,
            icon: <FaMoneyBillWave className="text-success" />,
            color: "success",
          },
          {
            title: "Pemeriksaan Kesehatan",
            value: totalHealthChecks.toString(),
            icon: <Activity className="text-purple" />,
            color: "purple",
          },
        ];

        setMilkProductionData(milkProductionData);
        setFeedUsageData(feedUsageData);
        setFinanceData(financeChartData);
        setHealthCheckData(healthCheckData);
        setEfficiencyData(efficiencyData);
        setRecentActivities(recentActivities);
        setOrders(ordersData);
        setProductStocks(stocksData);
        setStats(updatedStats);
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to load dashboard data.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && userManagedCows !== undefined) {
      fetchData();
    }
  }, [currentUser, userManagedCows]);

  // Current date and time (WIB)
  const currentDate = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 bg-light">
        <p className="text-danger">Error: {error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          style={{
            borderRadius: "8px",
            background: "linear-gradient(90deg, #3498db 0%, #2c3e50 100%)",
            border: "none",
            letterSpacing: "1.3px",
            fontWeight: "600",
            fontSize: "0.8rem",
          }}
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      {/* Header: Total Sapi and Total Peternak */}
      <motion.div
        ref={headerRef}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        variants={cardVariants}
      >
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                  <PawPrint size={32} className="text-primary" />
                </div>
                <div>
                  <Card.Title
                    className="text-muted mb-1"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Total Sapi
                  </Card.Title>
                  <h2 className="mb-1 text-primary">{totalCows}</h2>
                  <small className="text-success">+3.5% dari minggu lalu</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="p-3 bg-info bg-opacity-10 rounded-circle me-3">
                  <LucideUsers size={32} className="text-info" />
                </div>
                <div>
                  <Card.Title
                    className="text-muted mb-1"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Total Peternak
                  </Card.Title>
                  <h2 className="mb-1 text-info">{totalFarmers}</h2>
                  <small className="text-success">+1 peternak baru</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <p
          className="text-muted text-end"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Terakhir diperbarui: {currentDate} WIB
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={cardVariants}
      >
        <Row className="mb-4">
          {stats.map((stat, index) => (
            <Col key={index} xs={12} md={6} lg={3} className="mb-3">
              <Card
                className={`border-0 shadow-sm border-start border-5 border-${
                  stat.color === "purple" ? "primary" : stat.color
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                }}
              >
                <Card.Body className="d-flex align-items-center">
                  <div
                    className={`p-3 bg-${
                      stat.color === "purple" ? "primary" : stat.color
                    } bg-opacity-10 rounded-circle me-3`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <Card.Title
                      className="text-muted mb-1"
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: "0.9rem",
                      }}
                    >
                      {stat.title}
                    </Card.Title>
                    <h4
                      className="mb-0"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: "bold",
                      }}
                    >
                      {stat.value}
                    </h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        ref={chartsRef}
        initial="hidden"
        animate={chartsInView ? "visible" : "hidden"}
        variants={cardVariants}
      >
        <Row>
          {/* Main Charts Column */}
          <Col lg={8} className="mb-4">
            {/* Chart 1: Milk Production */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-primary mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Produksi Susu Mingguan
                </Card.Title>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={milkProductionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${value}L`}
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} L`, "Volume"]}
                        labelStyle={{ fontFamily: "'Nunito', sans-serif" }}
                        itemStyle={{ fontFamily: "'Nunito', sans-serif" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#0d6efd"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* Chart 2: Feed Usage */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-warning mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Penggunaan Pakan Mingguan
                </Card.Title>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${value}kg`}
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} kg`, "Pakan"]}
                        labelStyle={{ fontFamily: "'Nunito', sans-serif" }}
                        itemStyle={{ fontFamily: "'Nunito', sans-serif" }}
                      />
                      <Bar
                        dataKey="feed"
                        fill="url(#feedGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="feedGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ffc107"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ffca28"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* Chart 3: Income vs Expense */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-success mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Pendapatan vs Pengeluaran Mingguan
                </Card.Title>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => `Rp ${value} Jt`}
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          `Rp ${value} Jt`,
                          name === "income" ? "Pendapatan" : "Pengeluaran",
                        ]}
                        labelStyle={{ fontFamily: "'Nunito', sans-serif" }}
                        itemStyle={{ fontFamily: "'Nunito', sans-serif" }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Pendapatan"
                        stroke="#198754"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="Pengeluaran"
                        stroke="#dc3545"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar Charts and Tables */}
          <Col lg={4}>
            {/* Chart 4: Health Check Frequency */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-primary mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Frekuensi Pemeriksaan Kesehatan
                </Card.Title>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthCheckData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <YAxis
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} kali`, "Pemeriksaan"]}
                        labelStyle={{ fontFamily: "'Nunito', sans-serif" }}
                        itemStyle={{ fontFamily: "'Nunito', sans-serif" }}
                      />
                      <Bar
                        dataKey="checks"
                        fill="#6f42c1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* Chart 5: Cow Efficiency */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-danger mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Efisiensi Sapi
                </Card.Title>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={efficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${value} L/kg`}
                        tick={{
                          fontSize: 12,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} L/kg`, "Efisiensi"]}
                        labelStyle={{ fontFamily: "'Nunito', sans-serif" }}
                        itemStyle={{ fontFamily: "'Nunito', sans-serif" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#dc3545"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* Recent Activities */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-primary mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Aktivitas Terkini
                </Card.Title>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="d-flex align-items-start mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="p-2 bg-light rounded-circle me-3">
                        {activity.icon}
                      </div>
                      <div>
                        <small
                          className="text-muted"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                          {activity.time}
                        </small>
                        <p
                          className="mb-0"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                          {activity.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Incoming Orders */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-primary mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Pesanan Masuk
                </Card.Title>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    responsive
                    style={{ fontSize: "0.85rem" }}
                  >
                    <thead>
                      <tr>
                        <th>No. Pesanan</th>
                        <th>Pelanggan</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={index}>
                          <td>{order.order_no}</td>
                          <td>{order.customer_name}</td>
                          <td>{order.total}</td>
                          <td>{order.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Product Stocks */}
            <Card
              className="border-0 shadow-sm mb-4"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              }}
            >
              <Card.Body>
                <Card.Title
                  className="text-primary mb-3"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Stok Produk (Urut Kadaluarsa)
                </Card.Title>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    responsive
                    style={{ fontSize: "0.85rem" }}
                  >
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Kuantitas</th>
                        <th>Kadaluarsa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productStocks.map((stock, index) => (
                        <tr key={index}>
                          <td>{stock.product}</td>
                          <td>{stock.quantity}</td>
                          <td>{stock.expiry_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
