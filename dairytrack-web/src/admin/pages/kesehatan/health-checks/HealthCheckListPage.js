import { useEffect, useState } from "react";
import { deleteHealthCheck, getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { Link } from "react-router-dom";

const HealthCheckListPage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await getHealthChecks();
    setData(res);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      await deleteHealthCheck(id);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Data Pemeriksaan Kesehatan</h2>
        <Link
          to="/admin/kesehatan/pemeriksaan/create"
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
              <th className="border px-2 py-1">Tanggal</th>
              <th className="border px-2 py-1">Suhu</th>
              <th className="border px-2 py-1">Jantung</th>
              <th className="border px-2 py-1">Napas</th>
              <th className="border px-2 py-1">Ruminasi</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id} className="text-center">
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{item.checkup_date}</td>
                <td className="border px-2 py-1">{item.rectal_temperature}°C</td>
                <td className="border px-2 py-1">{item.heart_rate}</td>
                <td className="border px-2 py-1">{item.respiration_rate}</td>
                <td className="border px-2 py-1">{item.rumination}</td>
                <td className="border px-2 py-1">{item.treatment_status}</td>
                <td className="border px-2 py-1 space-x-2">
                  <Link
                    to={`/admin/kesehatan/pemeriksaan/edit/${item.id}`}
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

export default HealthCheckListPage;
