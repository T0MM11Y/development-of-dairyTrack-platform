import { useEffect, useState } from "react";
import { getFeeds, deleteFeed } from "../../../../api/pakan/feed";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CreateFeedPage from "./CreateFeed";
import FeedDetailPage from "./FeedDetailPage";

const FeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeeds();
      if (response.success && response.feeds) {
        setFeeds(response.feeds);
        setFilteredFeeds(response.feeds);
      } else {
        setFeeds([]);
        setFilteredFeeds([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data pakan:", error.message);
      setFeeds([]);
      setFilteredFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = feeds.filter((feed) =>
      feed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeeds(filtered);
  }, [searchTerm, feeds]);

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

  const handleAddFeed = () => {
    setShowCreateModal(false);
    fetchData(); // Refresh data setelah tambah
  };

  const handleViewDetail = (id) => {
    setSelectedFeedId(id);
    setShowDetailModal(true);
  };

  const handleDetailClose = () => {
    setShowDetailModal(false);
    setSelectedFeedId(null);
    fetchData(); // Refresh data setelah edit
  };

  const formatNumber = (num) => {
    return Number(num).toLocaleString("id-ID").split(",")[0];
  };

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

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Cari nama pakan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading data pakan...</p>
        </div>
      ) : filteredFeeds.length === 0 ? (
        <p className="text-gray-500">Tidak ada data pakan ditemukan.</p>
      ) : (
        <div className="card">
          <div className="card-body table-responsive">
            <table className="table table-striped table-bordered">
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
                {filteredFeeds.map((feed, index) => (
                  <tr key={feed.id}>
                    <td>{index + 1}</td>
                    <td>{feed.name}</td>
                    <td>{feed.feedType?.name || "N/A"}</td>
                    <td>{formatNumber(feed.protein)}</td>
                    <td>{formatNumber(feed.energy)}</td>
                    <td>{formatNumber(feed.fiber)}</td>
                    <td>{formatNumber(feed.min_stock)}</td>
                    <td>Rp {formatNumber(feed.price)}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetail(feed.id)}
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
      )}

      {showCreateModal && (
        <CreateFeedPage
          onFeedAdded={handleAddFeed}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showDetailModal && (
        <FeedDetailPage id={selectedFeedId} onClose={handleDetailClose} />
      )}
    </div>
  );
};

export default FeedListPage;
