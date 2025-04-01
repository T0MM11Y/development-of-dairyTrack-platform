import { useEffect, useState } from "react";
import {
  getDailyFeedDetails,
  deleteDailyFeedDetail,
  createDailyFeedDetail,
} from "../../../../api/pakan/dailyFeedDetail";
import { getCows } from "../../../../api/peternakan/cow";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DailyFeedDetailPage = () => {
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
      const [feedResponse, cowResponse, farmerResponse] = await Promise.all([
        getDailyFeedDetails(),
        getCows(),
        getFarmers(),
      ]);

      setDailyFeeds(feedResponse?.success ? feedResponse.data : []);
      setCows(cowResponse?.success ? cowResponse.cows : []);
      setFarmers(farmerResponse?.success ? farmerResponse.farmers : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
      Swal.fire("Error!", "Failed to fetch data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (newFeedData) => {
    try {
      setLoading(true);
      const response = await createDailyFeedDetail(newFeedData);

      if (response.success) {
        Swal.fire("Success!", "Daily feed added successfully.", "success");
        fetchData();
      } else if (
        response.message === "Data already exists for the given session and feed"
      ) {
        Swal.fire({
          title: "Duplicate Entry",
          html: `This feed already exists for ${response.existing.session} session.<br>
                Existing ID: ${response.existing.id}`,
          icon: "warning",
        });
      } else {
        throw new Error(response.message || "Failed to add daily feed");
      }
    } catch (error) {
      console.error("Error adding daily feed:", error);
      Swal.fire("Error!", error.message, "error");
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
      ) : dailyFeeds.length === 0 ? (
        <p className="text-gray-500">No daily feed data available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Farmer</th>
              <th>Cow</th>
              <th>Feed Quantity</th>
              <th>Weather</th>
              <th>Session</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dailyFeeds.map((feed, index) => {
              const farmerName =
                farmers.find((f) => f.id === feed.farmer_id)?.name || "Unknown";
              const cowName =
                cows.find((c) => c.id === feed.cow_id)?.name || "Unknown";

              return (
                <tr key={feed.id}>
                  <td>{index + 1}</td>
                  <td>{farmerName}</td>
                  <td>{cowName}</td>
                  <td>{feed.quantity}</td>
                  <td>{feed.weather}</td>
                  <td>{feed.session}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(feed.id)}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
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
