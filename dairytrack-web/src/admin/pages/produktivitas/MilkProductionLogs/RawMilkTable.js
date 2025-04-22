import React, { useEffect, useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { checkRawMilkExpired } from "../../../../api/produktivitas/rawMilk";
import { getCowById } from "../../../../api/peternakan/cow";

const ITEMS_PER_PAGE = 10;

const RawMilkTable = ({ rawMilks, openModal, isLoading }) => {
  const [expirationStatus, setExpirationStatus] = useState({});
  const [cowData, setCowData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized calculations
  const totalPages = useMemo(
    () => Math.ceil(rawMilks.length / ITEMS_PER_PAGE),
    [rawMilks.length]
  );

  const paginatedData = useMemo(() => {
    return [...rawMilks]
      .sort((a, b) => new Date(b.production_time) - new Date(a.production_time))
      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [rawMilks, currentPage]);

  // Session badge component
  const SessionBadge = useCallback(({ session }) => {
    const badgeConfig = {
      1: { text: "Sesi 1", color: "primary" },
      2: { text: "Sesi 2", color: "success" },
      3: { text: "Sesi 3", color: "warning" },
      default: { text: "Sesi Tidak Diketahui", color: "secondary" },
    };

    const { text, color } = badgeConfig[session] || badgeConfig.default;

    return (
      <span
        className={`badge bg-${color} ms-2`}
        style={{ fontSize: "0.65rem" }}
      >
        {text}
      </span>
    );
  }, []);

  // Fetch expiration status and cow data
  useEffect(() => {
    if (!rawMilks.length) return;

    const fetchData = async () => {
      try {
        // Fetch expiration status
        const statusPromises = rawMilks.map(async (rawMilk) => {
          const result = await checkRawMilkExpired(rawMilk.id);
          return {
            id: rawMilk.id,
            isExpired: result.is_expired,
            timeRemaining: result.time_remaining,
          };
        });

        // Fetch cow data
        const uniqueCowIds = [
          ...new Set(rawMilks.map((milk) => milk.cow?.id).filter(Boolean)),
        ];
        const cowPromises = uniqueCowIds.map(async (id) => {
          const cow = await getCowById(id);
          return { id, cow };
        });

        const [statusResults, cowResults] = await Promise.all([
          Promise.all(statusPromises),
          Promise.all(cowPromises),
        ]);

        setExpirationStatus(
          statusResults.reduce(
            (acc, item) => ({
              ...acc,
              [item.id]: {
                isExpired: item.isExpired,
                timeRemaining: item.timeRemaining,
              },
            }),
            {}
          )
        );

        setCowData(
          cowResults.reduce(
            (acc, item) => ({
              ...acc,
              [item.id]: item.cow,
            }),
            {}
          )
        );
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
      }
    };

    fetchData();
  }, [rawMilks]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const renderPagination = useCallback(() => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];

    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(1)}
        >
          First
        </button>,
        <button
          key="prev"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <span key="start-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

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

    if (endPage < totalPages) {
      pages.push(
        <span key="end-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>,
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
  }, [currentPage, totalPages, handlePageChange]);

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
                  const cow = cowData[rawMilk.cow?.id] || {};
                  const lactationPhase = cow.lactation_phase || "N/A";
                  const volumeInMl = (rawMilk.volume_liters || 0) * 1000;

                  return (
                    <tr key={rawMilk.id}>
                      <th scope="row">
                        <div>
                          {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                          {rawMilk.session && (
                            <SessionBadge session={rawMilk.session} />
                          )}
                        </div>
                      </th>
                      <td>{rawMilk.cow?.name || "Unknown"}</td>
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
                          ({volumeInMl} mL)
                        </small>
                      </td>
                      <td>{lactationPhase}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            cow.lactation_status ? "success" : "secondary"
                          }`}
                        >
                          {cow.lactation_status ? "Active" : "Inactive"}
                        </span>
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

export default React.memo(RawMilkTable);
