import { useEffect, useState } from "react";
import {
  getDailyFeeds,
  deletedailyFeed,
} from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DailyFeedPage = () => {
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedResponse, cowResponse, farmerResponse] = await Promise.all([
        getDailyFeeds(),
        getCows(),
        getFarmers(),
      ]);

      console.log("Daily Feeds:", feedResponse);
      console.log("Cows:", cowResponse);
      console.log("Farmers:", farmerResponse);

      // Handle different response structures
      // For daily feeds
      const feedsData = feedResponse?.success 
        ? feedResponse.feeds 
        : (Array.isArray(feedResponse) ? feedResponse : []);
      
      // For cows
      const cowsData = cowResponse?.success 
        ? cowResponse.cows 
        : (Array.isArray(cowResponse) ? cowResponse : []);
      
      // For farmers
      const farmersData = farmerResponse?.success 
        ? farmerResponse.farmers 
        : (Array.isArray(farmerResponse) ? farmerResponse : []);
      
      setDailyFeeds(feedsData);
      setCows(cowsData);
      setFarmers(farmersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error!", "Gagal mengambil data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data pemberian pakan akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const deleteResponse = await deletedailyFeed(id);
      if (deleteResponse?.success) {
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal!", "Tidak dapat menghapus data.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Gagal menghapus data.", "error");
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daily Feed Data</h2>
        <button
          onClick={() => navigate("/admin/tambah/pakan-harian")}
          className="btn btn-success"
        >
          + Add Daily Feed
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : dailyFeeds.length === 0 ? (
        <div className="alert alert-info">No daily feed data available.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-info">
              <tr>
                <th>#</th>
                <th>Farmer</th>
                <th>Cow</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dailyFeeds.map((feed, index) => {
                // Find corresponding farmer and cow
                const farmer = farmers.find(f => f.id === feed.farmer_id || f.id === feed.farmer_id);
                const cow = cows.find(c => c.id === feed.cow_id || c.id === feed.cow_id);

                // Create display names with better fallbacks
                const farmerName = farmer
                  ? `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim()
                  : `Farmer #${feed.farmer_id}`;
                
                const cowName = cow
                  ? (cow.name || `Cow #${feed.cow_id}`)
                  : `Cow #${feed.cow_id}`;

                return (
                  <tr key={feed.id || index}>
                    <td>{index + 1}</td>
                    <td>{farmerName}</td>
                    <td>{cowName}</td>
                    <td>{formatDate(feed.date)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(feed.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DailyFeedPage;