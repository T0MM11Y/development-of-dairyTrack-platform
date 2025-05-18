import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap"; // Added Button to import
import {
  FaPaw,
  FaBreadSlice,
  FaGlassWhiskey,
  FaMoneyBillWave,
  FaNotesMedical,
  FaUsers,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import {
  Droplet,
  Wheat,
  Activity,
  TrendingUp,
  Users as LucideUsers,
  PawPrint,
} from "lucide-react";
import { listCows } from "../../controllers/cowsController";
import { getAllUsers } from "../../controllers/usersController";

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
  const [incomeData, setIncomeData] = useState([]);
  const [healthCheckData, setHealthCheckData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Total Sapi
        const cowsResponse = await listCows();
        if (cowsResponse.success) {
          setTotalCows(cowsResponse.cows.length);
        } else {
          throw new Error(cowsResponse.message || "Failed to fetch cows.");
        }

        // Fetch Total Peternak (assuming role: "farmer" identifies farmers)
        const usersResponse = await getAllUsers();
        if (usersResponse.success) {
          const farmers = usersResponse.users.filter(
            (user) => user.role === "farmer"
          );
          setTotalFarmers(farmers.length);
        } else {
          throw new Error(usersResponse.message || "Failed to fetch users.");
        }

        // Dummy data for other stats and charts
        const mockMilkData = [
          { date: "11 Mei", volume: 245 },
          { date: "12 Mei", volume: 230 },
          { date: "13 Mei", volume: 255 },
          { date: "14 Mei", volume: 267 },
          { date: "15 Mei", volume: 278 },
          { date: "16 Mei", volume: 280 },
          { date: "17 Mei", volume: 274 },
        ];

        const mockFeedData = [
          { date: "11 Mei", feed: 150 },
          { date: "12 Mei", feed: 145 },
          { date: "13 Mei", feed: 160 },
          { date: "14 Mei", feed: 165 },
          { date: "15 Mei", feed: 175 },
          { date: "16 Mei", feed: 170 },
          { date: "17 Mei", feed: 168 },
        ];

        const mockIncomeData = [
          { date: "11 Mei", income: 3.5 },
          { date: "12 Mei", income: 3.2 },
          { date: "13 Mei", income: 3.8 },
          { date: "14 Mei", income: 4.0 },
          { date: "15 Mei", income: 4.2 },
          { date: "16 Mei", income: 4.5 },
          { date: "17 Mei", income: 4.3 },
        ];

        const mockHealthCheckData = [
          { date: "11 Mei", checks: 5 },
          { date: "12 Mei", checks: 3 },
          { date: "13 Mei", checks: 6 },
          { date: "14 Mei", checks: 4 },
          { date: "15 Mei", checks: 7 },
          { date: "16 Mei", checks: 5 },
          { date: "17 Mei", checks: 4 },
        ];

        const mockEfficiencyData = mockMilkData.map((milk, i) => ({
          date: milk.date,
          efficiency: (milk.volume / mockFeedData[i].feed).toFixed(2),
        }));

        const mockStats = [
          {
            title: "Stok Pakan (kg)",
            value: "1.250",
            icon: <Wheat className="text-warning" />,
            color: "warning",
          },
          {
            title: "Produksi Susu (hari ini)",
            value: "274 L",
            icon: <Droplet className="text-info" />,
            color: "info",
          },
          {
            title: "Pendapatan (bulan ini)",
            value: "Rp 12.5 Jt",
            icon: <FaMoneyBillWave className="text-success" />,
            color: "success",
          },
          {
            title: "Pemeriksaan Kesehatan",
            value: "32",
            icon: <Activity className="text-purple" />,
            color: "purple",
          },
        ];

        const mockActivities = [
          {
            time: "2 jam lalu",
            content: "Pemeriksaan kesehatan: Sapi #1542 - Sehat",
            icon: <Activity className="text-purple" />,
          },
          {
            time: "5 jam lalu",
            content: "Produksi susu: 274 L",
            icon: <Droplet className="text-info" />,
          },
          {
            time: "8 jam lalu",
            content: "Stok pakan diperbarui: +200kg",
            icon: <Wheat className="text-warning" />,
          },
          {
            time: "1 hari lalu",
            content: "Penjualan susu: Rp 3.75 Jt",
            icon: <FaMoneyBillWave className="text-success" />,
          },
        ];

        setMilkProductionData(mockMilkData);
        setFeedUsageData(mockFeedData);
        setIncomeData(mockIncomeData);
        setHealthCheckData(mockHealthCheckData);
        setEfficiencyData(mockEfficiencyData);
        setStats(mockStats);
        setRecentActivities(mockActivities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <Button variant="primary" onClick={() => window.location.reload()}>
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
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                  <PawPrint size={32} className="text-primary" />
                </div>
                <div>
                  <Card.Title className="text-muted mb-1">Total Sapi</Card.Title>
                  <h2 className="mb-1 text-primary">{totalCows}</h2>
                  <small className="text-success">+3.5% dari minggu lalu</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="p-3 bg-info bg-opacity-10 rounded-circle me-3">
                  <LucideUsers size={32} className="text-info" />
                </div>
                <div>
                  <Card.Title className="text-muted mb-1">Total Peternak</Card.Title>
                  <h2 className="mb-1 text-info">{totalFarmers}</h2>
                  <small className="text-success">+1 peternak baru</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <p className="text-muted text-end">
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
                    <Card.Title className="text-muted mb-1">{stat.title}</Card.Title>
                    <h4 className="mb-0">{stat.value}</h4>
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
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-primary mb-3">Produksi Susu Mingguan</Card.Title>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={milkProductionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value}L`} />
                      <Tooltip formatter={(value) => [`${value} L`, "Volume"]} />
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
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-warning mb-3">Penggunaan Pakan Mingguan</Card.Title>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value}kg`} />
                      <Tooltip formatter={(value) => [`${value} kg`, "Pakan"]} />
                      <Bar dataKey="feed" fill="#ffc107" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* Chart 3: Income Trends */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-success mb-3">Tren Pendapatan</Card.Title>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={incomeData}>
                      <defs>
                        <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#198754" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#198754" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value} Jt`} />
                      <Tooltip formatter={(value) => [`Rp ${value} Jt`, "Pendapatan"]} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#198754"
                        strokeWidth={2}
                        fill="url(#incomeColor)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar Charts */}
          <Col lg={4}>
            {/* Chart 4: Health Check Frequency */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-primary mb-3">Frekuensi Pemeriksaan Kesehatan</Card.Title>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthCheckData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kali`, "Pemeriksaan"]} />
                      <Bar dataKey="checks" fill="#6f42c1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* Chart 5: Cow Efficiency */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-danger mb-3">Efisiensi Sapi</Card.Title>
                <div style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={efficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value} L/kg`} />
                      <Tooltip formatter={(value) => [`${value} L/kg`, "Efisiensi"]} />
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
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="text-primary mb-3">Aktivitas Terkini</Card.Title>
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
                        <small className="text-muted">{activity.time}</small>
                        <p className="mb-0">{activity.content}</p>
                      </div>
                    </motion.div>
                  ))}
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