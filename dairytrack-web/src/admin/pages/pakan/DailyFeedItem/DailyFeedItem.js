import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { getAlldailyFeedItems, deletedailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import FeedItemDetailEditPage from "./FeedItemDetail";
import FeedItemFormPage from "./CreateDailyFeedItem";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";


const FeedItemListPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [cowNames, setCowNames] = useState({});
  const [cowBirthDates, setCowBirthDates] = useState({});
  const [cowWeights, setCowWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDailyFeedId, setSelectedDailyFeedId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsData] = await Promise.all([
        getAlldailyFeedItems(),
        getAllDailyFeeds(),
        getCows().catch((err) => {
          console.error("Error fetching cows:", err);
          return [];
        }),
      ]);

      const feedItemsData = feedItemsResponse.success && Array.isArray(feedItemsResponse.data)
        ? feedItemsResponse.data
        : [];
      const dailyFeedsData = dailyFeedsResponse.success && Array.isArray(dailyFeedsResponse.data)
        ? dailyFeedsResponse.data
        : [];

      setFeedItems(feedItemsData);
      setDailyFeeds(dailyFeedsData);

      const cowMap = Object.fromEntries(cowsData.map((cow) => [cow.id, cow.name]));
      const birthDateMap = Object.fromEntries(cowsData.map((cow) => [cow.id, cow.birth_date]));
      const weightMap = Object.fromEntries(cowsData.map((cow) => [cow.id, cow.weight_kg || "Tidak Diketahui"]));
      setCowNames(cowMap);
      setCowBirthDates(birthDateMap);
      setCowWeights(weightMap);

      if (Object.keys(cowMap).length === 0) {
        console.warn("No cow data available or invalid format");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeedItems([]);
      setDailyFeeds([]);
      setCowNames({});
      setCowBirthDates({});
      setCowWeights({});
      Swal.fire("Error!", "Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    const isAdd = params.get("add") === "true";

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

  const calculateAge = (birthDate) => {
    if (!birthDate) return "Tidak Diketahui";
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (now.getDate() < birth.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    return `${years} tahun ${months} bulan`;
  };

  // Process feed items with date filtering only (for exports)
  const getDateFilteredFeedItems = () => {
    return dailyFeeds
      .filter((dailyFeed) => {
        const feedDate = new Date(dailyFeed.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (
          (!start || feedDate >= start) &&
          (!end || feedDate <= end)
        );
      })
      .map((dailyFeed) => {
        const items = feedItems.filter((item) => item.daily_feed_id === dailyFeed.id);
        const cowName = cowNames[dailyFeed.cow_id] || `Sapi #${dailyFeed.cow_id}`;
        const cowAge = calculateAge(cowBirthDates[dailyFeed.cow_id]);
        const cowWeight = cowWeights[dailyFeed.cow_id] || "Tidak Diketahui";
        return {
          daily_feed_id: dailyFeed.id,
          date: dailyFeed.date,
          session: dailyFeed.session,
          cow_id: dailyFeed.cow_id,
          cow: cowName,
          age: cowAge,
          weight: cowWeight,
          weather: dailyFeed.weather || "Tidak Ada",
          items,
        };
      });
  };

  // Filtered items for display (includes search query)
  const filteredFeedItems = getDateFilteredFeedItems()
    .filter((group) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        group.date.toLowerCase().includes(searchLower) ||
        group.cow.toLowerCase().includes(searchLower) ||
        group.age.toLowerCase().includes(searchLower) ||
        group.weight.toString().toLowerCase().includes(searchLower) ||
        group.session.toString().toLowerCase().includes(searchLower) ||
        group.weather.toLowerCase().includes(searchLower) ||
        group.items.some(item => 
          (item.feed?.name || "").toLowerCase().includes(searchLower) ||
          (item.quantity?.toString() || "").includes(searchLower)
        )
      );
    });

  const exportToExcel = () => {
    // Use date filtered items only, ignore search query
    const dateFilteredItems = getDateFilteredFeedItems();
    
    const data = dateFilteredItems.map((group) => ({
      "Tanggal": group.date,
      "Sapi": group.cow,
      "Usia": group.age,
      "Berat (kg)": group.weight,
      "Sesi": group.session,
      "Cuaca": group.weather,
      "Pakan 1": group.items[0]?.feed?.name || "-",
      "Jumlah 1 (kg)": group.items[0]?.quantity || "-",
      "Pakan 2": group.items[1]?.feed?.name || "-",
      "Jumlah 2 (kg)": group.items[1]?.quantity || "-",
      "Pakan 3": group.items[2]?.feed?.name || "-",
      "Jumlah 3 (kg)": group.items[2]?.quantity || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FeedItems");
    XLSX.writeFile(wb, `FeedItems_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportToPDF = () => {
    // Use date filtered items only, ignore search query
    const dateFilteredItems = getDateFilteredFeedItems();
    
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Daftar Pakan Harian", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        ["Tanggal", "Sapi", "Usia", "Berat (kg)", "Sesi", "Cuaca", "Pakan 1", "Jumlah 1", "Pakan 2", "Jumlah 2", "Pakan 3", "Jumlah 3"],
      ],
      body: dateFilteredItems.map((group) => [
        group.date,
        group.cow,
        group.age,
        group.weight,
        group.session,
        group.weather,
        group.items[0]?.feed?.name || "-",
        group.items[0]?.quantity || "-",
        group.items[1]?.feed?.name || "-",
        group.items[1]?.quantity || "-",
        group.items[2]?.feed?.name || "-",
        group.items[2]?.quantity || "-",
      ]),
    });
    doc.save(`FeedItems_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", { startDate, endDate });
  };

  const handleEditClick = (dailyFeedId) => {
    setSelectedDailyFeedId(dailyFeedId);
    setShowEditModal(true);
    setShowAddModal(false);
    navigate(`${location.pathname}?edit=${dailyFeedId}`, { replace: true });
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
        if (group.items && group.items.length > 0) {
          await Promise.all(group.items.map((item) => deletedailyFeedItem(item.id)));
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
        Swal.fire("Error!", "Terjadi kesalahan saat menghapus: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{t('dailyfeed.daily_feed')}
        </h2>
        <div>
          <button
            onClick={handleAddClick}
            className="btn btn-info waves-effect waves-light text-white"
          >
            <i className="ri-add-line me-1"></i> {t('dailyfeed.add_daily_feed_button')}

          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">{t('dailyfeed.search')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari berdasarkan nama sapi, cuaca, dll."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <small className="text-muted">
                {t('dailyfeed.search_info')}

                </small>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-5">
                  <div className="mb-3">
                    <label className="form-label">{t('dailyfeed.start_date')}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="mb-3">
                    <label className="form-label">{t('dailyfeed.end_date')}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <label className="form-label d-none d-md-block"> </label>
                    <button 
                      className="btn btn-primary w-100" 
                      onClick={handleApplyFilters}
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-success" onClick={exportToExcel}>
              <i className="ri-file-excel-line me-1"></i> Ekspor ke Excel
            </button>
            <button className="btn btn-primary" onClick={exportToPDF}>
              <i className="ri-file-pdf-line me-1"></i> Ekspor ke PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data pakan harian...</p>
        </div>
      ) : filteredFeedItems.length === 0 ? (
        <div className="alert alert-info">
          <i className="ri-information-line me-2"></i> 
          {searchQuery 
            ? "Tidak ada data yang sesuai dengan pencarian Anda."
            : "Tidak ada data pakan harian tersedia untuk rentang tanggal ini."}
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-light">
            <h4 className="card-title mb-0">Data Pakan Harian</h4>
            {searchQuery && (
              <div className="mt-2 text-muted">
                <small>Menampilkan hasil pencarian untuk: <strong>{searchQuery}</strong></small>
              </div>
            )}
          </div>
          <div className="card-body">
            {Object.keys(cowNames).length === 0 && (
              <div className="alert alert-warning mb-3">
                <i className="ri-alert-line me-2"></i> Data sapi tidak tersedia. Nama sapi akan ditampilkan sebagai ID.
              </div>
            )}
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
                </thead>
                <tbody>
                  {filteredFeedItems.map((group) => (
                    <tr key={group.daily_feed_id}>
                      <td className="text-center">{group.date}</td>
                      <td>{group.cow}</td>
                      <td className="text-center">
                        <span className="badge bg-info">{group.session}</span>
                      </td>
                      {[0, 1, 2].map((idx) => {
                        const feedItem = group.items[idx];
                        return (
                          <td key={idx} className="text-center">
                            {feedItem ? (
                              <div>
                                <div className="fw-medium">{feedItem.feed?.name || "-"}</div>
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
                            className="btn btn-warning btn-sm waves-effect waves-light me-2"
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

      {showAddModal && (
        <FeedItemFormPage onFeedItemAdded={fetchData} onClose={handleCloseModal} />
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