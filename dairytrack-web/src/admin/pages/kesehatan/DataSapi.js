import React, { useEffect, useState } from "react";
import { getCows, createCow, updateCow, deleteCow } from "../../services/cowService";

const DataSapi = () => {
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    birth_date: "",
    lactation_status: false,
    lactation_phase: "",
    weight_kg: "",
    reproductive_status: "",
    gender: "",
    entry_date: "",
  });

  const [editForm, setEditForm] = useState(null); // State untuk modal edit

  useEffect(() => {
    fetchCows();
  }, []);

  const fetchCows = async () => {
    try {
      const data = await getCows();
      setCows(data);
    } catch (error) {
      console.error("Error fetching cows:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...form,
        weight_kg: parseFloat(form.weight_kg),
      };
      await createCow(formattedData);
      fetchCows();
      setForm({
        name: "",
        breed: "",
        birth_date: "",
        lactation_status: false,
        lactation_phase: "",
        weight_kg: "",
        reproductive_status: "",
        gender: "",
        entry_date: "",
      });
    } catch (error) {
      console.error("Error creating cow:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCow(id);
      fetchCows();
    } catch (error) {
      console.error("Error deleting cow:", error);
    }
  };

  const handleEdit = (cow) => {
    setEditForm({ ...cow });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...editForm,
        weight_kg: parseFloat(editForm.weight_kg),
      };
      await updateCow(editForm.id, formattedData);
      fetchCows();
      setEditForm(null); // Tutup modal edit setelah update
    } catch (error) {
      console.error("Error updating cow:", error);
    }
  };

  return (
    <div>
      <h2>Data Sapi</h2>

      {/* Form Tambah Data */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input type="text" name="name" placeholder="Nama" value={form.name} onChange={handleChange} required />
        <input type="text" name="breed" placeholder="Ras" value={form.breed} onChange={handleChange} required />
        <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} required />

        <label>
          <input type="checkbox" name="lactation_status" checked={form.lactation_status} onChange={handleChange} />
          Status Laktasi
        </label>

        <input type="text" name="lactation_phase" placeholder="Fase Laktasi" value={form.lactation_phase} onChange={handleChange} />
        <input type="number" name="weight_kg" placeholder="Berat (kg)" value={form.weight_kg} onChange={handleChange} required />
        <input type="text" name="reproductive_status" placeholder="Status Reproduksi" value={form.reproductive_status} onChange={handleChange} required />
        <input type="text" name="gender" placeholder="Jenis Kelamin" value={form.gender} onChange={handleChange} required />
        <input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} required />

        <button type="submit">Tambah</button>
      </form>

      {/* Tabel Data Sapi */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Ras</th>
            <th>Jenis Kelamin</th>
            <th>Status Reproduksi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {cows.map((cow) => (
            <tr key={cow.id}>
              <td>{cow.name}</td>
              <td>{cow.breed}</td>
              <td>{cow.gender}</td>
              <td>{cow.reproductive_status}</td>
              <td>
                <button onClick={() => handleEdit(cow)}>✏ Edit</button>
                <button onClick={() => handleDelete(cow.id)}>🗑 Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Edit Data */}
      {editForm && (
        <div className="modal">
          <h3>Edit Data Sapi</h3>
          <form onSubmit={handleEditSubmit}>
            <input type="text" name="name" placeholder="Nama" value={editForm.name} onChange={handleEditChange} required />
            <input type="text" name="breed" placeholder="Ras" value={editForm.breed} onChange={handleEditChange} required />
            <input type="date" name="birth_date" value={editForm.birth_date} onChange={handleEditChange} required />

            <label>
              <input type="checkbox" name="lactation_status" checked={editForm.lactation_status} onChange={handleEditChange} />
              Status Laktasi
            </label>

            <input type="text" name="lactation_phase" placeholder="Fase Laktasi" value={editForm.lactation_phase} onChange={handleEditChange} />
            <input type="number" name="weight_kg" placeholder="Berat (kg)" value={editForm.weight_kg} onChange={handleEditChange} required />
            <input type="text" name="reproductive_status" placeholder="Status Reproduksi" value={editForm.reproductive_status} onChange={handleEditChange} required />
            <input type="text" name="gender" placeholder="Jenis Kelamin" value={editForm.gender} onChange={handleEditChange} required />
            <input type="date" name="entry_date" value={editForm.entry_date} onChange={handleEditChange} required />

            <button type="submit">Simpan</button>
            <button type="button" onClick={() => setEditForm(null)}>Batal</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DataSapi;
