import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const RawMilkTable = ({ rawMilks, openModal, loading }) => {
  const [updatedRawMilks, setUpdatedRawMilks] = useState([]);

  useEffect(() => {
    const calculateTimeLeft = (expirationTime) => {
      const now = new Date();
      const expiration = new Date(expirationTime);
      const diff = expiration - now;

      if (diff <= 0) return "Expired";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    const interval = setInterval(() => {
      const updated = rawMilks.map((rawMilk) => ({
        ...rawMilk,
        timeLeft: calculateTimeLeft(rawMilk.expiration_time),
      }));
      setUpdatedRawMilks(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [rawMilks]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading raw milk data...</p>
      </div>
    );
  }

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
                  <th>Session</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {updatedRawMilks.map((rawMilk, index) => (
                  <tr key={rawMilk.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{rawMilk.cow?.name || "Unknown"}</td>
                    <td>{format(new Date(rawMilk.production_time), "PPpp")}</td>
                    <td>
                      {rawMilk.volume_liters} L
                      <br />
                      <small style={{ fontSize: "10px", color: "gray" }}>
                        ({rawMilk.volume_liters * 1000} mL)
                      </small>
                    </td>
                    <td>
                      {rawMilk.previous_volume} L
                      <br />
                      <small style={{ fontSize: "10px", color: "gray" }}>
                        ({rawMilk.previous_volume * 1000} mL)
                      </small>
                    </td>
                    <td>{rawMilk.session || "Unknown"}</td>
                    <td>
                      {rawMilk.status === "fresh" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          Fresh
                          <br />
                          <small style={{ fontSize: "10px", color: "gray" }}>
                            {rawMilk.timeLeft}
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
