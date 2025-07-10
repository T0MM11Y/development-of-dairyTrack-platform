import React, { useEffect, useState } from "react";
import { getAllDailyFeeds, deleteDailyFeed, createDailyFeed } from "../../../../controllers/feedScheduleController";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";
import { listCows } from "../../../../controllers/cowsController";
import CreateDailyFeed from "./CreateDailyFeedSchedule";
import EditDailyFeed from "./EditDailyFeedSchedule";
import Swal from "sweetalert2";
import { Button, Card, Table, Spinner, Modal, Form, ListGroup } from "react-bootstrap";

const DailyFeedListPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCowModal, setShowCowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isSupervisor = user?.role?.toLowerCase() === "supervisor";
  const isFarmer = user?.role?.toLowerCase() === "farmer";
  const isReadOnly = isAdmin || isSupervisor;

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for date:", selectedDate);

      // Fetch feed schedules
      const feedResponse = await getAllDailyFeeds({ date: selectedDate });
      console.log(
        "Feed response details:",
        JSON.stringify(
          feedResponse.data?.map((f) => ({
            id: f.id,
            cow_id: f.cow_id,
            cow_name: f.cow_name,
            is_active: f.is_active,
            date: f.date,
            session: f.session,
          })) || [],
          null,
          2
        )
      );

      // Fetch cows (for create/edit actions, filter to active cows)
      const cowResponse = isReadOnly
        ? await listCows()
        : await listCowsByUser(user.user_id);
      console.log("Cow response:", cowResponse);

      if (feedResponse.success && Array.isArray(feedResponse.data)) {
        setFeeds(feedResponse.data);
        console.log("Feeds set:", feedResponse.data.length, "records");
      } else {
        setFeeds([]);
        console.log("Feed fetch failed:", feedResponse.message || "No data");
      }

      if (cowResponse.success && Array.isArray(cowResponse.cows)) {
        // Filter to active cows only
        const activeCows = cowResponse.cows.filter((cow) => cow.is_active === true);
        setCows(activeCows);
        console.log("Active cows set:", activeCows.length, "records");
      } else {
        setCows([]);
        console.log("Cow fetch failed:", cowResponse.message || "No cows");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.message.includes("Autentikasi gagal")) {
        Swal.fire({
          icon: "error",
          text: err.message,
        }).then(() => {
          localStorage.removeItem("user");
          window.location.href = "/";
        });
      } else {
        Swal.fire("Error", err.message || "Gagal memuat data jadwal pakan.", "error");
      }
      setFeeds([]);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, cowName, date, session) => {
    try {
      const feed = feeds.find((f) => f.id === id);
      if (!feed) {
        throw new Error("Jadwal pakan tidak ditemukan.");
      }
      if (feed.is_active === false) {
        Swal.fire(
          "Error",
          "Sapi ini tidak aktif. Tidak dapat menghapus jadwal pakan.",
          "error"
        );
        return;
      }

      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: `Apakah Anda yakin ingin menghapus jadwal pakan untuk sapi ${cowName} pada ${date} sesi ${session}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const response = await deleteDailyFeed(id);
        if (response.success) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: response.message,
            timer: 1500,
            showConfirmButton: false,
          });
          fetchData();
        } else {
          throw new Error(response.message || "Gagal menghapus jadwal pakan.");
        }
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal menghapus jadwal pakan.", "error");
    }
  };

  const handleAutoCreate = async (cowId, cowName, session) => {
    try {
      const selectedCow = cows.find((cow) => cow.id === parseInt(cowId));
      if (!selectedCow) {
        throw new Error("Sapi tidak ditemukan atau tidak aktif.");
      }

      const formattedDate = new Date(selectedDate).toLocaleDateString("id-ID");
      const result = await Swal.fire({
        title: "Konfirmasi Buat Jadwal",
        text: `Apakah Anda mau buat jadwal sesi ${session} tanggal ${formattedDate} untuk sapi ${cowName}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Buat!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const payload = {
          cow_id: parseInt(cowId),
          date: selectedDate,
          session,
          items: [],
        };
        const response = await createDailyFeed(payload);
        if (response.success) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: response.message,
            timer: 1500,
            showConfirmButton: false,
          });
          setShowCowModal(false);
          fetchData();
        } else {
          throw new Error(response.message || "Gagal membuat jadwal pakan.");
        }
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal membuat jadwal pakan.", "error");
    }
  };

  useEffect(() => {
    if (!user.token || !user.user_id || !user.role) {
      localStorage.removeItem("user");
      window.location.href = "/";
    } else {
      fetchData();
      console.log("User:", user);
    }
  }, [selectedDate]);

  const groupedFeeds = feeds.reduce((acc, feed) => {
    const key = `${feed.cow_id}_${feed.date}`;
    if (!acc[key]) {
      const cowName = feed.cow_name || `Sapi ID ${feed.cow_id}`;
      if (!feed.cow_name) {
        console.warn(`Missing cow_name for cow_id: ${feed.cow_id}, is_active: ${feed.is_active}`);
      }
      acc[key] = {
        cow_id: feed.cow_id,
        cow_name: cowName,
        is_active: feed.is_active !== undefined ? feed.is_active : true,
        date: feed.date,
        sessions: [],
      };
    }
    acc[key].sessions.push({
      id: feed.id,
      session: feed.session,
      weather: feed.weather || "Tidak ada data",
      items: feed.items || [],
    });
    return acc;
  }, {});
  console.log("Grouped feeds:", JSON.stringify(groupedFeeds, null, 2));

  const sessions = ["Pagi", "Siang", "Sore"];
  const cowsWithMissingSessions = cows.map((cow) => {
    const key = `${cow.id}_${selectedDate}`;
    const existingSessions = groupedFeeds[key]?.sessions.map((s) => s.session) || [];
    const missingSessions = sessions.filter((session) => !existingSessions.includes(session));
    return missingSessions.length > 0 ? { ...cow, missingSessions } : null;
  }).filter(Boolean);
  console.log("Cows with missing sessions:", cowsWithMissingSessions);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold">
            <i className="fas fa-calendar me-2" /> Jadwal Pakan Harian
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
                max={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}
              />
            </Form.Group>
            <div className="mb-2">
              {isFarmer && (
                <Button
                  variant="primary"
                  onClick={() => setModalType("create")}
                  className="me-2"
                >
                  <i className="fas fa-plus me-2" /> Tambah Jadwal
                </Button>
              )}
              <Button
                variant="success"
                onClick={() => setShowCowModal(true)}
                className="me-2"
              >
                <i className="fas fa-cow me-2" /> Sapi Tanpa Jadwal
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat data jadwal pakan...</p>
            </div>
          ) : (
            <div className="table-responsive">
              {Object.values(groupedFeeds).length === 0 ? (
                <p className="text-center text-muted py-4">
                  Tidak ada jadwal pakan untuk tanggal ini.
                </p>
              ) : (
                <Table bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nama Sapi</th>
                      <th>Tanggal</th>
                      <th>Sesi</th>
                      <th>Cuaca</th>
                      {isFarmer && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedFeeds).map((group) => {
                      const sessionCount = group.sessions.length;
                      return group.sessions.map((session, idx) => (
                        <tr key={`${group.cow_id}_${session.id}`}>
                          {idx === 0 && (
                            <>
                              <td rowSpan={sessionCount}>{group.cow_name}</td>
                              <td rowSpan={sessionCount}>{formatDate(group.date)}</td>
                            </>
                          )}
                          <td>{session.session}</td>
                          <td>{session.weather}</td>
                          {isFarmer && (
                            <td>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  if (group.is_active === false) {
                                    Swal.fire(
                                      "Error",
                                      "Sapi ini tidak aktif. Tidak dapat mengedit jadwal pakan.",
                                      "error"
                                    );
                                    return;
                                  }
                                  setEditId(session.id);
                                  setModalType("edit");
                                }}
                              >
                                <i className="fas fa-edit" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    session.id,
                                    group.cow_name,
                                    formatDate(group.date),
                                    session.session
                                  )
                                }
                              >
                                <i className="fas fa-trash" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ));
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {isFarmer && modalType === "create" && (
        <CreateDailyFeed
          cows={cows} // Active cows only
          defaultDate={selectedDate}
          onClose={() => setModalType(null)}
          onSaved={() => {
            fetchData();
            setModalType(null);
          }}
        />
      )}

      {isFarmer && modalType === "edit" && editId && (
        <EditDailyFeed
          id={editId}
          cows={cows} // Active cows only
          onClose={() => {
            setModalType(null);
            setEditId(null);
          }}
          onSaved={() => {
            fetchData();
            setModalType(null);
            setEditId(null);
          }}
        />
      )}

      <Modal
        show={showCowModal}
        onHide={() => setShowCowModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sapi dengan Jadwal Tidak Lengkap</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cowsWithMissingSessions.length === 0 ? (
            <p className="text-center text-muted">
              {cows.length === 0
                ? "Tidak ada sapi aktif yang tersedia."
                : "Semua sapi aktif memiliki jadwal pakan lengkap untuk tanggal ini."}
            </p>
          ) : (
            <ListGroup>
              {cowsWithMissingSessions.map((cow) => (
                <ListGroup.Item key={cow.id} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{cow.name}</strong>
                    <span className="badge bg-primary">
                      Sesi hilang: {cow.missingSessions.join(", ")}
                    </span>
                  </div>
                  {isFarmer && (
                    <div className="mt-2">
                      {cow.missingSessions.map((session) => (
                        <Button
                          key={`${cow.id}_${session}`}
                          variant="outline-primary"
                          size="sm"
                          className="me-2 mb-2"
                          onClick={() => handleAutoCreate(cow.id, cow.name, session)}
                        >
                          Buat Jadwal {session}
                        </Button>
                      ))}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DailyFeedListPage;