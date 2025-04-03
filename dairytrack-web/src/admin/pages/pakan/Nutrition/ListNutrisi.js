import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";

const NutritionListPage = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dailyFeedsResponse, cowsResponse] = await Promise.all([
          getAllDailyFeeds(),
          getCows(),
        ]);

        if (dailyFeedsResponse.success) {
          const mappedData = dailyFeedsResponse.data.map(feed => {
            const cow = cowsResponse.data.find(c => c.id === feed.cow_id);
            return {
              cow: cow ? cow.name : "Tidak Ada Info Sapi",
              date: feed.date,
              total_protein: parseFloat(feed.total_protein),
              total_energy: parseFloat(feed.total_energy),
              total_fiber: parseFloat(feed.total_fiber),
            };
          });
          setNutritionData(mappedData);
        }
        setCows(cowsResponse.success ? cowsResponse.data : []);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
        setNutritionData([]);
        setCows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Nutrisi Pakan Harian</h2>
      </div>

      {loading ? (
        <p className="text-center">Loading data...</p>
      ) : nutritionData.length === 0 ? (
        <p className="text-gray-500">Tidak ada data nutrisi tersedia.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Data Nutrisi Pakan Harian</h4>
              <table className="table table-bordered table-striped mb-4">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Sapi</th>
                    <th>Total Protein</th>
                    <th>Total Energi</th>
                    <th>Total Serat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.date}</td>
                      <td>{data.cow}</td>
                      <td>{data.total_protein} g</td>
                      <td>{data.total_energy} kcal</td>
                      <td>{data.total_fiber} g</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => navigate(`/admin/nutrisi/grafik/${data.date}`)}
                        >
                          <i className="ri-bar-chart-box-line"></i> Lihat Grafik
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="mt-4">Grafik Nutrisi</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={nutritionData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_protein" fill="#8884d8" name="Protein" />
                  <Bar dataKey="total_energy" fill="#82ca9d" name="Energi" />
                  <Bar dataKey="total_fiber" fill="#ffc658" name="Serat" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionListPage;
