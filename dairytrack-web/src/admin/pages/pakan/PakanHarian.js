import React, { useState } from "react";

const PakanHarian = () => {
  const [form, setForm] = useState({
    tanggal: "",
    jenisPakan: "",
    jumlah: "",
    satuan: "kg",
  });

  const [dataPakan, setDataPakan] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDataPakan([...dataPakan, form]);
    setForm({ tanggal: "", jenisPakan: "", jumlah: "", satuan: "kg" });
  };

  return (
    <div>
      <h2 className="mb-4">Pakan Harian</h2>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-3">
            <input
              type="text"
              name="jenisPakan"
              placeholder="Jenis Pakan"
              value={form.jenisPakan}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-3">
            <input
              type="number"
              name="jumlah"
              placeholder="Jumlah"
              value={form.jumlah}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-2">
            <select
              name="satuan"
              value={form.satuan}
              onChange={handleChange}
              className="form-control"
            >
              <option value="kg">Kg</option>
              <option value="gram">Gram</option>
              <option value="liter">Liter</option>
            </select>
          </div>

          <div className="col-md-1">
            <button type="submit" className="btn btn-primary w-100">
              +
            </button>
          </div>
        </div>
      </form>

      {/* Tabel Data */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Jenis Pakan</th>
              <th>Jumlah</th>
              <th>Satuan</th>
            </tr>
          </thead>
          <tbody>
            {dataPakan.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Belum ada data.
                </td>
              </tr>
            ) : (
              dataPakan.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.tanggal}</td>
                  <td>{item.jenisPakan}</td>
                  <td>{item.jumlah}</td>
                  <td>{item.satuan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PakanHarian;
