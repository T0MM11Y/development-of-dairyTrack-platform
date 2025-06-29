import { useState, useEffect } from "react";
import { addFeedStock, updateFeedStock } from "../../../../controllers/feedStockController";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";

const AddFeedStock = ({ show, feeds, stock, onClose, onSaved }) => {
  const [form, setForm] = useState({
    feedId: "",
    additionalStock: "",
    stock: "",
  });
  const [originalStock, setOriginalStock] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id && userData.token) {
      setCurrentUser(userData);
      setForm((prev) => ({
        ...prev,
        feedId: stock?.feed_id || "",
        stock: stock?.stock || "",
        feed_name: stock?.feed_name || "",
      }));
      if (stock) {
        setOriginalStock(stock.stock);
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, [stock]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "additionalStock" || name === "stock" ? (value === "" ? "" : parseFloat(value) || 0) : value,
    }));
  };

  const formatNumber = (value) => {
    if (value === "" || isNaN(value)) return "";
    const num = parseFloat(value);
    if (Number.isInteger(num)) return num.toString();
    return num.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = !!stock;
    const confirmText = isEdit
      ? `Apakah Anda yakin ingin mengubah stok pakan "${form.feed_name}" dari ${originalStock} menjadi ${form.stock}?`
      : `Apakah Anda yakin ingin menambahkan stok pakan "${feeds.find((f) => f.id === parseInt(form.feedId))?.name || "Tidak Diketahui"}" sebanyak ${form.additionalStock}?`;

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
      const payload = isEdit
        ? { stock: parseFloat(form.stock) || 0 }
        : {
            feedId: parseInt(form.feedId),
            additionalStock: parseFloat(form.additionalStock) || 0,
          };
      const response = isEdit ? await updateFeedStock(stock.id, payload) : await addFeedStock(payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: isEdit ? "Stok pakan berhasil diperbarui." : "Stok pakan berhasil ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || (isEdit ? "Gagal memperbarui stok pakan." : "Gagal menambah stok pakan."));
      }
    } catch (err) {
      const message = err.message || (isEdit ? "Gagal memperbarui stok pakan." : "Gagal menambah stok pakan.");
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
          {stock ? "Edit Stok Pakan" : "Tambah Stok Pakan"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger text-center">{error}</p>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Nama Pakan</Form.Label>
            {stock ? (
              <Form.Control
                type="text"
                value={form.feed_name}
                readOnly
                disabled
                className="bg-light"
              />
            ) : (
              <Form.Select
                name="feedId"
                value={form.feedId}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Pakan</option>
                {feeds.map((feed) => (
                  <option key={feed.id} value={feed.id}>
                    {feed.name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">{stock ? "Stok" : "Tambahan Stok"}</Form.Label>
            <Form.Control
              type="number"
              name={stock ? "stock" : "additionalStock"}
              value={formatNumber(stock ? form.stock : form.additionalStock)}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">{stock ? "Diperbarui oleh" : "Dibuat oleh"}</Form.Label>
            <Form.Control
              type="text"
              className="bg-light"
              value={currentUser?.name || "Tidak diketahui"}
              disabled
            />
          </Form.Group>

          {stock && (
            <Form.Group className="mb-3">
              <Form.Label className="form-label fw-bold">Tanggal Diperbarui</Form.Label>
              <Form.Control
                type="text"
                value={form.updated_at ? new Date(form.updated_at).toLocaleString("id-ID") : "Belum diperbarui"}
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
            {submitting ? "Menyimpan..." : stock ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddFeedStock;