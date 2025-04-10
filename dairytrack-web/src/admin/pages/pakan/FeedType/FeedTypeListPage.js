import { useEffect, useState } from "react";
import { getFeedTypes, deleteFeedType } from "../../../../api/pakan/feedType";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CreateFeedTypeModal from "./CreateFeedType"; // pastikan path-nya sesuai

const FeedTypeListPage = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeedTypes();
      if (response.success && response.feedTypes) {
        setFeedTypes(response.feedTypes);
      } else {
        console.error("Unexpected response format", response);
        setFeedTypes([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data jenis pakan:", error.message);
      setFeedTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah anda yakin ingin menghapus jenis pakan ini?",
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
        console.log("Response dari deleteFeedType:", response);

        Swal.fire("Terhapus!", "Jenis pakan berhasil dihapus.", "success");
        setFeedTypes(feedTypes.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Gagal menghapus jenis pakan:", error.message);
        Swal.fire("Error!", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  const handleAddFeedType = (newFeedType) => {
    setFeedTypes((prev) => [...prev, newFeedType]);
    setShowModal(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl fw-bold text-dark">Data Jenis Pakan</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-info waves-effect waves-light"
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
        <p className="text-muted">Belum ada data jenis pakan.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
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
                          className="btn btn-info btn-sm me-2"
                          onClick={() =>
                            navigate(`/admin/detail/jenis-pakan/${feed.id}`)
                          }
                          aria-label={`Lihat detail ${feed.name}`}
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(feed.id)}
                          aria-label={`Hapus jenis ${feed.name}`}
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

      {showModal && (
        <CreateFeedTypeModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAddFeedType}
        />
      )}
    </div>
  );
};

export default FeedTypeListPage;
