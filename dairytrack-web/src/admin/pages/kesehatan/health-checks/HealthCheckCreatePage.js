import { useState } from "react";
import { createHealthCheck } from "../../../../api/kesehatan/healthCheck";
import { useNavigate } from "react-router-dom";

const HealthCheckCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cow: 1, // sesuaikan ID sapi di database
    checkup_date: "",
    rectal_temperature: "",
    heart_rate: "",
    respiration_rate: "",
    rumination: "",
    treatment_status: "Not Treated",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createHealthCheck(form);
    navigate("/admin/kesehatan/pemeriksaan");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Pemeriksaan</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto">
          <tbody>
            {Object.entries(form).map(([key, value]) => (
              <tr key={key}>
                <td className="p-2 capitalize">{key.replaceAll("_", " ")}</td>
                <td className="p-2">
                  <input
                    type={key.includes("date") ? "datetime-local" : "text"}
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

export default HealthCheckCreatePage;
