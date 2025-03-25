import { useEffect, useState } from "react";
import { deleteReproduction, getReproductions } from "../../../../api/kesehatan/reproduction";
import { Link } from "react-router-dom";

const ReproductionListPage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await getReproductions();
    setData(res);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      await deleteReproduction(id);
      fetchData();
    }
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
          className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded shadow"
        >
          + Tambah
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500">Belum ada data.</p>
      ) : (
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
                <td className="border px-2 py-1">{item.cow}</td>
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
      )}
    </div>
  );
};

export default ReproductionListPage;
