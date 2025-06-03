import React, { useEffect, useState } from "react";
import {
  getAllFeedItems,
  deleteFeedItem,
} from "../../../../controllers/feedItemController";
import { getAllDailyFeeds } from "../../../../controllers/feedScheduleController";
import { listCows } from "../../../../controllers/cowsController";
import { listCowsByUser } from "../../../../controllers/cattleDistributionController";
import CreateDailyFeedItem from "./CreateDailyFeedItem";
import EditDailyFeedItem from "./EditDailyFeedItem";
import Swal from "sweetalert2";
import { Button, Card, Table, Spinner, Form } from "react-bootstrap";

const DailyFeedItemsListPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [cowNames, setCowNames] = useState({});
  const [cowBirthDates, setCowBirthDates] = useState({});
  const [cowWeights, setCowWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role?.toLowerCase() === "supervisor";
  const isFarmer = user?.role?.toLowerCase() === "farmer";

  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor tidak dapat mengedit data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsData] =
        await Promise.all([
          getAllFeedItems().catch((err) => {
            console.error("Error fetching feed items:", err);
            return [];
          }),
          getAllDailyFeeds({ date: selectedDate }).catch((err) => {
            console.error("Error fetching daily feeds:", err);
            return { success: false, data: [] };
          }),
          (isFarmer ? listCowsByUser(user.user_id) : listCows()).catch(
            (err) => {
              console.error("Error fetching cows:", err);
              return { success: false, cows: [] };
            }
          ),
        ]);

      // Log responses for debugging
      console.log("User role:", user?.role);
      console.log("Feed Items Response:", feedItemsResponse);
      console.log("Daily Feeds Response:", dailyFeedsResponse);
      console.log("Cows Data Response:", cowsData);

      // Handle cowsData, ensuring it's an array
      const cowsArray = cowsData.success ? (cowsData.cows || []) : [];
      setCows(cowsArray);
      const allowedCowIds = new Set(cowsArray.map((cow) => cow.id));

      // Filter dailyFeeds to only include those for allowed cows (for farmers)
      const dailyFeedsData = dailyFeedsResponse.success
        ? (dailyFeedsResponse.data || []).filter(
            (feed) => !isFarmer || allowedCowIds.has(feed.cow_id)
          )
        : [];
      setDailyFeeds(dailyFeedsData);

      // Filter feedItems to only include those for allowed daily_feed_ids
      const allowedDailyFeedIds = new Set(dailyFeedsData.map((feed) => feed.id));
      const feedItemsArray = Array.isArray(feedItemsResponse)
        ? feedItemsResponse.filter(
            (item) => !isFarmer || allowedDailyFeedIds.has(item.daily_feed_id)
          )
        : (feedItemsResponse.data || []).filter(
            (item) => !isFarmer || allowedDailyFeedIds.has(item.daily_feed_id)
          );
      setFeedItems(feedItemsArray);

      // Set cow names, birth dates, and weights
      const cowMap = dailyFeedsData.length
        ? Object.fromEntries(
            dailyFeedsData.map((feed) => [
              feed.cow_id,
              feed.cow_name || `Sapi #${feed.cow_id}`,
            ])
          )
        : Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.name || `Sapi #${cow.id}`])
          );
      const birthDateMap = cowsArray.length
        ? Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.birth_date || null])
          )
        : {};
      const weightMap = cowsArray.length
        ? Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.weight_kg || "Tidak Diketahui"])
          )
        : {};

      setCowNames(cowMap);
      setCowBirthDates(birthDateMap);
      setCowWeights(weightMap);

      console.log("Number of feed items:", feedItemsArray.length);
      console.log("Number of daily feeds:", dailyFeedsData.length);
      console.log("Number of cows:", cowsArray.length);
      console.log("Allowed cow IDs:", Array.from(allowedCowIds));
      console.log(
        "Allowed daily feed IDs:",
        Array.from(allowedDailyFeedIds)
      );
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeedItems([]);
      setDailyFeeds([]);
      setCows([]);
      setCowNames({});
      setCowBirthDates({});
      setCowWeights({});
      Swal.fire("Error!", "Gagal memuat data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!user.token || !user.user_id || !user.role) {
    localStorage.removeItem("user");
    window.location.href = "/";
  } else {
    fetchData();
  }
}, [selectedDate]);

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

  const groupedFeedItems = dailyFeeds.reduce((acc, dailyFeed) => {
    const cowName = cowNames[dailyFeed.cow_id] || `Sapi #${dailyFeed.cow_id}`;
    const cowAge = calculateAge(cowBirthDates[dailyFeed.cow_id]);
    const cowWeight = cowWeights[dailyFeed.cow_id] || "Tidak Diketahui";
    const key = `${dailyFeed.cow_id}-${dailyFeed.date}`;
    const items = feedItems.filter(
      (item) => item.daily_feed_id === dailyFeed.id
    );

    if (!acc[key]) {
      acc[key] = {
        cow_id: dailyFeed.cow_id,
        date: dailyFeed.date,
        cow: cowName,
        age: cowAge,
        weight: cowWeight,
        sessions: {
          Pagi: { items: [], daily_feed_id: null, weather: "Tidak Ada" },
          Siang: { items: [], daily_feed_id: null, weather: "Tidak Ada" },
          Sore: { items: [], daily_feed_id: null, weather: "Tidak Ada" },
        },
      };
    }

    acc[key].sessions[dailyFeed.session] = {
      items,
      daily_feed_id: dailyFeed.id,
      weather: dailyFeed.weather || "Tidak Ada",
    };

    return acc;
  }, {});

  const filteredFeedItems = Object.values(groupedFeedItems).filter((group) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      group.date.toLowerCase().includes(searchLower) ||
      group.cow.toLowerCase().includes(searchLower) ||
      group.age.toLowerCase().includes(searchLower) ||
      group.weight.toString().toLowerCase().includes(searchLower) ||
      Object.values(group.sessions).some(
        (session) =>
          session.items.some(
            (item) =>
              (item.Feed?.name || item.feed_name || "").toLowerCase().includes(searchLower) ||
              (item.quantity?.toString() || "").includes(searchLower)
          ) || session.weather.toLowerCase().includes(searchLower)
      )
    );
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch (error) {
      return dateString;
    }
  };

  const handleDeleteClick = async (group, session) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menghapus data pakan untuk sapi ${group.cow} pada tanggal ${group.date} sesi ${session}?`,
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
        const items = group.sessions[session].items;
        if (items && items.length > 0) {
          await Promise.all(items.map((item) => deleteFeedItem(item.id)));
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

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold">
            <i className="fas fa-utensils me-2" /> Data Item Pakan Harian
          </h4>
        </Card.Header>

        <Card.Body>
          <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap">
            <Form.Group className="me-3 mb-2">
              <Form.Label>Pilih Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
            <Form.Group className="me-3 mb-2">
              <Form.Label>Cari</Form.Label>
              <Form.Control
                type="text"
                placeholder="Cari nama sapi, cuaca, dll."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
            <div className="mb-2">
              <Button
                variant="primary"
                onClick={() => !isSupervisor && setModalType("create")}
                {...disableIfSupervisor}
              >
                <i className="fas fa-plus me-2" /> Tambah Item Pakan
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat data pakan harian...</p>
            </div>
          ) : filteredFeedItems.length === 0 ? (
            <p className="text-center text-muted py-4">
              {searchQuery
                ? "Tidak ada data yang sesuai dengan pencarian Anda."
                : "Tidak ada data pakan harian untuk tanggal ini."}
            </p>
          ) : (
            <div className="table-responsive">
              {Object.keys(cowNames).length === 0 && (
                <div className="alert alert-warning mb-3">
                  <i className="fas fa-exclamation-triangle me-2" /> Data nama
                  sapi tidak tersedia. Nama sapi ditampilkan sebagai ID.
                </div>
              )}
              <Table bordered hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nama Sapi</th>
                    <th>Tanggal</th>
                    <th>Sesi</th>
                    <th>Pakan</th>
                    <th>Cuaca</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedItems.map((group) => {
                    const sessions = ["Pagi", "Siang", "Sore"];
                    const sessionCount = sessions.length;
                    return sessions.map((session, idx) => (
                      <tr key={`${group.cow_id}-${group.date}-${session}`}>
                        {idx === 0 && (
                          <>
                            <td rowSpan={sessionCount}>{group.cow}</td>
                            <td rowSpan={sessionCount}>
                              {formatDate(group.date)}
                            </td>
                          </>
                        )}
                        <td>{session}</td>
                        <td>
                          {group.sessions[session].items.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                              {group.sessions[session].items.map(
                                (feedItem, itemIdx) => (
                                  <div
                                    key={itemIdx}
                                    className="border rounded p-2 bg-light"
                                    style={{ minWidth: "100px" }}
                                  >
                                    <div className="fw-medium">
                                      {feedItem.Feed?.name || feedItem.feed_name || "-"}
                                    </div>
                                    <small className="text-muted">
                                      {feedItem.quantity} kg
                                    </small>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{group.sessions[session].weather}</td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => {
                              if (
                                !isSupervisor &&
                                group.sessions[session].daily_feed_id
                              ) {
                                setEditId(
                                  group.sessions[session].daily_feed_id
                                );
                                setModalType("edit");
                              }
                            }}
                            disabled={!group.sessions[session].daily_feed_id}
                            {...disableIfSupervisor}
                          >
                            <i className="fas fa-edit" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              !isSupervisor && handleDeleteClick(group, session)
                            }
                            disabled={
                              group.sessions[session].items.length === 0
                            }
                            {...disableIfSupervisor}
                          >
                            <i className="fas fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {modalType === "create" && (
        <CreateDailyFeedItem
          dailyFeeds={dailyFeeds}
          defaultDate={selectedDate}
          onFeedItemAdded={() => {
            fetchData();
            setModalType(null);
          }}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "edit" && editId && (
        <EditDailyFeedItem
          dailyFeedId={editId}
          onUpdateSuccess={() => {
            fetchData();
            setModalType(null);
            setEditId(null);
          }}
          onClose={() => {
            setModalType(null);
            setEditId(null);
          }}
        />
      )}
    </div>
  );
};

export default DailyFeedItemsListPage;