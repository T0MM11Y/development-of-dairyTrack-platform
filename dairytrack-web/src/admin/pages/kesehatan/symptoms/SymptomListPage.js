import { useEffect, useState } from "react";
import { deleteSymptom, getSymptoms } from "../../../../api/kesehatan/symptom";
import { Link } from "react-router-dom";

const SymptomListPage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await getSymptoms();
    setData(res);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      await deleteSymptom(id);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Data Gejala Sapi</h2>
        <Link
          to="/admin/kesehatan/gejala/create"
          className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded"
        >
          + Tambah
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500">Belum ada data gejala.</p>
      ) : (
        <div className="overflow-auto">
          <table className="table-auto w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Eye</th>
                <th className="border px-2 py-1">Mouth</th>
                <th className="border px-2 py-1">Nose</th>
                <th className="border px-2 py-1">Anus</th>
                <th className="border px-2 py-1">Leg</th>
                <th className="border px-2 py-1">Skin</th>
                <th className="border px-2 py-1">Behavior</th>
                <th className="border px-2 py-1">Weight</th>
                <th className="border px-2 py-1">Temperature</th>
                <th className="border px-2 py-1">Reproductive</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id} className="text-center">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{item.eye_condition}</td>
                  <td className="border px-2 py-1">{item.mouth_condition}</td>
                  <td className="border px-2 py-1">{item.nose_condition}</td>
                  <td className="border px-2 py-1">{item.anus_condition}</td>
                  <td className="border px-2 py-1">{item.leg_condition}</td>
                  <td className="border px-2 py-1">{item.skin_condition}</td>
                  <td className="border px-2 py-1">{item.behavior}</td>
                  <td className="border px-2 py-1">{item.weight_condition}</td>
                  <td className="border px-2 py-1">{item.body_temperature}</td>
                  <td className="border px-2 py-1">{item.reproductive_condition}</td>
                  <td className="border px-2 py-1">{item.treatment_status}</td>
                  <td className="border px-2 py-1 space-x-2">
                    <Link
                      to={`/admin/kesehatan/gejala/edit/${item.id}`}
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

export default SymptomListPage;
