import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAllDailyFeeds, deleteDailyFeed } from "../../../../api/pakan/dailyFeed";

const DailyFeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllDailyFeeds();
      if (response.success && response.data) {
        setFeeds(response.data);
      } else {
        console.error("Unexpected response format", response);
        setFeeds([]);
      }
    } catch (error) {
      console.error("Failed to fetch daily feeds:", error.message);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm",
      text: "Are you sure you want to delete this feed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDailyFeed(id);
        Swal.fire("Deleted!", "Feed has been deleted.", "success");
        fetchData();
      } catch (error) {
        console.error("Failed to delete feed:", error.message);
        Swal.fire("Error!", "An error occurred while deleting.", "error");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Daily Feeds</h2>
        <button
          onClick={() => navigate("/admin/tambah/pakan-harian")}
          className="btn btn-info waves-effect waves-light"
        >
          + Add Feed
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <p>Loading feeds...</p>
        </div>
      ) : feeds.length === 0 ? (
        <p className="text-gray-500">No feeds available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Daily Feeds</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Farmer ID</th>
                      <th>Cow ID</th>
                      <th>Date</th>
                      <th>Session</th>
                      <th>Weather</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeds.map((feed, index) => (
                      <tr key={feed.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{feed.farmer_id}</td>
                        <td>{feed.cow_id}</td>
                        <td>{feed.date}</td>
                        <td>{feed.session}</td>
                        <td>{feed.weather || "No weather data"}</td>
                        <td>
                          <button
                            className="btn btn-info waves-effect waves-light mr-2"
                            onClick={() => navigate(`/admin/daily-feed/edit/${feed.id}`)}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(feed.id)}
                            className="btn btn-danger waves-effect waves-light"
                          >
                            <i className="ri-delete-bin-6-line"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyFeedListPage;
