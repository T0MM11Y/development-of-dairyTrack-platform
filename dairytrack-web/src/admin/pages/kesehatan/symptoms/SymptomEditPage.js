import { useEffect, useState } from "react";
import { getSymptomById, updateSymptom } from "../../../../api/kesehatan/symptom";
import { useNavigate, useParams } from "react-router-dom";

const SymptomEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSymptomById(id);
        setForm(res);
      } catch (err) {
        console.error("Error fetching symptom:", err);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSymptom(id, form);
      navigate("/admin/kesehatan/gejala");
    } catch (err) {
      console.error("Error updating symptom:", err);
      alert("Gagal memperbarui data!");
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Edit Data Gejala</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto w-full max-w-2xl">
          <tbody>
            {Object.entries(form).map(([key, value]) => {
              if (key === "id" || key === "health_check") return null;
              return (
                <tr key={key}>
                  <td className="p-2 font-semibold capitalize">{key.replace(/_/g, " ")}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      name={key}
                      value={value || ""}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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

export default SymptomEditPage;
