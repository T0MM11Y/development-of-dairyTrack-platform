import { useEffect, useState } from "react";
import { getFeeds, deleteFeed } from "../../../../api/pakan/feed";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeeds();
      console.log("API Response:", response); // Debugging
  
      if (response.success && response.feeds) {
        setFeeds(response.feeds);
      } else {
        console.error("Unexpected response format", response);
        setFeeds([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data pakan:", error.message);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pakan akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteFeed(id);
      Swal.fire({
        title: "Terhapus!",
        text: "Pakan berhasil dihapus.",
        icon: "success",
        confirmButtonText: "OK",
      });
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus pakan:", error.message);
      Swal.fire({
        title: "Error!",
        text: "Gagal menghapus pakan: " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Feed Data</h2>
        <button
          onClick={() => navigate("/admin/pakan/tambah")}
          className="btn btn-info waves-effect waves-light"
        >
          + Add Feed
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading feed data...</p>
        </div>
      ) : feeds.length === 0 ? (
        <p className="text-gray-500">No feed data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Feed Data</h4>
              <p className="card-title-desc">
                This table provides a list of feeds registered on the farm.
              </p>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Protein (%)</th>
                      <th>Energy (kcal/kg)</th>
                      <th>Fiber (%)</th>
                      <th>Min Stock</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeds.map((feed, index) => (
                      <tr key={feed.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{feed.name}</td>
                        <td>{feed.feedType?.name || "N/A"}</td>
                        <td>{feed.protein}</td>
                        <td>{feed.energy}</td>
                        <td>{feed.fiber}</td>
                        <td>{feed.min_stock}</td>
                        <td>{feed.price}</td>
                        <td>
                          <button
                            className="btn btn-info waves-effect waves-light mr-2"
                            onClick={() => navigate(`/admin/peternakan/pakan/detail/${feed.id}`)}
                            aria-label={`View details of ${feed.name}`}
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(feed.id)}
                            className="btn btn-danger waves-effect waves-light"
                            aria-label={`Delete feed ${feed.name}`}
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

export default FeedListPage;
