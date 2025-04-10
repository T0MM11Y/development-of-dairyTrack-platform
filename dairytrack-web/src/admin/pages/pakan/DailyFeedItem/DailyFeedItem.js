import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import {
  getAlldailyFeedItems,
  deletedailyFeedItem,
} from "../../../../api/pakan/dailyFeedItem";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import FeedItemFormPage from "./CreateDailyFeedItem";
import FeedItemDetailEditPage from "./FeedItemDetail";

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#f8f9fa",
      color: "#333",
      fontWeight: "bold",
      fontSize: "14px",
      borderBottom: "2px solid #17a2b8",
      padding: "12px",
    },
  },
  cells: {
    style: {
      padding: "12px",
      fontSize: "14px",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
      "&:hover": {
        backgroundColor: "#f1f3f5",
      },
    },
  },
};

const FeedItemListPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDailyFeedId, setSelectedDailyFeedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsResponse] =
        await Promise.all([
          getAlldailyFeedItems(),
          getAllDailyFeeds(),
          getCows(),
        ]);

      const feedItemsData = feedItemsResponse.success
        ? feedItemsResponse.data
        : [];
      const dailyFeedsData = dailyFeedsResponse.success
        ? dailyFeedsResponse.data
        : [];
      const cowsData = Array.isArray(cowsResponse)
        ? cowsResponse
        : cowsResponse.success && cowsResponse.data
        ? cowsResponse.data
        : [];

      setFeedItems(feedItemsData);
      setDailyFeeds(dailyFeedsData);
      setCows(cowsData);
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

  // Pantau perubahan rute utama untuk memastikan halaman diperbarui
  useEffect(() => {
    if (location.pathname !== "/admin/item-pakan-harian") {
      // Jika rute berubah ke halaman lain, pastikan modal ditutup
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedDailyFeedId(null);
    } else {
      // Jika masih di halaman ini, periksa query string
      const params = new URLSearchParams(location.search);
      const detailId = params.get("detail");
      const isAdd = params.get("add") === "true";

      if (detailId) {
        setSelectedDailyFeedId(detailId);
        setShowEditModal(true);
        setShowAddModal(false);
      } else if (isAdd) {
        setShowAddModal(true);
        setShowEditModal(false);
        setSelectedDailyFeedId(null);
      } else {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedDailyFeedId(null);
      }
    }
  }, [location.pathname, location.search]);

  const groupedFeedItems = dailyFeeds
    .map((dailyFeed) => {
      const items = feedItems.filter(
        (item) => item.daily_feed_id === dailyFeed.id
      );

      let cowName = "Tidak Ditemukan";
      if (dailyFeed.cow && dailyFeed.cow.name) {
        cowName = dailyFeed.cow.name;
      } else if (dailyFeed.cow_id) {
        const cow = cows.find((c) => c.id === dailyFeed.cow_id);
        cowName = cow ? cow.name : `Sapi #${dailyFeed.cow_id}`;
      }

      return {
        daily_feed_id: dailyFeed.id,
        date: dailyFeed.date,
        session: dailyFeed.session,
        cow_id: dailyFeed.cow_id,
        cow_name: cowName,
        items,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;

      const sessionOrder = { pagi: 1, siang: 2, sore: 3 };
      return sessionOrder[a.session] - sessionOrder[b.session];
    });

  useEffect(() => {
    if (!searchText) {
      setFilteredData(groupedFeedItems);
      return;
    }

    const lowerSearchText = searchText.toLowerCase();
    const filtered = groupedFeedItems.filter((group) => {
      const dateMatch = formatDate(group.date)
        .toLowerCase()
        .includes(lowerSearchText);
      const cowMatch = group.cow_name.toLowerCase().includes(lowerSearchText);
      const sessionMatch = formatSession(group.session)
        .toLowerCase()
        .includes(lowerSearchText);
      const feedMatch = group.items.some(
        (item) =>
          item.feed?.name.toLowerCase().includes(lowerSearchText) ||
          item.quantity.toString().toLowerCase().includes(lowerSearchText)
      );

      return dateMatch || cowMatch || sessionMatch || feedMatch;
    });

    setFilteredData(filtered);
  }, [searchText, groupedFeedItems]);

  const handleDetailClick = (dailyFeedId) => {
    setSelectedDailyFeedId(dailyFeedId);
    setShowEditModal(true);
    setShowAddModal(false);
    navigate(`${location.pathname}?detail=${dailyFeedId}`, { replace: true });
  };

  const handleAddClick = () => {
    setShowAddModal(true);
    setShowEditModal(false);
    setSelectedDailyFeedId(null);
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
      text: `Apakah Anda yakin ingin menghapus semua data pakan untuk sapi ${
        group.cow_name
      } pada tanggal ${formatDate(group.date)} sesi ${formatSession(
        group.session
      )}?`,
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

        if (group.items && group.items.length > 0) {
          await Promise.all(
            group.items.map((item) => deletedailyFeedItem(item.id))
          );
          Swal.fire({
            title: "Berhasil!",
            text: "Data pakan harian telah dihapus.",
            icon: "success",
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: "Perhatian",
            text: "Tidak ada item pakan untuk dihapus.",
            icon: "info",
            timer: 1500,
          });
        }

        fetchData();
      } catch (error) {
        console.error("Gagal menghapus data pakan:", error.message);
        Swal.fire(
          "Error!",
          "Terjadi kesalahan saat menghapus: " + error.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatSession = (session) => {
    if (!session) return "-";
    return session.charAt(0).toUpperCase() + session.slice(1);
  };

  const columns = [
    {
      name: "Tanggal",
      selector: (row) => formatDate(row.date),
      sortable: true,
      center: true,
      width: "12%",
    },
    {
      name: "Sapi",
      selector: (row) => row.cow_name,
      sortable: true,
      width: "15%",
    },
    {
      name: "Sesi",
      selector: (row) => formatSession(row.session),
      sortable: true,
      center: true,
      width: "8%",
      cell: (row) => (
        <span className="badge bg-info">{formatSession(row.session)}</span>
      ),
    },
    {
      name: "Pakan 1",
      center: true,
      width: "15%",
      cell: (row) => {
        const feedItem = row.items[0];
        return feedItem ? (
          <div>
            <div className="fw-medium">{feedItem.feed?.name || "-"}</div>
            <small className="text-muted">{feedItem.quantity} kg</small>
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      name: "Pakan 2",
      center: true,
      width: "15%",
      cell: (row) => {
        const feedItem = row.items[1];
        return feedItem ? (
          <div>
            <div className="fw-medium">{feedItem.feed?.name || "-"}</div>
            <small className="text-muted">{feedItem.quantity} kg</small>
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      name: "Pakan 3",
      center: true,
      width: "15%",
      cell: (row) => {
        const feedItem = row.items[2];
        return feedItem ? (
          <div>
            <div className="fw-medium">{feedItem.feed?.name || "-"}</div>
            <small className="text-muted">{feedItem.quantity} kg</small>
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
    {
      name: "Aksi",
      center: true,
      width: "12%",
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-info text-white"
            onClick={() => handleDetailClick(row.daily_feed_id)}
            title="Detail / Edit"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="btn btn-sm btn-danger"
            title="Hapus"
          >
            <i className="ri-delete-bin-6-line"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Data Pakan Harian</h2>
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={handleAddClick}
            className="btn btn-info waves-effect waves-light text-white"
          >
            <i className="ri-add-line me-1"></i> Tambah Pakan Harian
          </button>
        </div>
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
        <div className="card shadow-sm border-0 rounded">
          <div className="card-header bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div className="input-group" style={{ maxWidth: "300px" }}>
                <span className="input-group-text bg-light border-end-0">
                  <i className="ri-search-line"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Cari data pakan..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredData}
              customStyles={customStyles}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 15, 20]}
              highlightOnHover
              striped
              responsive
              noDataComponent={
                <div className="text-center py-5">
                  <i className="ri-information-line me-2"></i> Tidak ada data pakan harian tersedia.
                </div>
              }
            />
          </div>
        </div>
      )}

      {showAddModal && (
        <FeedItemFormPage
          show={showAddModal}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchData();
          }}
          cows={cows}
          dailyFeeds={dailyFeeds}
          onFeedItemAdded={fetchData}
        />
      )}

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