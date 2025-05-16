// src/pages/Admin/FeedManagement/DailyFeed/DailyFeedListPage.js
import React, { useEffect, useState } from "react";
import { getAllDailyFeeds, deleteDailyFeed, createDailyFeed } from "../../../../controllers/feedScheduleController";
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role === "Supervisor";

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
      const [feedResponse, cowResponse] = await Promise.all([
        getAllDailyFeeds({ date: selectedDate }),
        listCows(),
      ]);

      if (feedResponse.success) {
        setFeeds(feedResponse.data || []);
      } else {
        setFeeds([]);
      }

      if (cowResponse.success) {
        setCows(cowResponse.cows || []);
      } else {
        setCows([]);
      }
    } catch (err) {
      Swal.fire("Error", "Gagal memuat data jadwal pakan.", "error");
      setFeeds([]);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, cowName, date, session) => {
    try {
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
          items: [], // Empty items, as backend allows it
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
    if (!user.token) {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      }).then(() => {
        localStorage.removeItem("user");
        window.location.href = "/";
      });
    } else {
      fetchData();
    }
  }, [selectedDate]);

  // Group feeds by cow and date
  const groupedFeeds = feeds.reduce((acc, feed) => {
    const key = `${feed.cow_id}_${feed.date}`;
    if (!acc[key]) {
      acc[key] = {
        cow_id: feed.cow_id,
        cow_name: feed.cow_name,
        date: feed.date,
        sessions: [],
      };
    }
    acc[key].sessions.push({
      id: feed.id,
      session: feed.session,
      weather: feed.weather || "Tidak ada data",
    });
    return acc;
  }, {});

  // Find cows without feed schedules for the selected date
  const sessions = ["Pagi", "Siang", "Sore"];
  const cowsWithoutSchedules = cows
    .map((cow) => {
      const key = `${cow.id}_${selectedDate}`;
      const existingSessions = groupedFeeds[key]?.sessions.map((s) => s.session) || [];
      const missingSessions = sessions.filter((session) => !existingSessions.includes(session));
      if (missingSessions.length > 0) {
        return { ...cow, missingSessions };
      }
      return null;
    })
    .filter(Boolean);

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
                max={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
            <div className="mb-2">
              <Button
                variant="primary"
                onClick={() => !isSupervisor && setModalType("create")}
                {...disableIfSupervisor}
                className="me-2"
              >
                <i className="fas fa-plus me-2" /> Tambah Jadwal
              </Button>
              {cowsWithoutSchedules.length > 0 && (
                <Button
                  variant="success"
                  onClick={() => !isSupervisor && setShowCowModal(true)}
                  {...disableIfSupervisor}
                >
                  <i className="fas fa-cow me-2" /> Sapi Tanpa Jadwal
                </Button>
              )}
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
                <p className="text-center text-muted py-4">Tidak ada jadwal pakan untuk tanggal ini.</p>
              ) : (
                <Table bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nama Sapi</th>
                      <th>Tanggal</th>
                      <th>Sesi</th>
                      <th>Cuaca</th>
                      <th>Aksi</th>
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
                          <td>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                if (!isSupervisor) {
                                  setEditId(session.id);
                                  setModalType("edit");
                                }
                              }}
                              {...disableIfSupervisor}
                            >
                              <i className="fas fa-edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                !isSupervisor &&
                                handleDelete(
                                  session.id,
                                  group.cow_name,
                                  formatDate(group.date),
                                  session.session
                                )
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
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modals */}
      {modalType === "create" && (
        <CreateDailyFeed
          cows={cows}
          defaultDate={selectedDate}
          onClose={() => setModalType(null)}
          onSaved={() => {
            fetchData();
            setModalType(null);
          }}
        />
      )}

      {modalType === "edit" && editId && (
        <EditDailyFeed
          id={editId}
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
          <Modal.Title>Sapi Tanpa Jadwal Pakan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cowsWithoutSchedules.length === 0 ? (
            <p className="text-center text-muted">Semua sapi memiliki jadwal pakan lengkap.</p>
          ) : (
            <ListGroup>
              {cowsWithoutSchedules.map((cow) => (
                <ListGroup.Item key={cow.id} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{cow.name}</strong>
                    <span className="badge bg-primary">{cow.missingSessions.length} sesi tersisa</span>
                  </div>
                  <div className="mt-2">
                    {cow.missingSessions.map((session) => (
                      <Button
                        key={`${cow.id}_${session}`}
                        variant="outline-primary"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => !isSupervisor && handleAutoCreate(cow.id, cow.name, session)}
                        {...disableIfSupervisor}
                      >
                        Buat Jadwal {session}
                      </Button>
                    ))}
                  </div>
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