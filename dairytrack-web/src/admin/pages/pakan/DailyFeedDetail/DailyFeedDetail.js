import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAllDailyFeedDetails, deleteDailyFeedDetail } from "../../../../api/pakan/dailyFeedDetail";

const DailyFeedDetailListPage = () => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllDailyFeedDetails();
      if (response.success && response.data) {
        setDetails(response.data);
      } else {
        console.error("Unexpected response format", response);
        setDetails([]);
      }
    } catch (error) {
      console.error("Failed to fetch daily feed details:", error.message);
      setDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm",
      text: "Are you sure you want to delete this detail?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDailyFeedDetail(id);
        Swal.fire("Deleted!", "Detail has been deleted.", "success");
        fetchData();
      } catch (error) {
        console.error("Failed to delete detail:", error.message);
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
        <h2 className="text-xl font-bold text-gray-800">Daily Feed Details</h2>
        <button
          onClick={() => navigate("/admin/tambah/detail-pakan-harian")}
          className="btn btn-info waves-effect waves-light"
        >
          + Add Detail
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <p>Loading details...</p>
        </div>
      ) : details.length === 0 ? (
        <p className="text-gray-500">No details available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Daily Feed Details</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Session ID</th>
                      <th>Feed ID</th>
                      <th>Quantity</th>
                      <th>Weather</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={detail.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{detail.daily_feed_session_id}</td>
                        <td>{detail.feed_id}</td>
                        <td>{detail.quantity}</td>
                        <td>{detail.weather || "No weather data"}</td>
                        <td>
                          <button
                            className="btn btn-info waves-effect waves-light mr-2"
                            onClick={() => navigate(`/admin/pakan/detail/edit/${detail.id}`)}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(detail.id)}
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

export default DailyFeedDetailListPage;
