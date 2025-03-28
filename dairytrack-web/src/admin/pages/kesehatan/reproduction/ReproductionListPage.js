import { useEffect, useState } from "react";
import { deleteReproduction, getReproductions } from "../../../../api/kesehatan/reproduction";
import { getCows } from "../../../../api/peternakan/cow";
import { Link } from "react-router-dom";

const ReproductionListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await getReproductions();
      const cowList = await getCows();
      setData(res);
      setCows(cowList);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        await deleteReproduction(id);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus data: " + err.message);
      }
    }
  };

  const getCowName = (id) => {
    const cow = cows.find((c) => c.id === id);
    return cow ? cow.name : "Tidak diketahui";
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Data Reproduksi Sapi</h2>
        <Link
          to="/admin/kesehatan/reproduksi/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          + Tambah
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {data.length === 0 && !error ? (
        <p className="text-gray-500">Belum ada data reproduksi.</p>
      ) : (
        <div className="overflow-auto">
          <table className="table-auto w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Sapi</th>
                <th className="border px-2 py-1">Interval Kelahiran</th>
                <th className="border px-2 py-1">Masa Layanan</th>
                <th className="border px-2 py-1">Tingkat Konsepsi</th>
                <th className="border px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id} className="text-center">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{getCowName(item.cow)}</td>
                  <td className="border px-2 py-1">{item.birth_interval} hari</td>
                  <td className="border px-2 py-1">{item.service_period} hari</td>
                  <td className="border px-2 py-1">{item.conception_rate} %</td>
                  <td className="border px-2 py-1 space-x-2">
                    <Link
                      to={`/admin/kesehatan/reproduksi/edit/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
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

export default ReproductionListPage;
