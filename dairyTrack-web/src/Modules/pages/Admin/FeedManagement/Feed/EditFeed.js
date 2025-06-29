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
  const [originalForm, setOriginalForm] = useState(null);
  const [feedTypes, setFeedTypes] = useState([]);
  const [nutritions, setNutritions] = useState([]);
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

        console.log("Feed Response:", feedResponse);
        console.log("Feed Types Response:", feedTypeResponse);
        console.log("Nutritions Response:", nutritionResponse);

        if (feedResponse.success) {
          const feed = feedResponse.feed;
          // Cari nama jenis pakan berdasarkan type_id
          const typeName =
            feedTypeResponse.success && feedTypeResponse.feedTypes
              ? feedTypeResponse.feedTypes.find(
                  (t) => t.id === parseInt(feed.type_id)
                )?.name || "Belum ada"
              : "Belum ada";

          const initialForm = {
            typeId: feed.type_id ? feed.type_id.toString() : "",
            typeName, // Set typeName langsung di sini
            name: feed.name || "",
            unit: feed.unit || "",
            min_stock: feed.min_stock || 0,
            price: feed.price || 0,
            updated_at: feed.updated_at || "",
            updated_by: currentUser?.user_id || "",
            nutrisiList: feed.nutrisi_records.map((n) => ({
              nutrisi_id: n.nutrisi_id ? n.nutrisi_id.toString() : "",
              amount: n.amount || 0,
              nutrisi_name:
                nutritionResponse.success && nutritionResponse.nutritions
                  ? nutritionResponse.nutritions.find(
                      (nut) => nut.id === parseInt(n.nutrisi_id)
                    )?.name || "Tidak diketahui"
                  : "Tidak diketahui",
            })),
          };
          setForm(initialForm);
          setOriginalForm(initialForm);
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

  // Update typeName and nutrisi_name when feedTypes or nutritions change
  useEffect(() => {
    if (form && feedTypes.length > 0 && nutritions.length > 0) {
      setForm((prev) => ({
        ...prev,
        typeName:
          feedTypes.find((t) => t.id === parseInt(prev.typeId))?.name ||
          "Belum ada",
        nutrisiList: prev.nutrisiList.map((n) => ({
          ...n,
          nutrisi_name:
            nutritions.find((nut) => nut.id === parseInt(n.nutrisi_id))?.name ||
            "Tidak diketahui",
        })),
      }));
    }
  }, [feedTypes, nutritions, form]);

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
        typeName:
          feedTypes.find((t) => t.id === parseInt(value))?.name || "Belum ada",
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
    return nutritions.filter(
      (n) => !selectedNutrisiIds.includes(n.id.toString())
    );
  };

  const detectChanges = () => {
    if (!originalForm || !form) return { hasChanges: false, messages: [] };

    const messages = [];
    let hasChanges = false;

    // Compare typeId
    if (form.typeId !== originalForm.typeId) {
      const oldType = feedTypes.find((t) => t.id === parseInt(originalForm.typeId))?.name || "Tidak diketahui";
      const newType = feedTypes.find((t) => t.id === parseInt(form.typeId))?.name || "Tidak diketahui";
      messages.push(`Mengubah jenis pakan yang awalnya "${oldType}" menjadi "${newType}"`);
      hasChanges = true;
    }

    // Compare name
    if (form.name.trim() !== originalForm.name.trim()) {
      messages.push(`Mengubah nama pakan dari "${originalForm.name.trim()}" menjadi "${form.name.trim()}"`);
      hasChanges = true;
    }

    // Compare unit
    if (form.unit.trim() !== originalForm.unit.trim()) {
      messages.push(`Mengubah satuan dari "${originalForm.unit.trim()}" menjadi "${form.unit.trim()}"`);
      hasChanges = true;
    }

    // Compare min_stock
    if (parseFloat(form.min_stock) !== parseFloat(originalForm.min_stock)) {
      messages.push(`Mengubah stok minimum dari "${formatNumber(originalForm.min_stock)}" menjadi "${formatNumber(form.min_stock)}"`);
      hasChanges = true;
    }

    // Compare price
    if (parseFloat(form.price) !== parseFloat(originalForm.price)) {
      messages.push(`Mengubah harga dari "Rp ${formatNumber(originalForm.price).toLocaleString("id-ID")}" menjadi "Rp ${formatNumber(form.price).toLocaleString("id-ID")}"`);
      hasChanges = true;
    }

    // Compare nutrisiList
    const oldNutrisiList = originalForm.nutrisiList;
    const newNutrisiList = form.nutrisiList;

    // Detect removed nutritions
    const removedNutritions = oldNutrisiList.filter(
      (oldN) => !newNutrisiList.some((newN) => newN.nutrisi_id === oldN.nutrisi_id)
    );
    if (removedNutritions.length > 0) {
      const removedNames = removedNutritions.map(
        (n) => nutritions.find((nut) => nut.id === parseInt(n.nutrisi_id))?.name || "Tidak diketahui"
      );
      messages.push(`Menghapus nutrisi: ${removedNames.join(", ")}`);
      hasChanges = true;
    }

    // Detect added nutritions
    const addedNutritions = newNutrisiList.filter(
      (newN) => !oldNutrisiList.some((oldN) => oldN.nutrisi_id === newN.nutrisi_id)
    );
    if (addedNutritions.length > 0) {
      const addedDetails = addedNutritions.map(
        (n) => {
          const name = nutritions.find((nut) => nut.id === parseInt(n.nutrisi_id))?.name || "Tidak diketahui";
          return `${name} (${formatNumber(n.amount)})`
        }
      );
      messages.push(`Menambahkan nutrisi: ${addedDetails.join(", ")}`);
      hasChanges = true;
    }

    // Detect updated nutritions
    const updatedNutritions = newNutrisiList.filter((newN) =>
      oldNutrisiList.some(
        (oldN) =>
          oldN.nutrisi_id === newN.nutrisi_id &&
          parseFloat(oldN.amount) !== parseFloat(newN.amount)
      )
    );
    if (updatedNutritions.length > 0) {
      const updatedDetails = updatedNutritions.map((n) => {
        const oldN = oldNutrisiList.find((o) => o.nutrisi_id === n.nutrisi_id);
        const name = nutritions.find((nut) => nut.id === parseInt(n.nutrisi_id))?.name || "Tidak diketahui";
        return `Mengubah jumlah nutrisi "${name}" dari "${formatNumber(oldN.amount)}" menjadi "${formatNumber(n.amount)}"`;
      });
      messages.push(...updatedDetails);
      hasChanges = true;
    }

    return { hasChanges, messages };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { hasChanges, messages } = detectChanges();

    if (!hasChanges) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Tidak ada data yang diubah.",
      });
      return;
    }

    const confirmationText = messages.length > 0
      ? `Apakah Anda yakin ingin menyimpan perubahan berikut untuk pakan "${form.name}"?\n\n${messages.join("\n")}`
      : `Apakah Anda yakin ingin menyimpan perubahan untuk pakan "${form.name}"?`;

    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: confirmationText,
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
                    <small className="text-muted">
                      Jenis saat ini: {form.typeName || "Tidak diketahui"}
                    </small>
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
                        <small className="text-muted">
                          Nutrisi saat ini: {nutrisi.nutrisi_name || "Tidak diketahui"}
                        </small>
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