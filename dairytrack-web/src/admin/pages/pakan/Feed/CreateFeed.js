import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createFeed } from "../../../../api/pakan/feed";
import { getFeedTypes } from "../../../../api/pakan/feedType";

const CreateFeedPage = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [typeId, setTypeId] = useState("");
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [energy, setEnergy] = useState("");
  const [fiber, setFiber] = useState("");
  const [minStock, setMinStock] = useState(""); // Field minimum stock
  const [price, setPrice] = useState(""); // Field price
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ambil daftar jenis pakan untuk dropdown
  useEffect(() => {
    const fetchFeedTypes = async () => {
      try {
        const response = await getFeedTypes();
        if (response.success && response.feedTypes) {
          setFeedTypes(response.feedTypes);
        }
      } catch (error) {
        console.error("Error fetching feed types:", error.message);
      }
    };

    fetchFeedTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Konfirmasi sebelum menambah data
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan menambahkan pakan baru.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, tambahkan!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await createFeed({
        typeId,
        name,
        protein,
        energy,
        fiber,
        min_stock: minStock, // sesuaikan dengan field di API
        price,
      });
      console.log("Response create feed:", response);

      Swal.fire({
        title: "Sukses!",
        text: "Pakan berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/pakan");
      });
    } catch (error) {
      console.error("Error creating feed:", error.message);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menambahkan pakan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Pakan</h2>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Jenis Pakan */}
            <div className="form-group mb-3">
              <label htmlFor="feedType" className="form-label">
                Jenis Pakan
              </label>
              <select
                id="feedType"
                className="form-control"
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                required
              >
                <option value="">Pilih Jenis Pakan</option>
                {feedTypes.map((feedType) => (
                  <option key={feedType.id} value={feedType.id}>
                    {feedType.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Nama Pakan */}
            <div className="form-group mb-3">
              <label htmlFor="feedName" className="form-label">
                Nama Pakan
              </label>
              <input
                type="text"
                id="feedName"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {/* Protein */}
            <div className="form-group mb-3">
              <label htmlFor="protein" className="form-label">
                Protein
              </label>
              <input
                type="number"
                id="protein"
                className="form-control"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>
            {/* Energy */}
            <div className="form-group mb-3">
              <label htmlFor="energy" className="form-label">
                Energy
              </label>
              <input
                type="number"
                id="energy"
                className="form-control"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                required
              />
            </div>
            {/* Fiber */}
            <div className="form-group mb-3">
              <label htmlFor="fiber" className="form-label">
                Fiber
              </label>
              <input
                type="number"
                id="fiber"
                className="form-control"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                required
              />
            </div>
            {/* Minimum Stock */}
            <div className="form-group mb-3">
              <label htmlFor="minStock" className="form-label">
                Minimum Stock
              </label>
              <input
                type="number"
                id="minStock"
                className="form-control"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                required
              />
            </div>
            {/* Price */}
            <div className="form-group mb-3">
              <label htmlFor="price" className="form-label">
                Price
              </label>
              <div className="input-group">
                <span className="input-group-text">Rp</span>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Tambah"}
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => navigate("/admin/pakan")}
            >
              Batal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedPage;
