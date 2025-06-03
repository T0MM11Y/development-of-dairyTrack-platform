// NutritionEditPage.js
import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getNutritionById, updateNutrition } from "../../../../controllers/nutritionController";
import Swal from "sweetalert2";

const NutritionEditPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const [form, setForm] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

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
      history.push("/");
    }
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getNutritionById(id);
        if (response.success) {
          setForm({
            name: response.nutrition.name || "",
            unit: response.nutrition.unit || "",
            updated_at: response.nutrition.updated_at || "",
            updated_by: currentUser?.user_id || "",
          });
          setOriginalName(response.nutrition.name || "");
        } else {
          throw new Error(response.message || "Nutrisi tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat data nutrisi.");
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Gagal memuat data nutrisi.",
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
        text: "Nama nutrisi tidak berubah.",
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
      history.push("/admin/nutritions");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: form.name, unit: form.unit };
      const response = await updateNutrition(id, payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Nutrisi berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
        history.push("/admin/nutritions");
      } else {
        throw new Error(response.message || "Gagal memperbarui nutrisi.");
      }
    } catch (err) {
      console.error("Update error:", err);
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
    history.push("/admin/nutritions");
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)", minHeight: "100vh" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Edit Nutrisi</h4>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading || !form ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Nama Nutrisi</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Satuan</label>
                    <input
                      type="text"
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Diperbarui oleh</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentUser?.name || "Tidak diketahui"}
                      readOnly
                      disabled
                    />
                    <input type="hidden" name="updated_by" value={form.updated_by} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Tanggal Diperbarui</label>
                    <input
                      type="text"
                      className="form-control"
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
                <button
                  type="submit"
                  className="btn btn-info w-100"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionEditPage;