import React, { useMemo } from "react";
import { Badge } from "react-bootstrap";

const SalesTransactionTable = ({
  salesTransactions,
  currentPage,
  transactionsPerPage,
  setCurrentPage,
  formatRupiah,
}) => {
  // Filter, sort, and paginate sales transactions
  const { currentSalesTransactions, totalItems, totalPages } = useMemo(() => {
    let filtered = [...salesTransactions].sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + transactionsPerPage
    );

    return {
      currentSalesTransactions: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [salesTransactions, currentPage, transactionsPerPage]);

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
                Customer Name
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
                Order No
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
                Payment Method
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
                Transaction Date
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSalesTransactions.map((tx, index) => (
              <tr
                key={tx.id + "-" + index}
                className="align-middle"
                style={{ transition: "all 0.2s" }}
              >
                <td className="fw-bold text-center">
                  {(currentPage - 1) * transactionsPerPage + index + 1}
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {tx.order.customer_name || "N/A"}
                  </span>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {tx.order.order_no}
                </td>
                <td>
                  <Badge
                    bg={
                      tx.payment_method === "Cash"
                        ? "success"
                        : "info"
                    }
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {tx.payment_method.charAt(0).toUpperCase() +
                      tx.payment_method.slice(1)}
                  </Badge>
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
                    {formatRupiah(tx.total_price)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {new Date(tx.transaction_date).toLocaleString("id-ID")}
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
            No sales transactions found matching your criteria.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * transactionsPerPage + 1} to{" "}
            {Math.min(currentPage * transactionsPerPage, totalItems)} of {totalItems}{" "}
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

export default SalesTransactionTable;