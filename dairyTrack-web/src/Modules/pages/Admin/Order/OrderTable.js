import React, { useMemo } from "react";
import { Button, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";

const OrderTable = ({
  orders,
  searchTerm,
  selectedStatus,
  startDate,
  endDate,
  currentPage,
  ordersPerPage,
  setCurrentPage,
  openViewModal,
  openEditModal,
  handleDeleteOrder,
  isSupervisor,
  disableIfSupervisor,
}) => {
  // Format Rupiah
  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    const number = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Filter, sort, and paginate orders
  const filteredAndPaginatedOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      const matchesSearch = order.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus
        ? order.status === selectedStatus
        : true;

      // Date range filtering
      let matchesDate = true;
      const orderDate = new Date(order.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && orderDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= end;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    filtered = [...filtered].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + ordersPerPage
    );

    return {
      filteredOrders: filtered,
      currentOrders: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [
    orders,
    searchTerm,
    selectedStatus,
    startDate,
    endDate,
    currentPage,
    ordersPerPage,
  ]);

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
                Order No
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
                Total Price
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
                Created At
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
            {filteredAndPaginatedOrders.currentOrders.map((order, index) => (
              <tr
                key={order.id}
                className="align-middle"
                style={{ transition: "all 0.2s" }}
              >
                <td className="fw-bold text-center">
                  {(currentPage - 1) * ordersPerPage + index + 1}
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {order.order_no || "N/A"}
                  </span>
                </td>
                <td>
                  <span
                    className="fw-medium"
                    style={{ letterSpacing: "0.3px" }}
                  >
                    {order.customer_name || "N/A"}
                  </span>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {formatRupiah(order.total_price)}
                </td>
                <td>
                  <Badge
                    bg={
                      order.status === "Requested"
                        ? "warning"
                        : order.status === "Processed"
                        ? "info"
                        : order.status === "Completed"
                        ? "success"
                        : "danger"
                    }
                    className="px-1 py-1 text-white shadow-sm opacity-75"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      letterSpacing: "0.8px",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </td>
                <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                  {new Date(order.created_at).toLocaleString("id-ID")}
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
                        onClick={() => openViewModal(order)}
                      >
                        <i className="fas fa-eye" />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {isSupervisor
                            ? "Supervisor cannot edit orders"
                            : "Edit Order"}
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
                          openEditModal(order);
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
                            ? "Supervisor cannot delete orders"
                            : "Delete Order"}
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
                          handleDeleteOrder(order.id);
                        }}
                        {...disableIfSupervisor}
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

      {filteredAndPaginatedOrders.totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No orders found matching your criteria.
          </p>
        </div>
      )}

      {filteredAndPaginatedOrders.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * ordersPerPage + 1} to{" "}
            {Math.min(
              currentPage * ordersPerPage,
              filteredAndPaginatedOrders.totalItems
            )}{" "}
            of {filteredAndPaginatedOrders.totalItems} entries
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
              {[...Array(filteredAndPaginatedOrders.totalPages).keys()].map(
                (page) => {
                  const pageNumber = page + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === filteredAndPaginatedOrders.totalPages ||
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
                  currentPage === filteredAndPaginatedOrders.totalPages
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
                  currentPage === filteredAndPaginatedOrders.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage(filteredAndPaginatedOrders.totalPages)
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

export default OrderTable;
