import React, { useMemo } from "react";
import { Badge } from "react-bootstrap";

const ProductHistoryTable = ({
  productHistory,
  currentPage,
  historyPerPage,
  setCurrentPage,
  formatRupiah,
}) => {
  // Filter, sort, and paginate product history
  const { currentProductHistory, totalItems, totalPages } = useMemo(() => {
    let filtered = [...productHistory].sort(
      (a, b) => new Date(b.change_date) - new Date(a.change_date)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / historyPerPage);
    const startIndex = (currentPage - 1) * historyPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + historyPerPage
    );

    return {
      currentProductHistory: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [productHistory, currentPage, historyPerPage]);

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
                  width: "20%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Product Name
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
                Change Type
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
                Quantity Change
              </th>
              <th
                className="py-3"
                style={{
                  width: "10%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Unit
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
                Total Price
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
                Change Date
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProductHistory.map((ph, index) => (
              <tr
                key={ph.product_stock + "-" + index}
                className="align-middle"
                style={{ transition: "all 0.2s" }}
              >
                <td className="fw-bold text-center">
                  {(currentPage - 1) * historyPerPage + index + 1}
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {ph.product_name || "N/A"}
                  </span>
                </td>
                <td>
                  <Badge
                    bg={
                      ph.change_type === "expired"
                        ? "danger"
                        : ph.change_type === "sold"
                        ? "success"
                        : "warning"
                    }
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {ph.change_type.charAt(0).toUpperCase() +
                      ph.change_type.slice(1)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {ph.quantity_change}
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {ph.unit}
                </td>
                <td>
                  <Badge
                    bg="success"
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {formatRupiah(ph.total_price)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {new Date(ph.change_date).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No product history found matching your criteria.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * historyPerPage + 1} to{" "}
            {Math.min(currentPage * historyPerPage, totalItems)} of {totalItems}{" "}
            entries
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
              {[...Array(totalPages).keys()].map((page) => {
                const pageNumber = page + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
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
              })}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
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
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(totalPages)}
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

export default ProductHistoryTable;
