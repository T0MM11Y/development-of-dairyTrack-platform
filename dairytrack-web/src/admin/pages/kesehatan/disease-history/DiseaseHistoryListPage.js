import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCows } from "../../../../api/peternakan/cow";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getSymptoms } from "../../../../api/kesehatan/symptom";
import {
  getDiseaseHistories,
  deleteDiseaseHistory,
} from "../../../../api/kesehatan/diseaseHistory";

const DiseaseHistoryListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [checks, setChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [cowList, historyList, checkList, symptomList] = await Promise.all([
        getCows(),
        getDiseaseHistories(),
        getHealthChecks(),
        getSymptoms(),
      ]);
      setCows(cowList);
      setData(historyList);
      setChecks(checkList);
      setSymptoms(symptomList);
      setError("");
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
      setError("Gagal memuat data. Pastikan server API berjalan.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        await deleteDiseaseHistory(id);
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

  const getCheckDate = (id) => {
    const check = checks.find((c) => c.id === id);
    return check ? check.checkup_date : "-";
  };

  const getSymptomSummary = (id) => {
    const symptom = symptoms.find((s) => s.id === id);
    if (!symptom) return "-";
  
    const excludeNormal = (value) =>
      value && typeof value === "string" && value.toLowerCase() !== "normal";
  
    // Ambil semua field symptom kecuali id dan health_check
    const fields = Object.entries(symptom).filter(
      ([key, value]) =>
        key !== "id" &&
        key !== "health_check" &&
        key !== "treatment_status" &&
        excludeNormal(value)
    );
  
    if (fields.length === 0) return "Semua kondisi normal";
  
    return fields
      .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
      .join(", ");
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

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {data.length === 0 && !error ? (
        <p className="text-gray-500">Belum ada data riwayat penyakit.</p>
      ) : (
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Tanggal</th>
              <th className="border px-2 py-1">Nama Penyakit</th>
              <th className="border px-2 py-1">Keterangan</th>
              <th className="border px-2 py-1">Sapi</th>
              <th className="border px-2 py-1">Pemeriksaan</th>
              <th className="border px-2 py-1">Gejala</th>
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
                <td className="border px-2 py-1">{getCheckDate(item.health_check)}</td>
                <td className="border px-2 py-1">{getSymptomSummary(item.symptom)}</td>
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
      )}
    </div>
  );
};

export default DiseaseHistoryListPage;
