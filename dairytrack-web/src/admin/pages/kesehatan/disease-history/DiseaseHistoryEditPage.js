import { useEffect, useState } from "react";
import { getDiseaseHistoryById, updateDiseaseHistory } from "../../../../api/kesehatan/diseaseHistory";
import { useNavigate, useParams } from "react-router-dom";

const DiseaseHistoryEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await getDiseaseHistoryById(id);
      setForm(res);
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateDiseaseHistory(id, form);
    navigate("/admin/kesehatan/riwayat");
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Edit Riwayat Penyakit</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto">
          <tbody>
            {Object.entries(form).map(([key, value]) => {
              if (key === "id" || key === "cow") return null;
              return (
                <tr key={key}>
                  <td className="p-2 capitalize">{key.replaceAll("_", " ")}</td>
                  <td className="p-2">
                    <input
                      type={key === "disease_date" ? "date" : "text"}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="2" className="p-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default DiseaseHistoryEditPage;
