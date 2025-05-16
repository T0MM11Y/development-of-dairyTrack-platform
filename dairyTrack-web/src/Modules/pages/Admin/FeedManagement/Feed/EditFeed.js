// src/pages/Admin/FeedManagement/Feed/EditFeed.js
import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  getFeedById,
  updateFeed,
} from "../../../../controllers/feedController";
import { listFeedTypes } from "../../../../controllers/feedTypeController";
import { listNutritions } from "../../../../controllers/nutritionController";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";

const FeedEditPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const [form, setForm] = useState(null);
  const [originalForm, setOriginalForm] = useState(null); // Store original data to compare changes
  const [feedTypes, setFeedTypes] = useState([]);
  const [nutritions, setNutritions] = useState([]);
  const [setOriginalName] = useState("");
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
        const [feedResponse, feedTypeResponse, nutritionResponse] =
          await Promise.all([
            getFeedById(id),
            listFeedTypes(),
            listNutritions(),
          ]);

        if (feedResponse.success) {
          const feed = feedResponse.feed;
          const initialForm = {
            typeId: feed.type_id || "",
            name: feed.name || "",
            unit: feed.unit || "",
            min_stock: feed.min_stock || 0,
            price: feed.price || 0,
            updated_at: feed.updated_at || "",
            updated_by: currentUser?.user_id || "",
            nutrisiList: feed.nutrisi_records.map((n) => ({
              nutrisi_id: n.nutrisi_id,
              amount: n.amount,
            })),
          };
          setForm(initialForm);
          setOriginalForm(initialForm); // Store original data for comparison
          setOriginalName(feed.name || "");
        } else {
          throw new Error(feedResponse.message || "Pakan tidak ditemukan.");
        }

        if (feedTypeResponse.success) {
          setFeedTypes(feedTypeResponse.feedTypes || []);
        } else {
          setFeedTypes([]);
        }

        if (nutritionResponse.success) {
          setNutritions(nutritionResponse.nutritions || []);
        } else {
          setNutritions([]);
        }
      } catch (err) {
        setError("Gagal memuat data pakan.");
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Gagal memuat data pakan.",
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
    if (name === "price" || name === "min_stock") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value) || 0,
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
      [field]:
        field === "amount"
          ? value === ""
            ? ""
            : parseFloat(value) || 0
          : value,
    };
    setForm((prev) => ({
      ...prev,
      nutrisiList: updatedNutrisiList,
    }));
  };

  const addNutrisi = () => {
    setForm((prev) => ({
      ...prev,
      nutrisiList: [...prev.nutrisiList, { nutrisi_id: "", amount: "" }],
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
    if (Number.isInteger(num)) return num.toString(); // No decimals for integers (e.g., 2 -> "2")
    return num.toString(); // Keep decimals as they are (e.g., 2.5 -> "2.5")
  };

  const getAvailableNutritions = (currentIndex) => {
    const selectedNutrisiIds = form.nutrisiList
      .filter((_, index) => index !== currentIndex)
      .map((n) => n.nutrisi_id)
      .filter((id) => id);
    return nutritions.filter(
      (n) => !selectedNutrisiIds.includes(n.id.toString())
    );
  };

  const hasChanges = () => {
    if (!originalForm || !form) return false;
    // Compare basic fields
    const basicFieldsChanged =
      form.typeId !== originalForm.typeId ||
      form.name.trim() !== originalForm.name.trim() ||
      form.unit.trim() !== originalForm.unit.trim() ||
      parseFloat(form.min_stock) !== parseFloat(originalForm.min_stock) ||
      parseFloat(form.price) !== parseFloat(originalForm.price);
    // Compare nutrisiList
    const nutrisiListChanged =
      JSON.stringify(form.nutrisiList) !==
      JSON.stringify(originalForm.nutrisiList);
    return basicFieldsChanged || nutrisiListChanged;
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

    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: `Apakah anda yakin mau menyimpan perubahan untuk pakan "${form.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      history.push("/admin/list-feed");
      return;
    }

    setSubmitting(true);
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
      const response = await updateFeed(id, payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message || "Pakan berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
        history.push("/admin/list-feed");
      } else {
        throw new Error(response.message || "Gagal memperbarui pakan.");
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
    history.push("/admin/list-feed");
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)", minHeight: "100vh" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h4 className="modal-title text-info fw-bold">Edit Pakan</h4>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4">
            {error && <p className="text-danger text-center mb-4">{error}</p>}
            {loading || !form ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Jenis Pakan</label>
                    <select
                      name="typeId"
                      value={form.typeId}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      <option value="">Pilih Jenis Pakan</option>
                      {feedTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Nama Pakan</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="row">
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
                    <label className="form-label fw-bold">Stok Minimum</label>
                    <input
                      type="number"
                      name="min_stock"
                      value={formatNumber(form.min_stock)}
                      onChange={handleChange}
                      className="form-control"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Harga</label>
                    <div className="input-group">
                      <span className="input-group-text">Rp</span>
                      <input
                        type="number"
                        name="price"
                        value={formatNumber(form.price)}
                        onChange={handleChange}
                        className="form-control"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Diperbarui oleh
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={currentUser?.name || "Tidak diketahui"}
                      readOnly
                      disabled
                    />
                    <input
                      type="hidden"
                      name="updated_by"
                      value={form.updated_by}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Tanggal Diperbarui
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light"
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

                <div className="mb-3">
                  <label className="form-label fw-bold d-block">Nutrisi</label>
                  {form.nutrisiList.map((nutrisi, index) => (
                    <div key={index} className="row mb-2 align-items-center">
                      <div className="col-md-5">
                        {index === 0 && (
                          <label className="form-label mb-1">
                            Pilih Nutrisi
                          </label>
                        )}
                        <select
                          className="form-control"
                          value={nutrisi.nutrisi_id}
                          onChange={(e) =>
                            handleNutrisiChange(
                              index,
                              "nutrisi_id",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">Pilih Nutrisi</option>
                          {getAvailableNutritions(index).map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name} ({n.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-5">
                        {index === 0 && (
                          <label className="form-label mb-1">Jumlah</label>
                        )}
                        <input
                          type="number"
                          className="form-control"
                          value={formatNumber(nutrisi.amount)}
                          onChange={(e) =>
                            handleNutrisiChange(index, "amount", e.target.value)
                          }
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
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 mt-3"
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

export default FeedEditPage;
