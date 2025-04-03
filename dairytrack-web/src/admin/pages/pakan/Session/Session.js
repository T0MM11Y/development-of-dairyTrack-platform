import { useEffect, useState } from "react";
import { 
    getdailyFeedSessions, 
    deletedailyFeedSessions 
} from "../../../../api/pakan/session";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DailyFeedSessionPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getdailyFeedSessions();
      console.log("Daily Feed Sessions:", response);
      setSessions(response?.success ? response.sessions : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error!", "Gagal mengambil data sesi pakan harian.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data sesi pakan harian akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const deleteResponse = await deletedailyFeedSessions(id);
      if (deleteResponse?.success) {
        Swal.fire("Terhapus!", "Data sesi pakan berhasil dihapus.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal!", "Tidak dapat menghapus data.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Gagal menghapus data.", "error");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daily Feed Sessions</h2>
        <button
          onClick={() => navigate("/admin/tambah/sesi-pakan")}
          className="btn btn-success"
        >
          + Add Daily Feed Session
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No daily feed sessions available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Daily Feed ID</th>
              <th>Session</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => (
              <tr key={session.id}>
                <td>{index + 1}</td>
                <td>{session.daily_feed_id}</td>
                <td>{session.session}</td>
                <td>{new Date(session.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(session.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DailyFeedSessionPage;