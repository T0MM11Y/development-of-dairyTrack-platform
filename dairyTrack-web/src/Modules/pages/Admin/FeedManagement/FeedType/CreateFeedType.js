// CreateFeedType.js
import { useState, useEffect } from "react";
import { addFeedType, updateFeedType } from "../../../../controllers/feedTypeController";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";

const FeedTypeCreatePage = ({ show, onClose, onSaved, feedType }) => {
  const [form, setForm] = useState({
    name: "",
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
        name: feedType?.name || "",
      }));
    } else {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, [feedType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = !!feedType;
    const confirmText = isEdit
      ? `Apakah Anda yakin ingin mengubah jenis pakan "${feedType.name}" jadi "${form.name}"?`
      : `Apakah Anda yakin ingin menambahkan jenis pakan "${form.name}"?`;

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

    try {
      const response = isEdit
        ? await updateFeedType(feedType.id, { name: form.name })
        : await addFeedType({ name: form.name });
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: isEdit ? "Jenis pakan berhasil diperbarui." : "Jenis pakan berhasil disimpan.",
          timer: 1500,
          showConfirmButton: false,
        });

        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || (isEdit ? "Gagal memperbarui jenis pakan." : "Gagal menyimpan jenis pakan."));
      }
    } catch (err) {
      let message = err.message || (isEdit ? "Gagal memperbarui jenis pakan." : "Gagal menyimpan jenis pakan.");
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
        <Modal.Title className="text-info fw-bold">{feedType ? "Edit Jenis Pakan" : "Tambah Jenis Pakan"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger text-center">{error}</p>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Nama Jenis Pakan</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">{feedType ? "Diperbarui oleh" : "Dibuat oleh"}</Form.Label>
            <Form.Control
              type="text"
              className="bg-light"
              value={currentUser?.name || "Tidak diketahui"}
              disabled
            />
            <Form.Control type="hidden" name={feedType ? "updated_by" : "created_by"} value={form[feedType ? "updated_by" : "created_by"]} />
          </Form.Group>

          {feedType && (
            <Form.Group className="mb-3">
              <Form.Label className="form-label fw-bold">Tanggal Diperbarui</Form.Label>
              <Form.Control
                type="text"
                value={new Date(feedType.updated_at).toLocaleString("id-ID")}
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
            {submitting ? "Menyimpan..." : feedType ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FeedTypeCreatePage;