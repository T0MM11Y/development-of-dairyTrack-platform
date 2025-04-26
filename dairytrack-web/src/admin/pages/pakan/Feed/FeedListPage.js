import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeeds, deleteFeed } from "../../../../api/pakan/feed";
import { getNutritions } from "../../../../api/pakan/nutrient";
import Swal from "sweetalert2";
import CreateFeedPage from "./CreateFeed";

const FeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [nutritions, setNutritions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch feeds
      const feedResponse = await getFeeds();
      console.log("getFeeds Response:", feedResponse);
      if (feedResponse.success && (feedResponse.data || feedResponse.feeds || feedResponse.pakan)) {
        const feedData = feedResponse.data || feedResponse.feeds || feedResponse.pakan;
        console.log("Processed feedData:", feedData);
        setFeeds(feedData);
        setFilteredFeeds(feedData);
      } else {
        console.warn("No valid feed data found:", feedResponse);
        setFeeds([]);
        setFilteredFeeds([]);
      }

      // Fetch nutritions
      const nutritionResponse = await getNutritions();
      console.log("getNutritions Response:", nutritionResponse);
      if (nutritionResponse.success && nutritionResponse.nutrisi) {
        console.log("Processed nutritions:", nutritionResponse.nutrisi);
        setNutritions(nutritionResponse.nutrisi);
      } else {
        console.warn("No valid nutrition data found:", nutritionResponse);
        setNutritions([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error.message, error);
      setFeeds([]);
      setFilteredFeeds([]);
      setNutritions([]);
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
    console.log("Filtered feeds:", filtered);
    setFilteredFeeds(filtered);
  }, [searchTerm, feeds]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus pakan "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteFeed(id);
      if (response.success || response === true) {
        Swal.fire({
          title: "Berhasil!",
          text: "Pakan berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } else {
        throw new Error(response.message || "Gagal menghapus pakan.");
      }
    } catch (error) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan saat menghapus pakan.", "error");
    }
  };

  const handleAddFeed = () => {
    setShowCreateModal(false);
    fetchData();
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-pakan/${id}`);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    return Number(num).toLocaleString("id-ID").split(",")[0];
  };

  // Get nutrition details for a feed
  const getFeedNutritionDetails = (feed) => {
    if (!feed.FeedNutrisiRecords || !Array.isArray(feed.FeedNutrisiRecords)) {
      return [];
    }
    
    return feed.FeedNutrisiRecords.map(record => {
      const nutrisi = record.Nutrisi || {
        name: "Unknown",
        unit: ""
      };
      
      return {
        id: record.nutrisi_id,
        name: nutrisi.name,
        value: parseFloat(record.amount),
        unit: nutrisi.unit
      };
    });
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

      <div className="mb-3" style={{ maxWidth: "250px" }}>
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
                  <th>No</th>
                  <th>Nama</th>
                  <th>Jenis</th>
                  <th>Nutrisi</th>
                  <th>Stok Minimum</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeeds.map((feed, index) => {
                  const nutritionDetails = getFeedNutritionDetails(feed);
                  
                  return (
                    <tr key={feed.id}>
                      <td>{index + 1}</td>
                      <td>{feed.name}</td>
                      <td>{feed.FeedType?.name || "N/A"}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          {nutritionDetails.length > 0 ? (
                            nutritionDetails.map((nutrisi, idx) => (
                              <div 
                                key={idx} 
                                className="rounded bg-light p-2 text-center" 
                                style={{ minWidth: '120px' }}
                              >
                                <div className="fw-medium">{nutrisi.name}</div>
                                <small className="text-muted">
                                  {formatNumber(nutrisi.value)} {nutrisi.unit}
                                </small>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted">Tidak ada data nutrisi</span>
                          )}
                        </div>
                      </td>
                      <td>{formatNumber(feed.min_stock)}</td>
                      <td>Rp {formatNumber(feed.price)}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEdit(feed.id)}
                            aria-label={`Edit ${feed.name}`}
                            style={{ borderRadius: "6px" }}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(feed.id, feed.name)}
                            className="btn btn-danger btn-sm"
                            aria-label={`Hapus ${feed.name}`}
                          >
                            <i className="ri-delete-bin-6-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
};

export default FeedListPage;