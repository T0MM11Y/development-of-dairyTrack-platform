// src/pages/Admin/FeedManagement/DailyFeed/EditDailyFeed.js
import React, { useState, useEffect } from "react";
import { getDailyFeedById, updateDailyFeed } from "../../../../controllers/feedScheduleController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2";
import { Button, Form, Modal } from "react-bootstrap";

const EditDailyFeed = ({ id, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  if (userData.user_id && userData.token) {
    setCurrentUser(userData);
  } else {
    localStorage.removeItem("user");
    window.location.href = "/";
  }
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedResponse, cowResponse] = await Promise.all([
          getDailyFeedById(id),
          listCows(),
        ]);

        if (feedResponse.success) {
          const feedData = feedResponse.data;
          const initialForm = {
            cow_id: feedData.cow_id,
            date: feedData.date,
            sessions: {
              Pagi: feedData.session === "Pagi",
              Siang: feedData.session === "Siang",
              Sore: feedData.session === "Sore",
            },
          };
          setForm(initialForm);
          setOriginalForm(initialForm);
        } else {
          throw new Error(feedResponse.message || "Jadwal pakan tidak ditemukan.");
        }

        if (cowResponse.success) {
          console.log("Raw cow response (EditDailyFeed):", cowResponse.cows);
          setCows(cowResponse.cows || []);
        } else {
          setCows([]);
        }
      } catch (err) {
        setError("Gagal memuat data jadwal pakan.");
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Gagal memuat data jadwal pakan.",
        });
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "cow_id" || name === "date") {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else if (name.startsWith("session_")) {
      const session = name.split("_")[1];
      setForm((prev) => ({
        ...prev,
        sessions: { ...prev.sessions, [session]: checked },
      }));
    }
  };

  const hasChanges = () => {
    if (!originalForm || !form) return false;
    return (
      form.cow_id !== originalForm.cow_id ||
      form.date !== originalForm.date ||
      JSON.stringify(form.sessions) !== JSON.stringify(originalForm.sessions)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges()) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Tidak ada data yang diubah.",
      });
      return;
    }

    const activeSessions = Object.entries(form.sessions)
      .filter(([_, checked]) => checked)
      .map(([session]) => session);

    if (!form.cow_id) {
      setError("Harap pilih sapi.");
      setSubmitting(false);
      return;
    }
    if (!form.date) {
      setError("Harap pilih tanggal.");
      setSubmitting(false);
      return;
    }
    if (activeSessions.length === 0) {
      setError("Pilih setidaknya satu sesi.");
      setSubmitting(false);
      return;
    }

    // Since we're editing a single schedule, ensure only one session is selected
    if (activeSessions.length > 1) {
      setError("Hanya satu sesi yang dapat dipilih untuk pengeditan.");
      setSubmitting(false);
      return;
    }

    const session = activeSessions[0];

    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: `Apakah Anda yakin ingin menyimpan perubahan untuk jadwal pakan pada ${form.date} sesi ${session}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cow_id: parseInt(form.cow_id),
        date: form.date,
        session,
        items: [], // No feed items, as per requirement
      };
      const response = await updateDailyFeed(id, payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message,
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || "Gagal memperbarui jadwal pakan.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memperbarui jadwal pakan.");
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: err.message || "Terjadi kesalahan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="text-info fw-bold">Edit Jadwal Pakan</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        {loading || !form ? (
          <div className="text-center py-5">
            <p className="mt-2">Memuat data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label className="fw-bold">Sapi</Form.Label>
              <Form.Select
                name="cow_id"
                value={form.cow_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Sapi</option>
                {cows.map((cow) => (
                  <option key={cow.id} value={cow.id}>
                    {cow.name}
                  </option>
                ))}
              </Form.Select>
              {cows.length === 0 && (
                <p className="text-muted mt-2">Tidak ada sapi tersedia.</p>
              )}
            </div>

            <div className="mb-3">
              <Form.Label className="fw-bold">Tanggal</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="mb-3">
              <Form.Label className="fw-bold">Sesi</Form.Label>
              <div className="d-flex gap-3">
                {["Pagi", "Siang", "Sore"].map((session) => (
                  <Form.Check
                    key={session}
                    type="checkbox"
                    id={`session_${session}`}
                    name={`session_${session}`}
                    label={session}
                    checked={form.sessions[session]}
                    onChange={handleChange}
                    className="me-3"
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="info"
              className="w-100 mt-3"
              disabled={submitting || !hasChanges()}
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditDailyFeed;