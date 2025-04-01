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

      setDailyFeeds(feedResponse?.success ? feedResponse.feeds : []);
      setCows(cowResponse?.success ? cowResponse.cows : []);
      setFarmers(farmerResponse?.success ? farmerResponse.farmers : []);
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
        <p className="text-center text-gray-500">Loading...</p>
      ) : dailyFeeds.length === 0 ? (
        <p className="text-gray-500">No daily feed data available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
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
              const farmer = farmers.find((f) => f.id === feed.farmer_id);
              const cow = cows.find((c) => c.id === feed.cow_id);

              const farmerName = farmer
                ? `${farmer.first_name} ${farmer.last_name}`
                : "Unknown";
              const cowName = cow ? cow.name : "Unknown";

              return (
                <tr key={feed.id}>
                  <td>{index + 1}</td>
                  <td>{farmerName}</td>
                  <td>{cowName}</td>
                  <td>{feed.date}</td>
                  <td>
                    <button
                      className="btn btn-danger"
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
      )}
    </div>
  );
};

export default DailyFeedPage;
