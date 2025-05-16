// src/pages/Admin/FeedManagement/DailyFeed/CreateDailyFeed.js
import React, { useState, useEffect } from "react";
import { createDailyFeed } from "../../../../controllers/feedScheduleController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2";
import { Button, Form, Modal } from "react-bootstrap";

const CreateDailyFeed = ({
  cows: initialCows,
  defaultCowId,
  defaultSession,
  defaultDate,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    cow_id: defaultCowId || "",
    date: defaultDate || new Date().toISOString().split("T")[0],
    sessions: {
      Pagi: defaultSession === "Pagi",
      Siang: defaultSession === "Siang",
      Sore: defaultSession === "Sore",
    },
  });
  const [cows, setCows] = useState(initialCows || []);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id) {
      setCurrentUser(userData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const cowResponse = await listCows();
        if (cowResponse.success) {
          // Log raw response to debug
          console.log("Raw cow response:", cowResponse.cows);
          // If UserCowAssociations is not needed or causing issues, use all cows
          const availableCows = cowResponse.cows || [];
          setCows(availableCows);
          // If initialCows were passed and still valid, prioritize them
          if (initialCows && initialCows.length > 0) {
            setCows(initialCows);
          }
        } else {
          throw new Error("Gagal memuat data sapi.");
        }
      } catch (err) {
        setError("Gagal memuat data sapi.");
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Gagal memuat data sapi.",
        });
      }
    };
    if (currentUser) fetchCows();
  }, [currentUser, initialCows]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

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

    try {
      for (const session of activeSessions) {
        const payload = {
          cow_id: parseInt(form.cow_id),
          date: form.date,
          session,
          items: [], // No feed items, as per requirement
        };

        const response = await createDailyFeed(payload);
        if (!response.success) {
          throw new Error(response.message || "Gagal membuat jadwal pakan.");
        }
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Jadwal pakan untuk ${activeSessions.length} sesi berhasil dibuat.`,
        timer: 1500,
        showConfirmButton: false,
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat membuat jadwal pakan.");
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err.message || "Terjadi kesalahan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="text-info fw-bold">
          Tambah Jadwal Pakan
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {error && <p className="text-danger text-center mb-4">{error}</p>}
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
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateDailyFeed;
