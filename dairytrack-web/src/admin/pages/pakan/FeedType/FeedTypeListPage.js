import { useEffect, useState } from "react";
import { getFeedTypes, deleteFeedType } from "../../../../api/pakan/feedType";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FeedTypeListPage = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeedTypes();
      
      // Check if the response has the 'feedTypes' key
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
  
        // Jika respons sukses atau tidak ada error, anggap berhasil
        Swal.fire("Terhapus!", "Jenis pakan berhasil dihapus.", "success");
        
        // Tunggu sedikit sebelum refresh data agar perubahan terlihat
        setTimeout(fetchData, 500);
  
      } catch (error) {
        console.error("Gagal menghapus jenis pakan:", error.message);
        Swal.fire("Error!", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Feed Type Data</h2>
        <button
          onClick={() => navigate("/admin/pakan/jenis/tambah")}
          className="btn btn-info waves-effect waves-light"
        >
          + Add Feed Type
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading feed type data...</p>
        </div>
      ) : feedTypes.length === 0 ? (
        <p className="text-gray-500">No feed type data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Feed Type Data</h4>
              <p className="card-title-desc">
                This table provides a list of feed types registered on the farm.
              </p>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedTypes.map((feed, index) => (
                      <tr key={feed.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{feed.name}</td>
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
                            aria-label={`Delete feed type ${feed.name}`}
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

export default FeedTypeListPage;
