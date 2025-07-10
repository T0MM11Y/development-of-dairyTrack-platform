// EditFeedType.js
import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getFeedTypeById, updateFeedType } from "../../../../controllers/feedTypeController";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";

const EditFeedType = () => {
  const { id } = useParams();
  const history = useHistory();
  const [form, setForm] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id && userData.token) {
      setCurrentUser(userData);
    } else {
      localStorage.removeItem("user");
      history.push("/");
    }
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFeedTypeById(id);
        if (response.success) {
          setForm({
            name: response.feedType.name || "",
            updated_at: response.feedType.updated_at || "",
            updated_by: currentUser?.user_id || "",
          });
          setOriginalName(response.feedType.name || "");
        } else {
          throw new Error(response.message || "Feed type not found.");
        }
      } catch (err) {
        setError("Gagal memuat data jenis pakan.");
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Gagal memuat data jenis pakan.",
        });
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchData();
    }
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name === originalName) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Nama jenis pakan tidak berubah.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: `Apakah anda yakin mau mengubah "${originalName}" jadi "${form.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Ubah!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      setShow(false);
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: form.name };
      const response = await updateFeedType(id, payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Jenis pakan berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
        setShow(false);
        history.push("/admin/list-feedType");
      } else {
        throw new Error(response.message || "Gagal memperbarui jenis pakan.");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: err.message || "Terjadi kesalahan saat memperbarui data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    history.push("/admin/list-feedType");
  };

  useEffect(() => {
    if (!show) {
      history.push("/admin/list-feedType");
    }
  }, [show, history]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-info fw-bold">Edit Jenis Pakan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger text-center">{error}</p>}
        {loading || !form ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status" />
            <p className="mt-2">Memuat data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label className="form-label fw-bold">Nama Jenis Pakan</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="form-label fw-bold">Diperbarui oleh</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser?.name || "Tidak diketahui"}
                  readOnly
                  disabled
                />
                <Form.Control type="hidden" name="updated_by" value={form.updated_by} />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="form-label fw-bold">Tanggal Diperbarui</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    form.updated_at
                      ? new Date(form.updated_at).toLocaleString("id-ID")
                      : "Belum diperbarui"
                  }
                  readOnly
                  disabled
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="info"
              className="w-100"
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditFeedType;