import { useEffect, useState } from "react";
import { getFeedStock } from "../../../../api/pakan/feedstock";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FeedStockPage = () => {
  const [feedStock, setFeedStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      }
    } catch (error) {
      console.error("Gagal mengambil data feed stock:", error.message);
      setFeedStock([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (feedId) => {
    if (!feedId) {
      Swal.fire("Error", "Feed ID not found!", "error");
      return;
    }
    navigate(`/admin/pakan/tambah-stok?feedId=${feedId}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Feed Stock Data</h2>
        <button
          onClick={() => navigate("/admin/pakan/tambah-stok")}
          className="btn btn-success waves-effect waves-light"
        >
          + Add Stock
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading feed stock data...</p>
        </div>
      ) : feedStock.length === 0 ? (
        <p className="text-gray-500">No feed stock data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Feed Stock Data</h4>
              <p className="card-title-desc">
                This table provides a list of feed stock currently available.
              </p>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Stock (kg)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedStock.map((item, index) => (
                      <tr key={item.id}>
                        <th scope="row">{index + 1}</th>
                        <td>{item.feed?.name || "Unknown"}</td>
                        <td>{item.stock}</td>
                        <td>
                          <button
                            className="btn btn-info waves-effect waves-light mr-2"
                            onClick={() => navigate(`/feedstock/${item.id}`)}
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          <button
                            onClick={() => handleAddStock(item.feed?.id)}
                            className="btn btn-success waves-effect waves-light mr-2"
                          >
                            <i className="ri-add-circle-line"></i>
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

export default FeedStockPage;
