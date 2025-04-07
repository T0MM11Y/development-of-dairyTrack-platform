// DailyFeedListPage.jsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAllDailyFeeds, deleteDailyFeed } from "../../../../api/pakan/dailyFeed";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { getCows } from "../../../../api/peternakan/cow";
import CreateDailyFeedPage from "./CreateDailyFeed";
import DailyFeedDetailEdit from "./DetailDailyFeed";

const DailyFeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [farmerNames, setFarmerNames] = useState({});
  const [cowNames, setCowNames] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch feeds, farmers, and cows data in parallel
      const [feedsResponse, farmersData, cowsData] = await Promise.all([
        getAllDailyFeeds(),
        getFarmers().catch(err => {
          console.error("Failed to fetch farmers:", err);
          return [];
        }),
        getCows().catch(err => {
          console.error("Failed to fetch cows:", err);
          return [];
        })
      ]);
      
      // Process feeds
      if (feedsResponse.success && feedsResponse.data) {
        setFeeds(feedsResponse.data);
      } else {
        console.error("Unexpected response format", feedsResponse);
        setFeeds([]);
      }
      
      // Create lookup maps for farmer and cow names
      const farmerMap = {};
      farmersData.forEach(farmer => {
        farmerMap[farmer.id] = `${farmer.first_name} ${farmer.last_name}`;
      });
      setFarmerNames(farmerMap);
      
      const cowMap = {};
      cowsData.forEach(cow => {
        cowMap[cow.id] = cow.name;
      });
      setCowNames(cowMap);
      
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeeds([]);
      
      Swal.fire({
        title: "Error!",
        text: "Failed to load data.",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pakan akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteDailyFeed(id);
        Swal.fire({
          title: "Berhasil!",
          text: "Data pakan berhasil dihapus.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true
        });
        fetchData();
      } catch (error) {
        console.error("Failed to delete feed:", error.message);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus data.",
          icon: "error"
        });
      }
    }
  };

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleViewDetails = (id) => {
    setSelectedFeedId(id);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFeedId(null);
  };
  
  const handleDailyFeedAdded = () => {
    fetchData();
  };
  
  const handleDailyFeedUpdated = () => {
    fetchData();
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Capitalize first letter of session
  const formatSession = (session) => {
    return session.charAt(0).toUpperCase() + session.slice(1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      {showCreateModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, zIndex: 1050, width: "100%", height: "100%", overflow: "auto" }}>
          <CreateDailyFeedPage 
            onDailyFeedAdded={handleDailyFeedAdded} 
            onClose={handleCloseCreateModal} 
          />
        </div>
      )}
      
      {showDetailModal && selectedFeedId && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, zIndex: 1050, width: "100%", height: "100%", overflow: "auto" }}>
          <DailyFeedDetailEdit 
            feedId={selectedFeedId}
            onDailyFeedUpdated={handleDailyFeedUpdated}
            onClose={handleCloseDetailModal} 
          />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Data Pakan Harian</h2>
        <button
          onClick={handleAddClick}
          className="btn btn-info waves-effect waves-light"
        >
          + Tambah Pakan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : feeds.length === 0 ? (
        <div className="alert alert-info text-center">
          Belum ada data pakan tersedia.
        </div>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Daftar Pakan Harian</h4>
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center" style={{width: "50px"}}>#</th>
                      <th>Nama Petani</th>
                      <th>Nama Sapi</th>
                      <th style={{width: "120px"}}>Tanggal</th>
                      <th style={{width: "100px"}}>Sesi</th>
                      <th style={{width: "120px"}}>Cuaca</th>
                      <th className="text-center" style={{width: "130px"}}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeds.map((feed, index) => (
                      <tr key={feed.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>{farmerNames[feed.farmer_id] || `Petani #${feed.farmer_id}`}</td>
                        <td>{cowNames[feed.cow_id] || `Sapi #${feed.cow_id}`}</td>
                        <td>{formatDate(feed.date)}</td>
                        <td>{formatSession(feed.session)}</td>
                        <td>{feed.weather ? formatSession(feed.weather) : "Tidak ada data"}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewDetails(feed.id)}
                              title="Detail/Edit"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(feed.id)}
                              className="btn btn-sm btn-danger"
                              title="Hapus"
                            >
                              <i className="ri-delete-bin-6-line"></i>
                            </button>
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
    </div>
  );
};

export default DailyFeedListPage;