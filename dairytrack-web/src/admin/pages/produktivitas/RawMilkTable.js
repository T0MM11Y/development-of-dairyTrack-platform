import React, { useEffect, useState } from "react";

const RawMilkTable = ({ rawMilks, openModal }) => {
  const [updatedRawMilks, setUpdatedRawMilks] = useState([]);

  // Fungsi untuk menghitung sisa waktu
  const calculateTimeLeft = (productionTime) => {
    const productionDate = new Date(productionTime);
    const currentTime = new Date();
    const diffInMs =
      productionDate.getTime() + 8 * 60 * 60 * 1000 - currentTime.getTime(); // 8 jam dalam milidetik

    if (diffInMs <= 0) {
      return "Expired";
    }

    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Perbarui status raw milk berdasarkan waktu
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = rawMilks.map((rawMilk) => {
        const timeLeft = calculateTimeLeft(rawMilk.production_time);
        return {
          ...rawMilk,
          status: timeLeft === "Expired" ? "expired" : rawMilk.status,
          timeLeft: timeLeft,
        };
      });
      setUpdatedRawMilks(updatedData);
    }, 1000); // Perbarui setiap detik

    // Hitung waktu saat pertama kali render
    const initialData = rawMilks.map((rawMilk) => ({
      ...rawMilk,
      timeLeft: calculateTimeLeft(rawMilk.production_time),
    }));
    setUpdatedRawMilks(initialData);

    return () => clearInterval(interval); // Bersihkan interval saat komponen unmount
  }, [rawMilks]);

  return (
    <div className="col-lg-12">
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Raw Milk Data</h4>
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cow Name</th>
                  <th>Production Time</th>
                  <th>Volume (Liters)</th>
                  <th>Previous Volume</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {updatedRawMilks.map((rawMilk, index) => (
                  <tr key={rawMilk.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{rawMilk.cow?.name || "Unknown"}</td>
                    <td>{rawMilk.production_time}</td>
                    <td>{rawMilk.volume_liters}</td>
                    <td>{rawMilk.previous_volume}</td>
                    <td>
                      {rawMilk.status === "fresh" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          Fresh{" "}
                          <small style={{ color: "gray" }}>
                            ({rawMilk.timeLeft} left)
                          </small>
                        </span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          Expired
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => openModal("edit", rawMilk)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => openModal("delete", rawMilk)}
                        className="btn btn-danger"
                      >
                        <i className="ri-delete-bin-6-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMilkTable;
