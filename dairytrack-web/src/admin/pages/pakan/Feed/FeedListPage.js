import { useEffect, useState } from "react";
import { getFeeds, deleteFeed } from "../../../../api/pakan/feed";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CreateFeedPage from "./CreateFeed";
import EditFeedModal from "./FeedDetailPage";

const FeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFeedId, setEditFeedId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeeds();
      if (response.success && response.feeds) {
        setFeeds(response.feeds);
      } else {
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
      Swal.fire("Terhapus!", "Pakan berhasil dihapus.", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan.", "error");
    }
  };

  const handleEdit = (id) => {
    setEditFeedId(id);
  };

  const handleCloseEdit = () => {
    setEditFeedId(null);
  };

  const handleFeedUpdated = () => {
    fetchData(); // Refresh data setelah update
  };

  const handleAddFeed = () => {
    setShowCreateModal(false);
    fetchData(); // Refresh data setelah tambah
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Data Pakan</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info waves-effect waves-light"
        >
          + Tambah Pakan
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading feed data...</p>
        </div>
      ) : feeds.length === 0 ? (
        <p className="text-gray-500">Tidak ada data pakan tersedia.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Jenis</th>
                    <th>Protein (%)</th>
                    <th>Energi (kcal/kg)</th>
                    <th>Serat (%)</th>
                    <th>Stok Minimum</th>
                    <th>Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {feeds.map((feed, index) => (
                    <tr key={feed.id}>
                      <td>{index + 1}</td>
                      <td>{feed.name}</td>
                      <td>{feed.feedType?.name || "N/A"}</td>
                      <td>{feed.protein}</td>
                      <td>{feed.energy}</td>
                      <td>{feed.fiber}</td>
                      <td>{feed.min_stock}</td>
                      <td>Rp {feed.price.toLocaleString('id-ID')}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(feed.id)}
                          className="btn btn-info btn-sm me-2"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(feed.id)}
                          className="btn btn-danger btn-sm"
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
      )}
      
      {/* Create Modal */}
      {showCreateModal && (
        <CreateFeedPage 
          onFeedAdded={handleAddFeed} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
      
      {/* Edit Modal */}
      {editFeedId && (
        <EditFeedModal
          feedId={editFeedId}
          onFeedUpdated={handleFeedUpdated}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default FeedListPage;