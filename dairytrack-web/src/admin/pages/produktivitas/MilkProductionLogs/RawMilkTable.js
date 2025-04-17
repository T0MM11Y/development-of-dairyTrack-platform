import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale Indonesia
import { checkRawMilkExpired } from "../../../../api/produktivitas/rawMilk";
import { getCowById } from "../../../../api/peternakan/cow";

const ITEMS_PER_PAGE = 10;

const RawMilkTable = ({ rawMilks, openModal, isLoading }) => {
  const [expirationStatus, setExpirationStatus] = useState({});
  const [cowData, setCowData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(rawMilks.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedData = rawMilks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Determine the range of pages to display
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add "First" button
    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(1)}
        >
          First
        </button>
      );
    }

    // Add "Previous" button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
      );
    }

    // Add ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <span key="start-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${
            currentPage === i ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis if needed
    if (endPage < totalPages) {
      pages.push(
        <span key="end-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    // Add "Next" button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      );
    }

    // Add "Last" button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="last"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(totalPages)}
        >
          Last
        </button>
      );
    }

    return pages;
  };

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
                {paginatedData.map((rawMilk, index) => {
                  const name = rawMilk.cow?.name || "Unknown";
                  const cow = cowData[rawMilk.cow?.id] || {};
                  const lactationPhase = cow.lactation_phase || "N/A";
                  const lactationStatus = cow.lactation_status;

                  const sessionBadge = (session) => {
                    switch (session) {
                      case 1:
                        return (
                          <span
                            className="badge bg-primary ms-2"
                            style={{ fontSize: "0.65rem" }}
                          >
                            Sesi 1
                          </span>
                        );
                      case 2:
                        return (
                          <span
                            className="badge bg-success ms-2"
                            style={{ fontSize: "0.65rem" }}
                          >
                            Sesi 2
                          </span>
                        );
                      case 3:
                        return (
                          <span
                            className="badge bg-warning ms-2"
                            style={{ fontSize: "0.65rem" }}
                          >
                            Sesi 3
                          </span>
                        );
                      default:
                        return (
                          <span
                            className="badge bg-secondary ms-2"
                            style={{ fontSize: "0.65rem" }}
                          >
                            Sesi Tidak Diketahui
                          </span>
                        );
                    }
                  };

                  return (
                    <tr key={rawMilk.id}>
                      <th scope="row">
                        <div>
                          {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                          {rawMilk.session && sessionBadge(rawMilk.session)}
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
          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div>{renderPagination()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMilkTable;
