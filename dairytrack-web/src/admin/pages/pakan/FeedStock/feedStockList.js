import { useEffect, useState } from "react";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import Swal from "sweetalert2";
import AddFeedStockPage from "./AddStock";
import EditFeedStockPage from "./EditStock";

// Helper function to format stock numbers
const formatStockNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  // Use toFixed(2) to show two decimal places, then add thousand separators
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const FeedStockPage = () => {
  const [feedStock, setFeedStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStockId, setEditStockId] = useState(null);
  const [preFeedId, setPreFeedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeedStock();
      console.log("API Response:", response);

      if (response.success && response.stocks) {
        setFeedStock(response.stocks);
      } else {
        console.error("Unexpected response format", response);
        setFeedStock([]);
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
      setFeedStock([]);
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

  const handleAddStock = (feedId) => {
    setPreFeedId(feedId);
    setShowAddModal(true);
  };

  const handleEditStock = (stockId) => {
    setEditStockId(stockId);
    setShowEditModal(true);
  };

  const handleStockAdded = () => {
    setShowAddModal(false);
    setPreFeedId(null); // Reset preFeedId
    fetchData(); // Refresh the list
  };

  const handleStockUpdated = () => {
    setShowEditModal(false);
    setEditStockId(null);
    fetchData(); // Refresh the list
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setPreFeedId(null); // Reset preFeedId when closing modal
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
            setPreFeedId(null); // Ensure no preselected feed
            setShowAddModal(true);
          }}
          className="btn btn-info waves-effect waves-light"
        >
          + Tambah Stok Pakan
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Memuat...</span>
          </div>
          <p className="mt-2">Memuat Data Stok Pakan</p>
        </div>
      ) : feedStock.length === 0 ? (
        <p className="text-gray-500">Tidak ada data stok pakan yang tersedia</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Stok (kg)</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedStock.map((item, index) => (
                      <tr key={item.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{item.Feed?.name || "Unknown"}</td>
                        <td>{formatStockNumber(item.stock)}</td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm waves-effect waves-light me-3"
                            onClick={() => handleEditStock(item.id)}
                            style={{ padding: "6px 12px" }}
                          >
                            <i
                              className="ri-edit-line"
                              style={{ fontSize: "1.2rem" }}
                            ></i>
                          </button>
                          <button
                            className="btn btn-info waves-effect waves-light"
                            onClick={() => handleAddStock(item.Feed?.id)}
                            style={{ padding: "6px 12px" }}
                          >
                            <i
                              className="ri-add-line"
                              style={{ fontSize: "1.2rem" }}
                            ></i>
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

      {showAddModal && (
        <AddFeedStockPage
          preFeedId={preFeedId}
          onStockAdded={handleStockAdded}
          onClose={handleAddModalClose}
        />
      )}

      {showEditModal && (
        <EditFeedStockPage
          stockId={editStockId}
          onStockUpdated={handleStockUpdated}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default FeedStockPage;
