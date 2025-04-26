import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAllDailyFeeds,
  deleteDailyFeed,
} from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import CreateDailyFeedPage from "./CreateDailyFeed";
import DailyFeedDetailEdit from "./DetailDailyFeed";
import { useTranslation } from "react-i18next";

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Helper function to capitalize session and weather
const formatText = (text) => {
  if (!text) return "Tidak ada";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const DailyFeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [cowNames, setCowNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedsResponse, cowsData] = await Promise.all([
        getAllDailyFeeds().catch((err) => {
          console.error("getAllDailyFeeds error:", err);
          return { success: false, data: [] };
        }),
        getCows().catch((err) => {
          console.error("getCows error:", err);
          return [];
        }),
      ]);

      console.log("feedsResponse:", feedsResponse);

      if (feedsResponse.success && Array.isArray(feedsResponse.data)) {
        const groupedFeeds = groupFeedsByDateAndCow(feedsResponse.data);
        setFeeds(groupedFeeds);
        setFilteredFeeds(groupedFeeds);
      } else {
        console.warn("Invalid feeds response:", feedsResponse);
        setFeeds([]);
        setFilteredFeeds([]);
        Swal.fire({
          title: t("dailyfeed.error_title"),
          text: feedsResponse.message || t("dailyfeed.error_loading_feeds"),
          icon: "error",
          confirmButtonText: t("dailyfeed.ok"),
        });
      }

      const cowMap = Object.fromEntries(
        cowsData.map((cow) => [cow.id, cow.name])
      );
      setCowNames(cowMap);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeeds([]);
      setFilteredFeeds([]);
      Swal.fire({
        title: t("dailyfeed.error_title"),
        text: error.message || t("dailyfeed.error_loading_data"),
        icon: "error",
        confirmButtonText: t("dailyfeed.ok"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Group feeds by date and cow_id, but prepare for row-per-session rendering
  const groupFeedsByDateAndCow = (data) => {
    const grouped = {};

    data.forEach((feed) => {
      if (!feed.id) {
        console.warn("Feed missing id:", feed);
        return;
      }
      const key = `${feed.date}_${feed.cow_id}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: feed.date,
          cow_id: feed.cow_id,
          sessions: [],
        };
      }
      grouped[key].sessions.push({
        id: feed.id,
        session: feed.session,
        weather: feed.weather || "Tidak ada",
      });
    });

    // Sort sessions within each group
    return Object.values(grouped).map((group) => ({
      ...group,
      sessions: group.sessions.sort((a, b) =>
        a.session.localeCompare(b.session)
      ),
    }));
  };

  // Flatten grouped feeds into rows for rendering
  const flattenFeedsForTable = (feeds) => {
    const flatRows = [];
    let rowIndex = 1;

    feeds.forEach((group) => {
      group.sessions.forEach((session, sessionIndex) => {
        if (!session.id) {
          console.warn("Session missing id:", session);
          return;
        }
        flatRows.push({
          rowIndex: sessionIndex === 0 ? rowIndex : null,
          cow_id: group.cow_id,
          date: group.date,
          session: session.session,
          weather: session.weather,
          id: session.id,
          rowSpan: group.sessions.length,
          isFirstSession: sessionIndex === 0,
        });
      });
      rowIndex++;
    });

    console.log("flatRows:", flatRows);
    return flatRows;
  };

  // Search handler
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = feeds.filter(
      (feed) =>
        cowNames[feed.cow_id]?.toLowerCase().includes(term) ||
        feed.date.toLowerCase().includes(term) ||
        feed.sessions.some(
          (s) =>
            s.session.toLowerCase().includes(term) ||
            s.weather.toLowerCase().includes(term)
        )
    );
    setFilteredFeeds(filtered);
  };

  // Delete handler (delete a single feed)
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Invalid feed id for deletion:", id);
      return;
    }
    const result = await Swal.fire({
      title: t("dailyfeed.confirm_delete_title"),
      text: t("dailyfeed.confirm_delete_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("dailyfeed.confirm_delete_yes"),
      cancelButtonText: t("dailyfeed.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteDailyFeed(id);
        Swal.fire({
          title: t("dailyfeed.success_title"),
          text: t("dailyfeed.success_delete"),
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting feed:", error);
        Swal.fire({
          title: t("dailyfeed.error_title"),
          text: error.message || t("dailyfeed.error_deleting"),
          icon: "error",
          confirmButtonText: t("dailyfeed.ok"),
        });
      }
    }
  };

  // Handle edit
  const handleEdit = (id) => {
    if (!id) {
      console.error("Invalid feed id for edit:", id);
      Swal.fire({
        title: t("dailyfeed.error_title"),
        text: t("dailyfeed.error_invalid_feed"),
        icon: "error",
        confirmButtonText: t("dailyfeed.ok"),
      });
      return;
    }
    console.log("handleEdit called with id:", id);
    setSelectedFeedId(id);
    setShowDetailModal(true);
    console.log("State updated: selectedFeedId =", id, "showDetailModal =", true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log("Render: showDetailModal =", showDetailModal, "selectedFeedId =", selectedFeedId);
  const flatRows = flattenFeedsForTable(filteredFeeds);

  return (
    <div className="p-4">
      {showCreateModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1055,
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <CreateDailyFeedPage
            onDailyFeedAdded={fetchData}
            onClose={() => setShowCreateModal(false)}
          />
        </div>
      )}

      {showDetailModal && selectedFeedId && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1055,
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <DailyFeedDetailEdit
            feedId={selectedFeedId}
            onDailyFeedUpdated={fetchData}
            onClose={() => {
              console.log("Closing detail modal");
              setShowDetailModal(false);
              setSelectedFeedId(null);
            }}
          />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {t("dailyfeed.daily_feed_data")}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info waves-effect waves-light text-uppercase"
          style={{ backgroundColor: "#17a2b8", borderColor: "#17a2b8" }}
        >
          {t("dailyfeed.add_feed")}
        </button>
      </div>

      <div className="mb-4" style={{ maxWidth: "250px" }}>
        <input
          type="text"
          className="form-control"
          placeholder={t("dailyfeed.search_placeholder")}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("dailyfeed.loading")}</span>
          </div>
          <p className="mt-2">{t("dailyfeed.loading_data")}...</p>
        </div>
      ) : flatRows.length === 0 ? (
        <div className="alert alert-info text-center">
          {searchTerm ? t("dailyfeed.no_search_results") : t("dailyfeed.no_feeds")}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th style={{ width: "5%", textAlign: "center" }}>{t("dailyfeed.table.no")}</th>
                <th style={{ width: "15%", textAlign: "center" }}>{t("dailyfeed.table.cow_name")}</th>
                <th style={{ width: "15%", textAlign: "center" }}>{t("dailyfeed.table.date")}</th>
                <th style={{ width: "15%", textAlign: "center" }}>{t("dailyfeed.table.session")}</th>
                <th style={{ width: "15%", textAlign: "center" }}>{t("dailyfeed.table.weather")}</th>
                <th style={{ width: "15%", textAlign: "center" }}>{t("dailyfeed.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {flatRows.map((row, index) => (
                <tr key={`${row.id}_${index}`}>
                  {row.isFirstSession && (
                    <>
                      <td
                        rowSpan={row.rowSpan}
                        style={{ textAlign: "center", verticalAlign: "middle" }}
                      >
                        {row.rowIndex}
                      </td>
                      <td
                        rowSpan={row.rowSpan}
                        style={{ textAlign: "center", verticalAlign: "middle" }}
                      >
                        {cowNames[row.cow_id] || `Sapi #${row.cow_id}`}
                      </td>
                      <td
                        rowSpan={row.rowSpan}
                        style={{ textAlign: "center", verticalAlign: "middle" }}
                      >
                        {formatDate(row.date)}
                      </td>
                    </>
                  )}
                  <td style={{ textAlign: "center" }}>
                    {formatText(row.session)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {formatText(row.weather)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="btn btn-warning btn-sm waves-effect waves-light"
                        onClick={() => {
                          console.log("Edit button clicked for id:", row.id);
                          handleEdit(row.id);
                        }}
                        title={t("dailyfeed.edit")}
                        disabled={!row.id}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row.id)}
                        title={t("dailyfeed.delete")}
                        disabled={!row.id}
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
      )}
    </div>
  );
};

export default DailyFeedListPage;