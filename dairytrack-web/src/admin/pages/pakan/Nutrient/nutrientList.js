import { useEffect, useState } from "react";
import { getNutritions, deleteNutrition } from "../../../../api/pakan/nutrient";
import Swal from "sweetalert2";
import CreateNutritionPage from "./createNutrition";
import EditNutritionPage from "./editNutrition";

const NutritionListPage = () => {
  const [nutritions, setNutritions] = useState([]);
  const [filteredNutritions, setFilteredNutritions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNutritionId, setSelectedNutritionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getNutritions();
      if (response.success && response.nutrisi) {
        setNutritions(response.nutrisi);
        setFilteredNutritions(response.nutrisi);
      } else {
        setNutritions([]);
        setFilteredNutritions([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data nutrisi:", error.message);
      setNutritions([]);
      setFilteredNutritions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = nutritions.filter((nutrition) =>
      nutrition.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNutritions(filtered);
  }, [searchTerm, nutritions]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus nutrisi "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteNutrition(id);
      if (response.success || response === true) {
        Swal.fire({
          title: "Berhasil!",
          text: "Nutrisi berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } else {
        throw new Error(response.message || "Gagal menghapus nutrisi.");
      }
    } catch (error) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan saat menghapus nutrisi.", "error");
    }
  };

  const handleAddNutrition = () => {
    setShowCreateModal(false);
    fetchData();
  };

  const handleViewDetail = (id) => {
    setSelectedNutritionId(id);
    setShowDetailModal(true);
  };

  const handleDetailClose = () => {
    setShowDetailModal(false);
    setSelectedNutritionId(null);
    fetchData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Data Nutrisi</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info waves-effect waves-light"
        >
          + Tambah Nutrisi
        </button>
      </div>

      <div className="mb-3" style={{ maxWidth: "250px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Cari nama nutrisi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading data nutrisi...</p>
        </div>
      ) : filteredNutritions.length === 0 ? (
        <p className="text-gray-500">Tidak ada data nutrisi ditemukan.</p>
      ) : (
        <div className="card">
          <div className="card-body table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Satuan</th>
                  <th>Dibuat</th>
                  <th>Diperbarui</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredNutritions.map((nutrition, index) => (
                  <tr key={nutrition.id}>
                    <td>{index + 1}</td>
                    <td>{nutrition.name}</td>
                    <td>{nutrition.unit}</td>
                    <td>{formatDate(nutrition.createdAt)}</td>
                    <td>{formatDate(nutrition.updatedAt)}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleViewDetail(nutrition.id)}
                        aria-label={`Edit ${nutrition.name}`}
                        style={{ borderRadius: "6px" }}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(nutrition.id, nutrition.name)}
                        className="btn btn-danger btn-sm"
                        aria-label={`Hapus ${nutrition.name}`}
                      >
                        <i className="ri-delete-bin-6-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateNutritionPage
          onNutritionAdded={handleAddNutrition}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showDetailModal && (
        <EditNutritionPage
          id={selectedNutritionId}
          onClose={handleDetailClose}
        />
      )}
    </div>
  );
};

export default NutritionListPage;