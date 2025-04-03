import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getDailyFeedSession,
  deleteDailyFeedSession,
} from "../../../../api/pakan/session";

const DailyFeedSessionListPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDailyFeedSession();
      console.log("Fetched sessions:", response.sessions); // Lihat struktur data
      if (response.success && response.sessions) {
        setSessions(response.sessions);
      } else {
        console.error("Unexpected response format", response);
        setSessions([]);
      }
    } catch (error) {
      console.error("Failed to fetch daily feed sessions:", error.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm",
      text: "Are you sure you want to delete this session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDailyFeedSession(id);
        Swal.fire("Deleted!", "Session has been deleted.", "success");
        setTimeout(fetchData, 500);
      } catch (error) {
        console.error("Failed to delete session:", error.message);
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
        <h2 className="text-xl font-bold text-gray-800">Daily Feed Sessions</h2>
        <button
          onClick={() => navigate("/admin/pakan/sesi/tambah")}
          className="btn btn-info waves-effect waves-light"
        >
          + Add Session
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <p>Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No sessions available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Daily Feed Sessions</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length > 0 &&
                      console.log("Sessions data:", sessions)}
                    {sessions.map((session, index) => (
                      <tr key={session.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{session.date || "No Date"}</td>
                        <td>{session.time || "No Time"}</td>
                        <td>
                          <button
                            className="btn btn-info waves-effect waves-light mr-2"
                            onClick={() =>
                              navigate(`/admin/pakan/sesi/detail/${session.id}`)
                            }
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
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

export default DailyFeedSessionListPage;
