import { useEffect, useState } from "react";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import Swal from "sweetalert2";
import AddFeedStockPage from "./AddStock";
import EditFeedStockPage from "./EditStock";

// Helper untuk format angka stok
const formatStockNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  if (Number.isInteger(num)) {
    return num.toLocaleString("id-ID");
  }

  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
};

const FeedStockPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [selectedStockId, setSelectedStockId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeedStock();
      console.log("API Response:", response);

      if (response.success && response.feeds) {
        setFeeds(response.feeds);
        setFilteredFeeds(response.feeds); // Initialize filtered feeds
      } else {
        console.error("Unexpected response format", response);
        setFeeds([]);
        setFilteredFeeds([]);
        Swal.fire({
          title: "Gagal",
          text: "Format respons API tidak sesuai.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data feed stock:", error.message);
      setFeeds([]);
      setFilteredFeeds([]);
      Swal.fire({
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat memuat data stok pakan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = feeds.filter((feed) =>
      feed.name?.toLowerCase().includes(query)
    );
    setFilteredFeeds(filtered);
  };

  const handleAddStock = (feedId) => {
    setSelectedFeedId(feedId);
    setShowAddModal(true);
  };

  const handleEditStock = (stockId) => {
    setSelectedStockId(stockId);
    setShowEditModal(true);
  };

  const handleStockAdded = () => {
    setShowAddModal(false);
    setSelectedFeedId(null);
    fetchData();
  };

  const handleStockUpdated = () => {
    setShowEditModal(false);
    setSelectedStockId(null);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Stok Pakan</h2>
        <button
          onClick={() => {
            setSelectedFeedId(null);
            setShowAddModal(true);
          }}
          className="btn btn-info waves-effect waves-light px-4 py-2"
        >
          + Tambah Stok Pakan
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Cari nama pakan..."
          className="form-control w-full sm:w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-info"
        />
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Memuat...</span>
          </div>
          <p className="mt-2">Memuat Data Stok Pakan</p>
        </div>
      ) : filteredFeeds.length === 0 ? (
        <p className="text-gray-500">
          {searchQuery
            ? "Tidak ada pakan yang cocok dengan pencarian"
            : "Tidak ada data pakan yang tersedia"}
        </p>
      ) : (
        <div className="col-lg-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped mb-0 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left w-12">No</th>
                      <th className="py-3 px-4 text-left">Nama Pakan</th>
                      <th className="py-3 px-4 text-left w-28">Stok (kg)</th>
                      <th className="py-3 px-4 text-left w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeeds.map((feed, index) => (
                      <tr key={feed.id}>
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">
                          {feed.name || "Tidak diketahui"}
                        </td>
                        <td className="py-2 px-4">
                          {formatStockNumber(feed.FeedStock?.stock ?? 0)}
                        </td>
                        <td className="py-2 px-4">
                          <div className="d-flex align-items-center gap-2">
                            {feed.FeedStock ? (
                              <>
                                <button
                                  className="btn btn-warning btn-icon btn-sm p-1"
                                  onClick={() =>
                                    handleEditStock(feed.FeedStock.id)
                                  }
                                  title="Edit Stok"
                                  aria-label="Edit Stok"
                                >
                                  <i className="ri-edit-line text-sm" />
                                </button>
                                <button
                                  className="btn btn-info btn-icon btn-sm p-1"
                                  onClick={() => handleAddStock(feed.id)}
                                  title="Tambah Stok"
                                  aria-label="Tambah Stok"
                                >
                                  <i className="ri-add-line text-sm" />
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-info btn-icon btn-sm p-1"
                                onClick={() => handleAddStock(feed.id)}
                                title="Tambah Stok"
                                aria-label="Tambah Stok"
                              >
                                <i className="ri-add-line text-sm" />
                              </button>
                            )}
                          </div>
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

      {/* Modal Add */}
      {showAddModal && (
        <AddFeedStockPage
          preFeedId={selectedFeedId}
          onStockAdded={handleStockAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal Edit */}
      {showEditModal && (
        <EditFeedStockPage
          stockId={selectedStockId}
          onStockUpdated={handleStockUpdated}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default FeedStockPage;
