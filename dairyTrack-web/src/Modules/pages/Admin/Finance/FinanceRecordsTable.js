import React, { useMemo } from "react";
import { Button, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";

const FinanceRecordsTable = ({
  records,
  searchTerm,
  selectedType,
  currentPage,
  recordsPerPage,
  setCurrentPage,
  openViewModal,
  openEditModal,
  handleDeleteRecord,
  formatRupiah,
  disableIfSupervisor,
}) => {
  const filteredAndPaginatedRecords = useMemo(() => {
    let filtered = records.filter((r) => {
      const matchesSearch = r.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = selectedType ? r.type === selectedType : true;
      return matchesSearch && matchesType;
    });

    filtered = [...filtered].sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + recordsPerPage
    );

    return {
      filteredRecords: filtered,
      currentRecords: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [records, searchTerm, selectedType, currentPage, recordsPerPage]);

  return (
    <>
      <div className="table-responsive">
        <table
          className="table table-hover border rounded shadow-sm"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <thead className="bg-gradient-light">
            <tr
              style={{
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: "0.4px",
              }}
            >
              <th
                className="py-3 text-center"
                style={{
                  width: "5%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                #
              </th>
              <th
                className="py-3"
                style={{
                  width: "25%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Description
              </th>
              <th
                className="py-3"
                style={{
                  width: "20%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Category
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Type
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Amount
              </th>
              <th
                className="py-3"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Date
              </th>
              <th
                className="py-3 text-center"
                style={{
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndPaginatedRecords.currentRecords.map((record, index) => (
              <tr
                key={`${record.type}-${record.id}`}
                className="align-middle"
                style={{ transition: "all 0.2s" }}
              >
                <td className="fw-bold text-center">
                  {(currentPage - 1) * recordsPerPage + index + 1}
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {record.description || "N/A"}
                  </span>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {record.category}
                </td>
                <td>
                  <Badge
                    bg={record.type === "income" ? "success" : "danger"}
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {formatRupiah(record.amount)}
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {new Date(record.transaction_date).toLocaleString("id-ID")}
                </td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>View Details</Tooltip>}
                    >
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                        }}
                        onClick={() => openViewModal(record)}
                      >
                        <i className="fas fa-eye" />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit Record</Tooltip>}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                          ...disableIfSupervisor.style,
                        }}
                        {...disableIfSupervisor}
                        onClick={() => openEditModal(record)}
                      >
                        <i className="fas fa-edit" />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Delete Record</Tooltip>}
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                          ...disableIfSupervisor.style,
                        }}
                        {...disableIfSupervisor}
                        onClick={() => handleDeleteRecord(record)}
                      >
                        <i className="fas fa-trash-alt" />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndPaginatedRecords.totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No finance records found matching your criteria.
          </p>
        </div>
      )}

      {filteredAndPaginatedRecords.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
            {Math.min(
              currentPage * recordsPerPage,
              filteredAndPaginatedRecords.totalItems
            )}{" "}
            of {filteredAndPaginatedRecords.totalItems} entries
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(1)}>
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {[...Array(filteredAndPaginatedRecords.totalPages).keys()].map(
                (page) => {
                  const pageNumber = page + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === filteredAndPaginatedRecords.totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          currentPage === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <li key={pageNumber} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                }
              )}
              <li
                className={`page-item ${
                  currentPage === filteredAndPaginatedRecords.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === filteredAndPaginatedRecords.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage(filteredAndPaginatedRecords.totalPages)
                  }
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default FinanceRecordsTable;