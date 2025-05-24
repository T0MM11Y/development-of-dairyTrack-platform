import React, { useState, useEffect } from "react";
import { createDailyFeed } from "../../../../controllers/feedScheduleController";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";
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
    date:
      defaultDate ||
      new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }), // WIB
    sessions: {
      Pagi: defaultSession === "Pagi",
      Siang: defaultSession === "Siang",
      Sore: defaultSession === "Sore",
    },
  });
  const [userManagedCows, setUserManagedCows] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Cek sesi pengguna
  useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  if (userData.user_id && userData.token) {
    setCurrentUser(userData);
  } else {
    localStorage.removeItem("user");
    window.location.href = "/";
  }
}, []);

  // Ambil sapi yang dikelola pengguna
  useEffect(() => {
    const fetchUserManagedCows = async () => {
      if (currentUser?.user_id) {
        try {
          const { success, cows } = await listCowsByUser(currentUser.user_id);
          if (success && cows) {
            setUserManagedCows(cows);
            // Jika initialCows ada, filter hanya sapi yang dikelola pengguna
            if (initialCows && initialCows.length > 0) {
              const filteredInitialCows = initialCows.filter((initialCow) =>
                cows.some((managedCow) => managedCow.id === initialCow.id)
              );
              setUserManagedCows(filteredInitialCows);
            }
          } else {
            throw new Error("Gagal memuat data sapi.");
          }
        } catch (err) {
          console.error("Error fetching user's cows:", err);
          setError("Gagal memuat data sapi.");
          Swal.fire({
            icon: "error",
            title: "Gagal Memuat",
            text: "Gagal memuat data sapi.",
          });
        }
      }
    };
    fetchUserManagedCows();
  }, [currentUser, initialCows]);

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

    // Validasi apakah cow_id ada dalam daftar sapi yang dikelola
    const selectedCow = userManagedCows.find(
      (cow) => cow.id === parseInt(form.cow_id)
    );
    if (!selectedCow) {
      setError("Sapi yang dipilih tidak valid atau tidak dapat dikelola.");
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
      let errorMessage = err.message || "Terjadi kesalahan saat membuat jadwal pakan.";
      if (err.message.includes("tidak memiliki izin")) {
        errorMessage = "Anda tidak memiliki izin untuk mengelola sapi ini.";
      }
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gunakan userManagedCows, kecuali jika role_id adalah 1 (admin)
  const rawCows = currentUser?.role_id === 1 ? initialCows || userManagedCows : userManagedCows;

  // Filter sapi yang tersedia (opsional, jika ada logika tambahan seperti di HealthCheckCreatePage)
  const availableCows = Array.isArray(rawCows) ? rawCows : [];

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="text-info fw-bold">Tambah Jadwal Pakan</Modal.Title>
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
              disabled={availableCows.length === 0}
            >
              <option value="">Pilih Sapi</option>
              {availableCows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.name}
                </option>
              ))}
            </Form.Select>
            {availableCows.length === 0 && (
              <p className="text-danger mt-2">
                {userManagedCows.length === 0
                  ? "Anda tidak memiliki akses untuk mengelola sapi."
                  : "Tidak ada sapi tersedia untuk jadwal pakan."}
              </p>
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
              max={new Date().toLocaleDateString("en-CA", {
                timeZone: "Asia/Jakarta",
              })}
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
            disabled={submitting || availableCows.length === 0}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateDailyFeed;