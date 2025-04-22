import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { getAlldailyFeedItems, deletedailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import FeedItemDetailEditPage from "./FeedItemDetail";
import FeedItemFormPage from "./CreateDailyFeedItem";

const FeedItemListPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDailyFeedId, setSelectedDailyFeedId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsResponse] = await Promise.all([
        getAlldailyFeedItems(),
        getAllDailyFeeds(),
        getCows(),
      ]);

      setFeedItems(feedItemsResponse.success ? feedItemsResponse.data : []);
      setDailyFeeds(dailyFeedsResponse.success ? dailyFeedsResponse.data : []);
      setCows(cowsResponse.success ? cowsResponse.data : []);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeedItems([]);
      setDailyFeeds([]);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Handle URL parameters for edit/add modes
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const isAdd = params.get('add') === 'true';
    
    if (editId) {
      setSelectedDailyFeedId(editId);
      setShowEditModal(true);
      setShowAddModal(false);
    } else if (isAdd) {
      setShowAddModal(true);
      setShowEditModal(false);
      setSelectedDailyFeedId(null);
    }
  }, [location]);

  const groupedFeedItems = dailyFeeds.map((dailyFeed) => {
    const items = feedItems.filter(item => item.daily_feed_id === dailyFeed.id);
    
    // Improved cow name lookup
    let cowName = "Tidak Ditemukan";
    if (dailyFeed.cow && dailyFeed.cow.name) {
      // If cow data is already embedded in dailyFeed
      cowName = dailyFeed.cow.name;
    } else if (dailyFeed.cow_id) {
      // Otherwise look it up from cows array
      const cow = cows.find(c => c.id === dailyFeed.cow_id);
      if (cow) {
        cowName = cow.name;
      }
    }

    return {
      daily_feed_id: dailyFeed.id,
      date: dailyFeed.date,
      session: dailyFeed.session,
      cow_id: dailyFeed.cow_id,
      cow: cowName,
      items,
    };
  });

  const handleEditClick = (dailyFeedId) => {
    setSelectedDailyFeedId(dailyFeedId);
    setShowEditModal(true);
    setShowAddModal(false);
    // Use query parameter to track edit mode
    navigate(`${location.pathname}?edit=${dailyFeedId}`, { replace: true });
  };

  const handleAddClick = () => {
    setShowAddModal(true);
    setShowEditModal(false);
    setSelectedDailyFeedId(null);
    // Use query parameter to track add mode
    navigate(`${location.pathname}?add=true`, { replace: true });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDailyFeedId(null);
    navigate(location.pathname, { replace: true });
  };

  const handleDeleteClick = async (group) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menghapus semua data pakan untuk sapi ${group.cow} pada tanggal ${group.date} sesi ${group.session}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        // Check if there are items to delete
        if (group.items && group.items.length > 0) {
          // Delete all feed items for this daily feed
          await Promise.all(group.items.map(item => deletedailyFeedItem(item.id)));
          Swal.fire({
            title: "Berhasil!",
            text: "Data pakan harian telah dihapus.",
            icon: "success",
            timer: 1500
          });
        } else {
          Swal.fire({
            title: "Perhatian",
            text: "Tidak ada item pakan untuk dihapus.",
            icon: "info",
            timer: 1500
          });
        }
        
        // Refresh data after deletion
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus data pakan:", error.message);
        Swal.fire("Error!", "Terjadi kesalahan saat menghapus: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Pakan Harian</h2>
        <button
          onClick={handleAddClick}
          className="btn btn-info waves-effect waves-light text-white"
        >
          <i className="ri-add-line me-1"></i> Tambah Pakan Harian
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data pakan harian...</p>
        </div>
      ) : groupedFeedItems.length === 0 ? (
        <div className="alert alert-info">
          <i className="ri-information-line me-2"></i> Tidak ada data pakan harian tersedia.
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-light">
            <h4 className="card-title mb-0">Data Pakan Harian</h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "12%" }}>Tanggal</th>
                    <th style={{ width: "15%" }}>Sapi</th>
                    <th className="text-center" style={{ width: "8%" }}>Sesi</th>
                    <th className="text-center" colSpan="3">Pakan</th>
                    <th className="text-center" style={{ width: "12%" }}>Aksi</th>
                  </tr>
                  <tr>
                    <th className="text-center">Tanggal</th>
                    <th>Sapi</th>
                    <th className="text-center">Sesi</th>
                    <th className="text-center">Pakan 1</th>
                    <th className="text-center">Pakan 2</th>
                    <th className="text-center">Pakan 3</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedFeedItems.map((group) => (
                    <tr key={group.daily_feed_id}>
                      <td className="text-center">{group.date}</td>
                      <td>{group.cow}</td>
                      <td className="text-center">
                        <span className="badge bg-info">{group.session}</span>
                      </td>
                      {[0, 1, 2].map(idx => {
                        const feedItem = group.items[idx];
                        return (
                          <td key={idx} className="text-center">
                            {feedItem ? (
                              <div>
                                <div className="fw-medium">{feedItem.feed?.name || '-'}</div>
                                <small className="text-muted">{feedItem.quantity} kg</small>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-info text-white"
                            onClick={() => handleEditClick(group.daily_feed_id)}
                            title="Detail / Edit"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(group)}
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
      )}

      {/* Add Modal */}
      {showAddModal && (
        <FeedItemFormPage
          onFeedItemAdded={fetchData}
          onClose={handleCloseModal}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDailyFeedId && (
        <FeedItemDetailEditPage
          dailyFeedId={selectedDailyFeedId}
          onUpdateSuccess={fetchData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default FeedItemListPage;