import { useEffect, useState } from "react";
import { getFeedTypes, deleteFeedType } from "../../../../api/pakan/feedType";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CreateFeedTypeModal from "./CreateFeedType";
import FeedTypeDetailEditModal from "./FeedTypeDetail";

const FeedTypeListPage = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeedTypes();
      if (response.success && response.feedTypes) {
        setFeedTypes(response.feedTypes);
      } else {
        console.error("Format respons tidak sesuai", response);
        setFeedTypes([]);
      }
    } catch (error) {
      console.error("Gagal mengambil jenis pakan:", error.message);
      setFeedTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Apakah Anda ingin menghapus jenis pakan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteFeedType(id);
        console.log("Respon Hapus:", response);

        Swal.fire("Terhapus!", "Jenis pakan telah dihapus.", "success");
        setFeedTypes(feedTypes.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Gagal menghapus jenis pakan:", error.message);
        Swal.fire("Kesalahan!", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  const handleAddFeedType = (newFeedType) => {
    setFeedTypes((prev) => [...prev, newFeedType]);
    setShowCreateModal(false);
  };

  const handleUpdateFeedType = (updatedFeedType) => {
    setFeedTypes((prev) =>
      prev.map((item) =>
        item.id === updatedFeedType.id ? { ...item, ...updatedFeedType } : item
      )
    );
    setShowDetailModal(false);
  };

  const handleViewFeedType = (id) => {
    setSelectedFeedId(id);
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl fw-bold text-dark">Data Jenis Pakan</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info waves-effect waves-light"
          style={{
            borderRadius: "8px",
            padding: "8px 20px",
            fontSize: "1rem",
          }}
        >
          + Tambah Jenis Pakan
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Memuat data jenis pakan...</p>
        </div>
      ) : feedTypes.length === 0 ? (
        <p className="text-muted">Tidak ada data jenis pakan tersedia.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {feedTypes.map((feed, index) => (
                    <tr key={feed.id}>
                      <td>{index + 1}</td>
                      <td>{feed.name}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleViewFeedType(feed.id)}
                          aria-label={`Ubah ${feed.name}`}
                          style={{ borderRadius: "6px" }}
                        >
                          <i className="ri-edit-line"></i> 
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(feed.id)}
                          aria-label={`Hapus ${feed.name}`}
                          style={{ borderRadius: "6px" }}
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

      {showCreateModal && (
        <CreateFeedTypeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleAddFeedType}
        />
      )}

      {showDetailModal && (
        <FeedTypeDetailEditModal
          feedId={selectedFeedId}
          onClose={() => setShowDetailModal(false)}
          onSuccess={handleUpdateFeedType}
        />
      )}
    </div>
  );
};

export default FeedTypeListPage;