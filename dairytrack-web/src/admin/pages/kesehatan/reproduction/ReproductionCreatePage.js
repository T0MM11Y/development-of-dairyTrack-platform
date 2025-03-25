import { useState } from "react";
import { createReproduction } from "../../../../api/kesehatan/reproduction";
import { useNavigate } from "react-router-dom";

const ReproductionCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cow: 1, // ID sapi
    birth_interval: "",
    service_period: "",
    conception_rate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createReproduction(form);
    navigate("/admin/kesehatan/reproduksi");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Reproduksi</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto">
          <tbody>
            {Object.entries(form).map(([key, value]) => (
              <tr key={key}>
                <td className="p-2 capitalize">{key.replaceAll("_", " ")}</td>
                <td className="p-2">
                  <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    className="border px-2 py-1 w-full"
                    required
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="p-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Simpan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default ReproductionCreatePage;
