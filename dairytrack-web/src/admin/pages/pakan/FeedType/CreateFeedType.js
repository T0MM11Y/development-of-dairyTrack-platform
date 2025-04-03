import React, { useState } from "react";
import Swal from "sweetalert2";
import { createFeedType } from "../../../../api/pakan/feedType";
import { useNavigate } from "react-router-dom";

const CreateFeedTypeModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook untuk navigasi

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input, pastikan nama feed type tidak kosong
    if (!name) {
      Swal.fire({
        title: "Error!",
        text: "Nama jenis pakan harus diisi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Tanyakan konfirmasi dari pengguna sebelum membuat jenis pakan
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

    if (!result.isConfirmed) return; // Jika batal, keluar dari fungsi

    setLoading(true); // Aktifkan loading
    try {
      const response = await createFeedType({ name }); // Kirim request untuk membuat feed type baru

      // Log response API untuk memastikan respons yang diterima
      console.log("API Response:", response);

      // Pastikan respons adalah sukses dan cek apakah ada properti 'success' dalam response
      if (response && response.success === true) {
        // Tampilkan konfirmasi sukses terlebih dahulu
        const successResult = await Swal.fire({
          title: "Sukses!",
          text: "Jenis pakan berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
        });

        if (successResult.isConfirmed) {
          console.log("Navigating to feed type data page...");
          navigate("/admin/pakan/jenis"); // Halaman feed type data
          onSuccess(); // Callback untuk menyegarkan data atau aksi lain setelah sukses
          onClose(); // Tutup modal setelah sukses
        }
      } else {
        // Jika API merespons kesalahan atau tidak berhasil
        const errorMessage = response.message || "Terjadi kesalahan saat menambahkan jenis pakan.";
        console.error("API Error:", errorMessage); // Debugging error response
        await Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error creating feed type:", error.message);
      // Jika gagal, tampilkan konfirmasi error
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menambahkan jenis pakan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false); // Matikan loading setelah proses selesai
    }
  };

  const handleCloseModal = () => {
    navigate("/admin/pakan/jenis"); // Tutup modal dan kembali ke halaman feed type data
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Jenis Pakan</h4>
            <button
              className="btn-close"
              onClick={handleCloseModal} // Panggil handleCloseModal saat tombol X di-klik
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="feedTypeName" className="form-label">Nama Jenis Pakan</label>
                <input
                  type="text"
                  id="feedTypeName"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-info w-100" disabled={loading}>
                {loading ? "Menyimpan..." : "Tambah"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedTypeModal;
