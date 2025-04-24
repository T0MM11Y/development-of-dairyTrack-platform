// components/ProductHistoryTable.jsx
import DataTable from "react-data-table-component";

const ProductHistoryTable = ({
  historyData,
  filters,
  getChangeTypeLabel,
  t,
}) => {
  const getChangeTypeClass = (changeType) => {
    const classes = {
      sold: "bg-success",
      expired: "bg-danger",
      contamination: "bg-warning",
    };
    return classes[changeType] || "bg-primary";
  };

  // Configure columns for DataTable
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "60px",
    },
    {
      name: "Date & Time",
      selector: (row) => new Date(row.change_date).toLocaleString("id-ID"),
      sortable: true,
      wrap: true,
    },
    {
      name: "Product Type",
      selector: (row) => row.product_name,
      sortable: true,
    },
    {
      name: "Change Type",
      cell: (row) => (
        <span className={`badge ${getChangeTypeClass(row.change_type)}`}>
          {getChangeTypeLabel(row.change_type)}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Quantity",
      cell: (row) => `${Math.abs(row.quantity_change)} ${row.unit}`,
      sortable: true,
      right: true,
    },
    {
      name: "Total Price",
      cell: (row) =>
        parseFloat(row.total_price) > 0
          ? `Rp ${parseFloat(row.total_price).toLocaleString("id-ID")}`
          : "-",
      sortable: true,
      right: true,
    },
  ];

  // DataTable custom styles
  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#f8f9fa",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0">
            {t("product.product_history_data")}
          </h4>
          {Object.keys(filters).length > 0 && (
            <span className="badge bg-info p-2">
              Filtered by:{" "}
              {filters.start_date && `Date from ${filters.start_date}`}{" "}
              {filters.end_date && `Date to ${filters.end_date}`}{" "}
              {filters.change_type &&
                filters.change_type !== "all" &&
                `Type: ${getChangeTypeLabel(filters.change_type)}`}
            </span>
          )}
        </div>

        <DataTable
          columns={columns}
          data={historyData}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          customStyles={customStyles}
          noHeader
        />
      </div>
    </div>
  );
};

export default ProductHistoryTable;
