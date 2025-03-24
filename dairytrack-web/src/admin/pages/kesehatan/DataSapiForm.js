import React, { useEffect, useState } from "react";
import * as API from "../../services/cowService";
import { useNavigate } from "react-router-dom";

const DataSapiList = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await API.getAll();
    setItems(data);
  };

  const handleDelete = async (id) => {
    await API.remove(id);
    fetchData();
  };

  return (
    <div>
      <h2>Data Sapi</h2>
      <button onClick={() => navigate("/admin/kesehatan/sapi/tambah")}>+ Tambah Sapi</button>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Ras</th>
            <th>Jenis Kelamin</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.breed}</td>
              <td>{item.gender}</td>
              <td>
                <button onClick={() => navigate(`/admin/kesehatan/sapi/edit/${item.id}`)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataSapiList;
