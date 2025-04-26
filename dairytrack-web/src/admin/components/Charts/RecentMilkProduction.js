import React, { useState, useEffect, useMemo } from "react";
import { getCowRawMilkData } from "../../../api/produktivitas/rawMilk";

const RecentMilkCard = () => {
  const [milkData, setMilkData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  useEffect(() => {
    const fetchMilkData = async () => {
      try {
        const data = await getCowRawMilkData();
        console.log("Milk Data:", data);
        setMilkData(data);
      } catch (error) {
        console.error("Failed to fetch milk data:", error.message);
      }
    };

    fetchMilkData();
  }, []);

  const currentData = useMemo(() => {
    return milkData.slice(indexOfFirstItem, indexOfLastItem);
  }, [milkData, indexOfFirstItem, indexOfLastItem]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const totalPages = Math.ceil(milkData.length / itemsPerPage);
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(currentPage - 1)}
        >
          Previous
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${
            currentPage === i ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => paginate(i)}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="btn btn-sm btn-outline-primary mx-1"
          onClick={() => paginate(currentPage + 1)}
        >
          Next
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Recent Milk Production</h4>
        <div className="table-responsive">
          <table className="table table-centered mb-0 align-middle table-hover table-nowrap">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Cow Name</th>
                <th>Production Time</th>
                <th>Volume (Liters)</th>
                <th>Lactation Phase</th>
                <th>Lactation Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((entry, index) => (
                <tr key={index}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{entry?.name || "Unknown"}</td>
                  <td>
                    {new Date(entry.production_time).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td>{entry.volume_liters}</td>
                  <td>{entry?.lactation_phase || "N/A"}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        entry.lactation_status ? "success" : "secondary"
                      }`}
                    >
                      {entry.lactation_status ? "Active" : "Inactive"}
                    </span>
                  </td>{" "}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <p className="mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, milkData.length)} of {milkData.length}{" "}
            entries
          </p>
          <nav>{renderPagination()}</nav>
        </div>
      </div>
    </div>
  );
};

export default RecentMilkCard;
