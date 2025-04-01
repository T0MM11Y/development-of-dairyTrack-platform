import { useEffect, useState } from "react";
import {
  getDailyFeedDetails,
  deleteDailyFeedDetail,
} from "../../../../api/pakan/dailyFeedDetail";
import { getDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DailyFeedDetailPage = () => {
  const [dailyFeedDetails, setDailyFeedDetails] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [feedDetailsResponse, dailyFeedsResponse, cowResponse, farmerResponse] = await Promise.all([
        getDailyFeedDetails(),
        getDailyFeeds(),
        getCows(),
        getFarmers(),
      ]);

      console.log("Daily Feed Details:", feedDetailsResponse);
      console.log("Daily Feeds:", dailyFeedsResponse);
      console.log("Cows:", cowResponse);
      console.log("Farmers:", farmerResponse);

      // Handle different response structures
      // For daily feed details
      const detailsData = feedDetailsResponse?.success 
        ? feedDetailsResponse.data 
        : (Array.isArray(feedDetailsResponse) ? feedDetailsResponse : []);
      
      // For daily feeds
      const feedsData = dailyFeedsResponse?.success 
        ? dailyFeedsResponse.feeds 
        : (Array.isArray(dailyFeedsResponse) ? dailyFeedsResponse : []);
      
      // For cows
      const cowsData = cowResponse?.success 
        ? cowResponse.cows 
        : (Array.isArray(cowResponse) ? cowResponse : []);
      
      // For farmers
      const farmersData = farmerResponse?.success 
        ? farmerResponse.farmers 
        : (Array.isArray(farmerResponse) ? farmerResponse : []);
      
      setDailyFeedDetails(detailsData);
      setDailyFeeds(feedsData);
      setCows(cowsData);
      setFarmers(farmersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
      Swal.fire("Error!", "Failed to fetch data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This daily feed data will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const deleteResponse = await deleteDailyFeedDetail(id);
      if (deleteResponse?.success) {
        Swal.fire("Deleted!", "Data has been deleted.", "success");
        fetchData();
      } else {
        throw new Error(deleteResponse?.message || "Failed to delete the data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daily Feed Detail</h2>
        <button
          onClick={() => navigate("/admin/tambah/detail-pakan-harian")}
          className="btn btn-success"
        >
          + Add Daily Feed Detail
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : dailyFeedDetails.length === 0 ? (
        <p className="text-gray-500">No daily feed data available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Farmer</th>
              <th>Cow</th>
              <th>Feed Quantity</th>
              <th>Session</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dailyFeedDetails.map((detail, index) => {
              // Find the corresponding daily feed record
              const dailyFeed = dailyFeeds.find(df => df.id === detail.daily_feed_id);
              
              // Find corresponding farmer and cow (using the same approach as DailyFeedPage)
              const farmer = dailyFeed ? farmers.find(f => f.id === dailyFeed.farmer_id) : null;
              const cow = dailyFeed ? cows.find(c => c.id === dailyFeed.cow_id) : null;

              // Create display names with better fallbacks
              const farmerName = farmer
                ? `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || farmer.name
                : dailyFeed ? `Farmer #${dailyFeed.farmer_id}` : "Unknown";
              
              const cowName = cow
                ? (cow.name || `Cow #${dailyFeed?.cow_id}`)
                : dailyFeed ? `Cow #${dailyFeed.cow_id}` : "Unknown";

              return (
                <tr key={detail.id}>
                  <td>{index + 1}</td>
                  <td>{farmerName}</td>
                  <td>{cowName}</td>
                  <td>{detail.quantity}</td>
                  <td>{detail.session}</td>
                  <td>{dailyFeed ? formatDate(dailyFeed.date) : "-"}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(detail.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DailyFeedDetailPage;