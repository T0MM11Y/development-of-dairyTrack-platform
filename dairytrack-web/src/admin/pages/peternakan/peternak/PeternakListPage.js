import { useEffect, useState } from "react";
import { getCows, deleteCow } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const CowListPage = () => {
  const [cows, setCows] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await getCows();
      setCows(data);
    } catch (error) {
      console.error("Gagal mengambil data sapi:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCow(id);
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus sapi:", error.message);
      alert("Gagal menghapus sapi: " + error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Data Sapi</h2>
        <button
          onClick={() => navigate("/admin/peternakan/sapi/create")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          + Tambah Sapi
        </button>
      </div>

      {cows.length === 0 ? (
        <p className="text-gray-500">Belum ada data sapi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Nama</th>
                <th className="p-2 border">Jenis</th>
                <th className="p-2 border">Tanggal Lahir</th>
                <th className="p-2 border">Berat (kg)</th>
                <th className="p-2 border">Status Reproduksi</th>
                <th className="p-2 border">Gender</th>
                <th className="p-2 border">Tanggal Masuk</th>
                <th className="p-2 border">Status Laktasi</th>
                <th className="p-2 border">Fase Laktasi</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cows.map((cow) => (
                <tr key={cow.id}>
                  <td className="p-2 border">{cow.name}</td>
                  <td className="p-2 border">{cow.breed}</td>
                  <td className="p-2 border">{cow.birth_date}</td>
                  <td className="p-2 border">{cow.weight_kg}</td>
                  <td className="p-2 border">{cow.reproductive_status}</td>
                  <td className="p-2 border">{cow.gender}</td>
                  <td className="p-2 border">{cow.entry_date}</td>
                  <td className="p-2 border">
                    {cow.lactation_status ? "Ya" : "Tidak"}
                  </td>
                  <td className="p-2 border">{cow.lactation_phase || "-"}</td>
                  <td className="p-2 border whitespace-nowrap">
                    <button
                      onClick={() =>
                        navigate(`/admin/peternakan/sapi/edit/${cow.id}`)
                      }
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cow.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CowListPage;
