import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createFeedType } from "../../../../api/pakan/feedType";

const CreateFeedTypePage = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tampilkan konfirmasi sebelum menambah
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan menambahkan jenis pakan baru.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, tambahkan!",
      cancelButtonText: "Batal",
    });

    // Jika user batal, hentikan proses
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await createFeedType({ name });
      console.log("Response dari createFeedType:", response);

      // Tampilkan alert sukses
      Swal.fire({
        title: "Sukses!",
        text: "Jenis pakan berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/admin/pakan/jenis");
      });

    } catch (error) {
      console.error("Error creating feed type:", error.message);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menambahkan jenis pakan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create Feed Type</h2>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="feedName" className="form-label">Feed Type Name</label>
              <input
                type="text"
                id="feedName"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => navigate("/admin/pakan/jenis")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedTypePage;
