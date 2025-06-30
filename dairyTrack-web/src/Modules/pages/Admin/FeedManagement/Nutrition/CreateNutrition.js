import { useState, useEffect } from "react";
import { addNutrition, updateNutrition, getNutritionById } from "../../../../controllers/nutritionController";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";

const NutritionCreatePage = ({ show, onClose, onSaved, nutrition }) => {
  const [form, setForm] = useState({
    name: "",
    unit: "",
    created_by: "",
    updated_by: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id && userData.token) {
      setCurrentUser(userData);
      setForm((prev) => ({
        ...prev,
        created_by: userData.user_id || "",
        updated_by: userData.user_id || "",
        name: nutrition?.name || "",
        unit: nutrition?.unit || "",
      }));
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, [nutrition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = !!nutrition;
    const confirmText = isEdit
      ? `Apakah Anda yakin ingin mengubah nutrisi "${nutrition.name}" menjadi "${form.name}" dengan satuan "${form.unit}"?`
      : `Apakah Anda yakin ingin menambahkan nutrisi "${form.name}" dengan satuan "${form.unit}"?`;

    const result = await Swal.fire({
      title: "Konfirmasi",
      text: confirmText,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEdit ? "Ya, Ubah!" : "Ya, Simpan",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = { name: form.name.trim(), unit: form.unit.trim() };
      const response = isEdit
        ? await updateNutrition(nutrition.id, payload)
        : await addNutrition(payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: isEdit ? "Nutrisi berhasil diperbarui." : "Nutrisi berhasil disimpan.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || (isEdit ? "Gagal memperbarui nutrisi." : "Gagal menyimpan nutrisi."));
      }
    } catch (err) {
      const message = err.message || (isEdit ? "Gagal memperbarui nutrisi." : "Gagal menyimpan nutrisi.");
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-info fw-bold">
          {nutrition ? "Edit Nutrisi" : "Tambah Nutrisi"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger text-center">{error}</p>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Nama Nutrisi</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Satuan</Form.Label>
            <Form.Control
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">{nutrition ? "Diperbarui oleh" : "Dibuat oleh"}</Form.Label>
            <Form.Control
              type="text"
              className="bg-light"
              value={currentUser?.name || "Tidak diketahui"}
              disabled
            />
            <Form.Control
              type="hidden"
              name={nutrition ? "updated_by" : "created_by"}
              value={form[nutrition ? "updated_by" : "created_by"]}
            />
          </Form.Group>

          {nutrition && (
            <Form.Group className="mb-3">
              <Form.Label className="form-label fw-bold">Tanggal Diperbarui</Form.Label>
              <Form.Control
                type="text"
                value={new Date(nutrition.updated_at).toLocaleString("id-ID")}
                readOnly
                disabled
              />
            </Form.Group>
          )}

          <Button
            type="submit"
            variant="info"
            className="w-100"
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : nutrition ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NutritionCreatePage;