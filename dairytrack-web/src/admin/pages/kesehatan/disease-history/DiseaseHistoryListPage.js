import { useEffect, useState } from "react";
import { getCows } from "../../../../api/kesehatan/cow";
import { getDiseaseHistories, deleteDiseaseHistory } from "../../../../api/kesehatan/diseaseHistory";
import { Link } from "react-router-dom";

const DiseaseHistoryListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);

  const fetchData = async () => {
    const cowList = await getCows();
    const historyList = await getDiseaseHistories();
    setCows(cowList);
    setData(historyList);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      await deleteDiseaseHistory(id);
      fetchData();
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
        <h2 className="text-xl font-bold">Riwayat Penyakit</h2>
        <Link
          to="/admin/kesehatan/riwayat/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Tambah
        </Link>
      </div>

      <table className="table-auto w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Tanggal</th>
            <th className="border px-2 py-1">Nama Penyakit</th>
            <th className="border px-2 py-1">Keterangan</th>
            <th className="border px-2 py-1">Sapi</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id} className="text-center">
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{item.disease_date}</td>
              <td className="border px-2 py-1">{item.disease_name}</td>
              <td className="border px-2 py-1">{item.description}</td>
              <td className="border px-2 py-1">{getCowName(item.cow)}</td>
              <td className="border px-2 py-1 space-x-2">
                <Link
                  to={`/admin/kesehatan/riwayat/edit/${item.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiseaseHistoryListPage;
