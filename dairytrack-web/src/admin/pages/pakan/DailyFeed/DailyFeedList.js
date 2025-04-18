import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { getAllDailyFeeds, deleteDailyFeed } from "../../../../api/pakan/dailyFeed";
import { getFarmers } from "../../../../api/peternakan/farmer";
import { getCows } from "../../../../api/peternakan/cow";
import CreateDailyFeedPage from "./CreateDailyFeed";
import DailyFeedDetailEdit from "./DetailDailyFeed";
import { useTranslation } from "react-i18next";


const DailyFeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [farmerNames, setFarmerNames] = useState({});
  const [cowNames, setCowNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedsResponse, farmersData, cowsData] = await Promise.all([
        getAllDailyFeeds(),
        getFarmers().catch(err => []),
        getCows().catch(err => [])
      ]);

      if (feedsResponse.success && feedsResponse.data) {
        setFeeds(feedsResponse.data);
        setFilteredFeeds(feedsResponse.data);
      }

      const farmerMap = Object.fromEntries(
        farmersData.map(farmer => [farmer.id, `${farmer.first_name} ${farmer.last_name}`])
      );
      setFarmerNames(farmerMap);

      const cowMap = Object.fromEntries(
        cowsData.map(cow => [cow.id, cow.name])
      );
      setCowNames(cowMap);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeeds([]);
      setFilteredFeeds([]);
      Swal.fire("Error!", "Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = feeds.filter(feed =>
      farmerNames[feed.farmer_id]?.toLowerCase().includes(term) ||
      cowNames[feed.cow_id]?.toLowerCase().includes(term) ||
      feed.date.toLowerCase().includes(term) ||
      feed.session.toLowerCase().includes(term) ||
      feed.weather?.toLowerCase().includes(term)
    );
    setFilteredFeeds(filtered);
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
        Swal.fire("Error!", "Terjadi kesalahan saat menghapus data.", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSession = (session) => {
    return session.charAt(0).toUpperCase() + session.slice(1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Uniform column width
  const columnWidth = "14%"; // Equal width for all 7 columns (100% / 7 ≈ 14%)

  // DataTable columns with uniform width
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: columnWidth,
      center: true,
    },
    {
      name: "Nama Petani",
      selector: row => farmerNames[row.farmer_id] || `Petani #${row.farmer_id}`,
      wrap: true,
      width: columnWidth,
      center: true,
    },
    {
      name: "Nama Sapi",
      selector: row => cowNames[row.cow_id] || `Sapi #${row.cow_id}`,
      wrap: true,
      width: columnWidth,
      center: true,
    },
    {
      name: "Tanggal",
      selector: row => formatDate(row.date),
      width: columnWidth,
      center: true,
    },
    {
      name: "Sesi",
      selector: row => formatSession(row.session),
      width: columnWidth,
      center: true,
    },
    {
      name: "Cuaca",
      selector: row => row.weather ? formatSession(row.weather) : "Tidak ada",
      width: columnWidth,
      center: true,
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-warning btn-sm waves-effect waves-light me-2"
            onClick={() => { setSelectedFeedId(row.id); setShowDetailModal(true); }}
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="ri-delete-bin-6-line"></i>
          </button>
        </div>
      ),
      width: columnWidth,
      center: true,
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        padding: '12px',
        justifyContent: 'center', // Center header text
      },
    },
    cells: {
      style: {
        padding: '12px',
        justifyContent: 'center', // Center cell content
      },
    },
    rows: {
      style: {
        minHeight: '50px',
      },
    },
  };

  return (
    <div className="p-4">
      {showCreateModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, zIndex: 1050, width: "100%", height: "100%" }}>
          <CreateDailyFeedPage 
            onDailyFeedAdded={fetchData} 
            onClose={() => setShowCreateModal(false)} 
          />
        </div>
      )}
      
      {showDetailModal && selectedFeedId && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, zIndex: 1050, width: "100%", height: "100%" }}>
          <DailyFeedDetailEdit 
            feedId={selectedFeedId}
            onDailyFeedUpdated={fetchData}
            onClose={() => { setShowDetailModal(false); setSelectedFeedId(null); }}
          />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{t('dailyfeed.daily_feed_data')}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info waves-effect waves-light text-uppercase"
          style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
        >
          {t('dailyfeed.add_feed')}

        </button>
      </div>

      <div className="mb-4" style={{ maxWidth: "250px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Cari..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">{t('dailyfeed.loading_data')}
          ...</p>
        </div>
      ) : filteredFeeds.length === 0 ? (
        <div className="alert alert-info text-center">
          {searchTerm ? "Tidak ada hasil pencarian." : "Belum ada data pakan tersedia."}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredFeeds}
          pagination
          paginationPerPage={15} // Default to 15 rows per page
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]} // Options for rows per page
          customStyles={customStyles}
          noDataComponent={<div className="text-center p-4">{t('dailyfeed.no_data')}
</div>}
          progressPending={loading}
          progressComponent={<div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>}
        />
      )}
    </div>
  );
};

export default DailyFeedListPage;