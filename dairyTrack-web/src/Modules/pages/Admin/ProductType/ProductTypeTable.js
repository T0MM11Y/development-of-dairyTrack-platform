import React, { useMemo } from "react";
import { Button, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";

// Fungsi untuk memformat harga ke Rupiah
const formatRupiah = (value) => {
  if (!value) return "Rp 0";
  const number = parseFloat(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const ProductTypeTable = ({
  productTypes,
  searchTerm,
  selectedUnit,
  currentPage,
  productsPerPage,
  setCurrentPage,
  openViewModal,
  openEditModal,
  handleDeleteProductType,
  isSupervisor,
}) => {
  // Disable properties for supervisor role
  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor cannot perform this action",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

  // Filter, sort, and paginate product types
  const filteredAndPaginatedProductTypes = useMemo(() => {
    let filtered = productTypes.filter((pt) => {
      const matchesSearch =
        pt.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pt.product_description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUnit = selectedUnit ? pt.unit === selectedUnit : true;
      return matchesSearch && matchesUnit;
    });

    filtered = [...filtered].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedItems = filtered.slice(
      startIndex,
      startIndex + productsPerPage
    );

    return {
      filteredProductTypes: filtered,
      currentProductTypes: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [productTypes, searchTerm, selectedUnit, currentPage, productsPerPage]);

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
                style={{ width: "5%", fontWeight: "550", fontSize: "0.95rem" }}
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
                  width: "15%",
                  fontWeight: "550",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                Price
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
            {filteredAndPaginatedProductTypes.currentProductTypes.map(
              (pt, index) => (
                <tr
                  key={pt.id}
                  className="align-middle"
                  style={{ transition: "all 0.2s" }}
                >
                  <td className="fw-bold text-center">
                    {(currentPage - 1) * productsPerPage + index + 1}
                  </td>
                  <td>
                    {pt.image ? (
                      <img
                        src={pt.image}
                        alt={pt.product_name}
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
                      {pt.product_name}
                    </span>
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip style={{ fontFamily: "'Nunito', sans-serif" }}>
                          {pt.product_description}
                        </Tooltip>
                      }
                    >
                      <span
                        className="text-truncate d-inline-block fst-italic"
                        style={{
                          maxWidth: "400px",
                          letterSpacing: "0.2px",
                          color: "#555",
                          fontSize: "0.9rem",
                          borderLeft: "3px solid #eaeaea",
                          paddingLeft: "8px",
                        }}
                      >
                        {pt.product_description}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <Badge
                      bg="success text-white shadow-sm opacity-75"
                      className="px-1 py-1"
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        letterSpacing: "0.8px",
                        fontFamily: "'Roboto Mono', monospace",
                      }}
                    >
                      {formatRupiah(pt.price)}
                    </Badge>
                  </td>
                  <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                    {pt.unit}
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
                          onClick={() => openViewModal(pt)}
                        >
                          <i className="fas fa-eye" />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {isSupervisor
                              ? "Supervisor cannot edit product types"
                              : "Edit Product Type"}
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
                            openEditModal(pt);
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
                              ? "Supervisor cannot delete product types"
                              : "Delete Product Type"}
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
                            handleDeleteProductType(pt.id);
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

      {filteredAndPaginatedProductTypes.totalItems === 0 && (
        <div
          className="text-center py-5 my-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
          <p
            className="lead text-muted"
            style={{ letterSpacing: "0.5px", fontWeight: "500" }}
          >
            No product types found matching your criteria.
          </p>
        </div>
      )}

      {filteredAndPaginatedProductTypes.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {(currentPage - 1) * productsPerPage + 1} to{" "}
            {Math.min(
              currentPage * productsPerPage,
              filteredAndPaginatedProductTypes.totalItems
            )}{" "}
            of {filteredAndPaginatedProductTypes.totalItems} entries
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
                ...Array(filteredAndPaginatedProductTypes.totalPages).keys(),
              ].map((page) => {
                const pageNumber = page + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === filteredAndPaginatedProductTypes.totalPages ||
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
                  currentPage === filteredAndPaginatedProductTypes.totalPages
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
                  currentPage === filteredAndPaginatedProductTypes.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage(filteredAndPaginatedProductTypes.totalPages)
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

export default ProductTypeTable;
