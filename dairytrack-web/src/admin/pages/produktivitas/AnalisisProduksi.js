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
} from "recharts";
import { getRawMilks } from "../../../api/produktivitas/rawMilk";

const AnalisisProduksi = () => {
  const [rawMilkData, setRawMilkData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minVolume, setMinVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRawMilks();
        const formattedData = data.map((item) => ({
          date: new Date(item.production_time).toLocaleDateString(),
          volume: parseFloat(item.volume_liters),
          status: item.status || "Unknown",
          cowCount: item.cow_count || 1,
        }));
        setRawMilkData(formattedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = rawMilkData.filter((item) => {
      const currentDate = new Date();
      const itemDate = new Date(item.date);
      if (
        timeFilter === "7days" &&
        currentDate - itemDate > 7 * 24 * 60 * 60 * 1000
      )
        return false;
      if (
        timeFilter === "30days" &&
        currentDate - itemDate > 30 * 24 * 60 * 60 * 1000
      )
        return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (item.volume < minVolume) return false;
      return true;
    });
    setFilteredData(filtered);
  }, [rawMilkData, timeFilter, statusFilter, minVolume]);

  return (
    <div
      style={{
        fontFamily: "Roboto, sans-serif",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        marginBottom: "120px",
      }}
    >
      <h3
        style={{ textAlign: "center", color: "#4CAF50", marginBottom: "20px" }}
      >
        Analisis Produksi Susu
      </h3>

      {/* Filter Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Filter Waktu:
          </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="all">Semua Waktu</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
          </select>
        </div>
        <div>
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="all">Semua</option>
            <option value="fresh">Fresh</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div>
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Min Volume:
          </label>
          <input
            type="number"
            value={minVolume}
            onChange={(e) => setMinVolume(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          height: "300px",
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4
          style={{
            textAlign: "center",
            color: "#4CAF50",
            marginBottom: "10px",
          }}
        >
          Tren Produksi Susu
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
              name="Volume"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div
        style={{
          marginTop: "20px",
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4
          style={{
            textAlign: "center",
            color: "#4CAF50",
            marginBottom: "10px",
          }}
        >
          Detail Produksi Susu
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#4CAF50", color: "#fff" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Tanggal</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Volume (Liter)
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Jumlah Sapi
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{item.date}</td>
                <td style={{ padding: "10px" }}>{item.volume}</td>
                <td style={{ padding: "10px" }}>{item.status}</td>
                <td style={{ padding: "10px" }}>{item.cowCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalisisProduksi;
