import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale Indonesia
import { checkRawMilkExpired } from "../../../../api/produktivitas/rawMilk";
import { getCowById } from "../../../../api/peternakan/cow";

const formatTimeRemaining = (timeRemaining) => {
  if (!timeRemaining) return "Expired";

  const [hours, minutes, seconds] = timeRemaining.split(":").map(Number);

  if (hours > 0) return `${hours} jam lagi`;
  if (minutes > 0) return `${minutes} menit lagi`;
  return `${seconds} detik lagi`;
};

const RawMilkTable = ({ rawMilks, openModal, isLoading }) => {
  const [expirationStatus, setExpirationStatus] = useState({});
  const [cowData, setCowData] = useState({}); // State to store cow data

  useEffect(() => {
    const fetchExpirationStatus = async () => {
      const statusData = {};
      for (const rawMilk of rawMilks) {
        try {
          const result = await checkRawMilkExpired(rawMilk.id);
          statusData[rawMilk.id] = {
            isExpired: result.is_expired,
            timeRemaining: result.time_remaining,
          };
        } catch (error) {
          console.error(
            `Failed to fetch expiration status for ID ${rawMilk.id}:`,
            error.message
          );
        }
      }
      setExpirationStatus(statusData);
    };

    const fetchCowData = async () => {
      const cowDataMap = {};
      for (const rawMilk of rawMilks) {
        if (rawMilk.cow?.id) {
          try {
            const cow = await getCowById(rawMilk.cow.id);
            cowDataMap[rawMilk.cow.id] = cow;
          } catch (error) {
            console.error(
              `Failed to fetch cow data for ID ${rawMilk.cow.id}:`,
              error.message
            );
          }
        }
      }
      setCowData(cowDataMap);
    };

    if (rawMilks.length > 0) {
      fetchExpirationStatus();
      fetchCowData();
    }
  }, [rawMilks]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading raw milk data...</p>
      </div>
    );
  }

  if (rawMilks.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No raw milk data available</p>
      </div>
    );
  }
  return (
    <div className="col-lg-12">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table">
                <tr>
                  <th>#</th>
                  <th>Cow Name</th>
                  <th>Production Time</th>
                  <th>Volume (Liters)</th>
                  <th>Lactation Phase</th>
                  <th>Lactation Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rawMilks.map((rawMilk, index) => {
                  const name = rawMilk.cow?.name || "Unknown";
                  const cow = cowData[rawMilk.cow?.id] || {};
                  const lactationPhase = cow.lactation_phase || "N/A";
                  const lactationStatus = cow.lactation_status;

                  return (
                    <tr key={rawMilk.id}>
                      <th scope="row">
                        <div>
                          {index + 1}
                          {rawMilk.session && (
                            <span
                              className="badge bg-primary ms-2"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Sesi {rawMilk.session}
                            </span>
                          )}
                        </div>
                      </th>
                      <td>{name}</td>
                      <td>
                        {rawMilk.production_time
                          ? format(
                              new Date(rawMilk.production_time),
                              "dd MMMM yyyy, HH:mm:ss",
                              { locale: id }
                            )
                          : "N/A"}
                      </td>
                      <td>
                        {rawMilk.volume_liters || 0} L
                        <br />
                        <small
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          ({(rawMilk.volume_liters || 0) * 1000} mL)
                        </small>
                      </td>
                      <td>{lactationPhase}</td>
                      <td>
                        {lactationStatus ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => openModal("edit", rawMilk.id)}
                          aria-label="Edit"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => openModal("delete", rawMilk.id)}
                          className="btn btn-danger btn-sm"
                          aria-label="Delete"
                        >
                          <i className="ri-delete-bin-6-line"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMilkTable;
