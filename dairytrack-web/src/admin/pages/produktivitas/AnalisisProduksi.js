import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getRawMilks } from "../../../api/produktivitas/rawMilk";

const AnalisisProduksi = () => {
  const [rawMilkData, setRawMilkData] = useState([]);
  const [averageData, setAverageData] = useState([]);
  const [dailyTotalData, setDailyTotalData] = useState([]);
  const [statusData, setStatusData] = useState([]); // Data untuk status Fresh vs Expired
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); // Filter waktu

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRawMilks();

        // Format data untuk grafik
        const formattedData = data.map((item) => ({
          date: new Date(item.production_time).toLocaleDateString(),
          volume: parseFloat(item.volume_liters),
          cowCount: item.cow_count || 1,
          status: item.status || "Unknown",
        }));

        // Hitung rata-rata produksi per sapi
        const averageData = formattedData.map((item) => ({
          date: item.date,
          average: item.volume / item.cowCount,
        }));

        // Hitung total produksi harian
        const dailyTotal = formattedData.reduce((acc, item) => {
          const existing = acc.find((entry) => entry.date === item.date);
          if (existing) {
            existing.totalVolume += item.volume;
          } else {
            acc.push({ date: item.date, totalVolume: item.volume });
          }
          return acc;
        }, []);

        // Hitung data status Fresh vs Expired
        const statusData = formattedData.reduce(
          (acc, item) => {
            if (item.status === "fresh") {
              acc[0].count += 1; // Tambahkan ke Fresh
            } else if (item.status === "expired") {
              acc[1].count += 1; // Tambahkan ke Expired
            }
            return acc;
          },
          [
            { status: "Fresh", count: 0 },
            { status: "Expired", count: 0 },
          ]
        );

        setRawMilkData(formattedData);
        setAverageData(averageData);
        setDailyTotalData(dailyTotal);
        setStatusData(statusData);
      } catch (error) {
        console.error("Failed to fetch raw milk data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data berdasarkan waktu
  const filteredData = rawMilkData.filter((item) => {
    if (timeFilter === "all") return true;
    const currentDate = new Date();
    const itemDate = new Date(item.date);
    if (timeFilter === "7days") {
      return currentDate - itemDate <= 7 * 24 * 60 * 60 * 1000;
    }
    if (timeFilter === "30days") {
      return currentDate - itemDate <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  return (
    <div style={{ fontFamily: "Roboto, sans-serif", padding: "20px" }}>
      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Loading data...</p>
      ) : (
        <>
          {/* Filter Waktu */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              htmlFor="timeFilter"
              style={{ fontWeight: "bold", color: "#555" }}
            >
              Filter Waktu:
            </label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="all">Semua Waktu</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
            </select>
          </div>

          {/* Layout Grid untuk Grafik */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {/* Grafik Volume Produksi */}
            <div
              style={{
                height: "300px",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "10px",
              }}
            >
              <h4 style={{ textAlign: "center", color: "#4CAF50" }}>
                Volume Produksi
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Volume Produksi"
                  />
                  <Line
                    type="monotone"
                    dataKey="cowCount"
                    stroke="#82ca9d"
                    name="Jumlah Sapi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grafik Total Produksi Harian */}
            <div
              style={{
                height: "300px",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "10px",
              }}
            >
              <h4 style={{ textAlign: "center", color: "#4CAF50" }}>
                Total Produksi Harian
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyTotalData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalVolume"
                    fill="#8884d8"
                    name="Total Volume Harian"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grafik Status Fresh vs Expired */}
            <div
              style={{
                height: "300px",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "10px",
              }}
            >
              <h4 style={{ textAlign: "center", color: "#4CAF50" }}>
                Status Fresh vs Expired
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Jumlah Status" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grafik Rata-rata Produksi per Sapi */}
            <div
              style={{
                height: "300px",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "10px",
              }}
            >
              <h4 style={{ textAlign: "center", color: "#4CAF50" }}>
                Rata-rata Produksi per Sapi
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={averageData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="average"
                    fill="#ffc658"
                    name="Rata-rata Produksi"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalisisProduksi;
