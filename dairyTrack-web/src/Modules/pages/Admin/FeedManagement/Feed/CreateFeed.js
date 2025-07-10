import { useState, useEffect } from "react";
import { addFeed, updateFeed } from "../../../../controllers/feedController";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";

const FeedCreatePage = ({ show, feedTypes, nutritions, feed, onClose, onSaved }) => {
  const [form, setForm] = useState({
    typeId: "",
    name: "",
    unit: "",
    min_stock: "",
    price: "",
    created_by: "",
    updated_by: "",
    nutrisiList: [],
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
        typeId: feed?.type_id || "",
        name: feed?.name || "",
        unit: feed?.unit || "",
        min_stock: feed?.min_stock || "",
        price: feed?.price || "",
        nutrisiList: feed?.nutrisi_records?.map((n) => ({
          nutrisi_id: n.nutrisi_id,
          amount: n.amount || "",
          nutrisi_name: nutritions.find((nut) => nut.id === n.nutrisi_id)?.name || "Tidak diketahui",
        })) || [],
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
  }, [feed, nutritions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "min_stock") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value) || 0,
      }));
    } else if (name === "typeId") {
      setForm((prev) => ({
        ...prev,
        typeId: value,
        typeName: feedTypes.find((t) => t.id === parseInt(value))?.name || "Tidak diketahui",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNutrisiChange = (index, field, value) => {
    const updatedNutrisiList = [...form.nutrisiList];
    updatedNutrisiList[index] = {
      ...updatedNutrisiList[index],
      [field]: field === "amount" ? (value === "" ? "" : parseFloat(value) || 0) : value,
      nutrisi_name: field === "nutrisi_id" ? nutritions.find((nut) => nut.id === parseInt(value))?.name || "Tidak diketahui" : updatedNutrisiList[index].nutrisi_name,
    };
    setForm((prev) => ({
      ...prev,
      nutrisiList: updatedNutrisiList,
    }));
  };

  const addNutrisi = () => {
    setForm((prev) => ({
      ...prev,
      nutrisiList: [...prev.nutrisiList, { nutrisi_id: "", amount: "", nutrisi_name: "" }],
    }));
  };

  const removeNutrisi = (index) => {
    setForm((prev) => ({
      ...prev,
      nutrisiList: prev.nutrisiList.filter((_, i) => i !== index),
    }));
  };

  const formatNumber = (value) => {
    if (value === "" || isNaN(value)) return "";
    const num = parseFloat(value);
    if (Number.isInteger(num)) return num.toString();
    return num.toString();
  };

  const getAvailableNutritions = (currentIndex) => {
    const selectedNutrisiIds = form.nutrisiList
      .filter((_, index) => index !== currentIndex)
      .map((n) => n.nutrisi_id)
      .filter((id) => id);
    return nutritions.filter((n) => !selectedNutrisiIds.includes(n.id.toString()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = !!feed;
    const confirmText = isEdit
      ? `Apakah Anda yakin ingin mengubah pakan "${feed.name}"?`
      : `Apakah Anda yakin ingin menambahkan pakan "${form.name}"?`;

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
      const payload = {
        typeId: parseInt(form.typeId),
        name: form.name.trim(),
        unit: form.unit.trim(),
        min_stock: parseFloat(form.min_stock) || 0,
        price: parseFloat(form.price) || 0,
        nutrisiList: form.nutrisiList.map((n) => ({
          nutrisi_id: parseInt(n.nutrisi_id),
          amount: parseFloat(n.amount) || 0,
        })),
      };

      const response = isEdit ? await updateFeed(feed.id, payload) : await addFeed(payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: isEdit ? "Pakan berhasil diperbarui." : "Pakan berhasil disimpan.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || (isEdit ? "Gagal memperbarui pakan." : "Gagal menyimpan pakan."));
      }
    } catch (err) {
      const message = err.message || (isEdit ? "Gagal memperbarui pakan." : "Gagal menyimpan pakan.");
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
          {feed ? "Edit Pakan" : "Tambah Pakan"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger text-center">{error}</p>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Jenis Pakan</Form.Label>
            <Form.Select
              name="typeId"
              value={form.typeId}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Jenis Pakan</option>
              {feedTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Form.Select>
            {feed && (
              <Form.Text className="text-muted">
                Jenis saat ini: {form.typeName || "Tidak diketahui"}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Nama Pakan</Form.Label>
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
            <Form.Label className="form-label fw-bold">Stok Minimum</Form.Label>
            <Form.Control
              type="number"
              name="min_stock"
              value={formatNumber(form.min_stock)}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">Harga</Form.Label>
            <div className="input-group">
              <span className="input-group-text">Rp</span>
              <Form.Control
                type="number"
                name="price"
                value={formatNumber(form.price)}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold">{feed ? "Diperbarui oleh" : "Dibuat oleh"}</Form.Label>
            <Form.Control
              type="text"
              className="bg-light"
              value={currentUser?.name || "Tidak diketahui"}
              disabled
            />
            <Form.Control
              type="hidden"
              name={feed ? "updated_by" : "created_by"}
              value={form[feed ? "updated_by" : "created_by"]}
            />
          </Form.Group>

          {feed && (
            <Form.Group className="mb-3">
              <Form.Label className="form-label fw-bold">Tanggal Diperbarui</Form.Label>
              <Form.Control
                type="text"
                value={new Date(feed.updated_at).toLocaleString("id-ID")}
                readOnly
                disabled
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="form-label fw-bold d-block">Nutrisi</Form.Label>
            {form.nutrisiList.map((nutrisi, index) => (
              <div key={index} className="row mb-2 align-items-center">
                <div className="col-md-5">
                  {index === 0 && <Form.Label className="form-label mb-1">Pilih Nutrisi</Form.Label>}
                  <Form.Select
                    value={nutrisi.nutrisi_id}
                    onChange={(e) => handleNutrisiChange(index, "nutrisi_id", e.target.value)}
                    required
                  >
                    <option value="">Pilih Nutrisi</option>
                    {getAvailableNutritions(index).map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.unit})
                      </option>
                    ))}
                  </Form.Select>
                  {nutrisi.nutrisi_name && (
                    <Form.Text className="text-muted">
                      Nutrisi saat ini: {nutrisi.nutrisi_name}
                    </Form.Text>
                  )}
                </div>
                <div className="col-md-5">
                  {index === 0 && <Form.Label className="form-label mb-1">Jumlah</Form.Label>}
                  <Form.Control
                    type="number"
                    value={formatNumber(nutrisi.amount)}
                    onChange={(e) => handleNutrisiChange(index, "amount", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-md-2">
                  <Button
                    variant="outline-danger"
                    onClick={() => removeNutrisi(index)}
                    className="mt-3"
                  >
                    <i className="fas fa-trash" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline-primary"
              onClick={addNutrisi}
              className="mt-2"
            >
              Tambah Nutrisi
            </Button>
          </Form.Group>

          <Button
            type="submit"
            variant="info"
            className="w-100"
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : feed ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FeedCreatePage;