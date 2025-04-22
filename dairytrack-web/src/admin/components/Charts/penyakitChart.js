import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { getDiseaseHistories } from "../../../api/kesehatan/diseaseHistory";

const StatistikPenyakitTerkonfirmasi = () => {
  const [chartDiseaseData, setChartDiseaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiseaseData = async () => {
      try {
        const diseaseHistories = await getDiseaseHistories(); // Panggil API untuk mendapatkan data penyakit
        const groupedData = diseaseHistories.reduce((acc, curr) => {
          const key = curr.disease_name || "Tidak Diketahui";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const chartData = Object.entries(groupedData).map(([name, value]) => ({
          name,
          value,
        }));
        setChartDiseaseData(chartData);
      } catch (error) {
        console.error("Error fetching disease data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="text-center mb-3 text-secondary">
          🦠 Statistik Penyakit Terkonfirmasi
        </h5>
        <ResponsiveContainer width="100%" height={370}>
          <BarChart
            data={chartDiseaseData}
            margin={{ top: 20, right: 40, bottom: 80, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={15}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#00BFFF" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatistikPenyakitTerkonfirmasi;
