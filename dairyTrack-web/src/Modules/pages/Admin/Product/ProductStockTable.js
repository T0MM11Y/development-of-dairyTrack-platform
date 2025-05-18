import React, { useMemo } from "react";
import { Button, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";

const ProductStockTable = ({
  productStocks,
  searchTerm,
  selectedStatus,
  currentPage,
  stocksPerPage,
  setCurrentPage,
  openViewModal,
  openEditModal,
  handleDeleteProductStock,
  isSupervisor,
  disableIfSupervisor,
}) => {
  // Filter, sort, and paginate product stocks
  const filteredAndPaginatedProductStocks = useMemo(() => {
    let filtered = productStocks.filter((ps) => {
      const matchesSearch = ps.product_type_detail?.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus
        ? ps.status === selectedStatus
        : true;
      return matchesSearch && matchesStatus;
    });

    filtered = [...filtered].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / stocksPerPage);
    const startIndex = (currentPage - 1) * stocksPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + stocksPerPage
    );

    return {
      filteredProductStocks: filtered,
      currentProductStocks: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [productStocks, searchTerm, selectedStatus, currentPage, stocksPerPage]);

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
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Image
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
                Quantity
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
                Status
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
                Production Date
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
                Expiry Date
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
            {filteredAndPaginatedProductStocks.currentProductStocks.map(
              (ps, index) => (
                <tr
                  key={ps.id}
                  className="align-middle"
                  style={{ transition: "all 0.2s" }}
                >
                  <td className="fw-bold text-center">
                    {(currentPage - 1) * stocksPerPage + index + 1}
                  </td>
                  <td>
                    {ps.product_type_detail?.image ? (
                      <img
                        src={ps.product_type_detail.image}
                        alt={ps.product_type_detail.product_name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex justify-content-center align-items-center"
                        style={{ width: "50px", height: "50px" }}
                      >
                        <i className="fas fa-image text-muted"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className="fw-medium"
                      style={{ letterSpacing: "0.3px" }}
                    >
                      {ps.product_type_detail?.product_name || "N/A"}
                    </span>
                  </td>
                  <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                    {ps.quantity} / {ps.initial_quantity}
                  </td>
                  <td>
                    <Badge
                      bg={
                        ps.status === "available"
                          ? "success"
                          : ps.status === "expired"
                          ? "danger"
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
                      {ps.status.charAt(0).toUpperCase() + ps.status.slice(1)}
                    </Badge>
                  </td>
                  <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                    {new Date(ps.production_at).toLocaleString("id-ID")}
                  </td>
                  <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                    {new Date(ps.expiry_at).toLocaleString("id-ID")}
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
                          onClick={() => openViewModal(ps)}
                        >
                          <i className="fas fa-eye" />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {isSupervisor
                              ? "Supervisor cannot edit product stocks"
                              : "Edit Stock"}
                          </Tooltip>
                        }
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
                          onClick={() => {
                            if (isSupervisor) return;
                            openEditModal(ps);
                          }}
                          {...disableIfSupervisor}
                        >
                          <i className="fas fa-edit" />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {isSupervisor
                              ? "Supervisor cannot delete product stocks"
                              : "Delete Stock"}
                          </Tooltip>
                        }
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
                          onClick={() => {
                            if (isSupervisor) return;
                            handleDeleteProductStock(ps.id);
                          }}
                          {...disableIfSupervisor}
                        >
                          <i className="fas fa-trash-alt" />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {filteredAndPaginatedProductStocks.totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No product stocks found matching your criteria.
          </p>
        </div>
      )}

      {filteredAndPaginatedProductStocks.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * stocksPerPage + 1} to{" "}
            {Math.min(
              currentPage * stocksPerPage,
              filteredAndPaginatedProductStocks.totalItems
            )}{" "}
            of {filteredAndPaginatedProductStocks.totalItems} entries
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
              {[
                ...Array(filteredAndPaginatedProductStocks.totalPages).keys(),
              ].map((page) => {
                const pageNumber = page + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === filteredAndPaginatedProductStocks.totalPages ||
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
                  currentPage === filteredAndPaginatedProductStocks.totalPages
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
                  currentPage === filteredAndPaginatedProductStocks.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage(filteredAndPaginatedProductStocks.totalPages)
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

export default ProductStockTable;
