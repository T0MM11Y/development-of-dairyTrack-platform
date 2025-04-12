import { useEffect, useState } from "react";
import { getFeeds } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";
import { getAlldailyFeedItems } from "../../../../api/pakan/dailyFeedItem";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const FeedAnalyticsDashboard = () => {
  const [totalFeeds, setTotalFeeds] = useState(0);
  const [totalFeedTypes, setTotalFeedTypes] = useState(0);
  const [feedConsumptionData, setFeedConsumptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [feedsResponse, feedTypesResponse, dailyFeedItemsResponse] = await Promise.all([
          getFeeds(),
          getFeedTypes(),
          getAlldailyFeedItems()
        ]);

        // Process total feeds
        if (feedsResponse.success && feedsResponse.data) {
          setTotalFeeds(feedsResponse.data.length);
        } else {
          setTotalFeeds(0);
        }

        // Process total feed types
        if (feedTypesResponse.success && feedTypesResponse.data) {
          setTotalFeedTypes(feedTypesResponse.data.length);
        } else {
          setTotalFeedTypes(0);
        }

        // Process daily feed items for the chart
        if (dailyFeedItemsResponse.success && dailyFeedItemsResponse.data) {
          // Aggregate feed amounts by date
          const feedByDate = dailyFeedItemsResponse.data.reduce((acc, item) => {
            const date = new Date(item.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += item.amount || 0; // Assuming 'amount' is the field for feed quantity
            return acc;
          }, {});

          // Convert to array and sort by date
          const chartData = Object.keys(feedByDate)
            .map(date => ({
              date,
              amount: feedByDate[date]
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

          setFeedConsumptionData(chartData);
        } else {
          setFeedConsumptionData([]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err.message);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feed Analytics Dashboard</h1>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Feeds</h2>
              <p className="text-3xl font-bold text-blue-600">{totalFeeds}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Feed Types</h2>
              <p className="text-3xl font-bold text-green-600">{totalFeedTypes}</p>
            </div>
          </div>

          {/* Feed Consumption Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Feed Consumption Over Time</h2>
            {feedConsumptionData.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No feed consumption data available.
              </div>
            ) : (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feedConsumptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      label={{ value: 'Amount (kg)', angle: -90, position: 'insideLeft', fontSize: 14 }} 
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: 12 }} 
                      formatter={(value) => `${value} kg`} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedAnalyticsDashboard;