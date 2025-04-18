import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import DataTable from "react-data-table-component";
import {
  getProductStockHistorys,
  getProductStockHistoryExportPdf,
  getProductStockHistoryExportExcel,
} from "../../../../api/keuangan/product";
import { useTranslation } from "react-i18next";


const ProductHistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [changeType, setChangeType] = useState("");
  const [filters, setFilters] = useState({});
  // Summary data states
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [quantityPercentage, setQuantityPercentage] = useState(0);
  const [productTypeData, setProductTypeData] = useState([]);
  const [changeTypeData, setChangeTypeData] = useState([]);
  const { t } = useTranslation();

  const fetchData = async (filterParams = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filterParams.start_date)
        queryParams.append("start_date", filterParams.start_date);
      if (filterParams.end_date)
        queryParams.append("end_date", filterParams.end_date);
      if (filterParams.change_type && filterParams.change_type !== "all")
        queryParams.append("change_type", filterParams.change_type);

      const queryString = queryParams.toString();
      const url = `product-history/${queryString ? `?${queryString}` : ""}`;
      console.log("Fetching data from URL:", url);

      const historyRes = await getProductStockHistorys(queryString);
      setHistoryData(historyRes);
      processDataForSummary(historyRes);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const processDataForSummary = (data) => {
    // Calculate total quantity
    const totalQty = data.reduce(
      (sum, item) => sum + Math.abs(item.quantity_change),
      0
    );
    setTotalQuantity(totalQty);

    // For demonstration, set a random percentage change
    // In a real app, you would compare with previous period data
    setQuantityPercentage(Math.floor(Math.random() * 30) - 10);

    // Process product type data
    const productTypes = {};
    data.forEach((item) => {
      if (!productTypes[item.product_name]) {
        productTypes[item.product_name] = 0;
      }
      productTypes[item.product_name] += Math.abs(item.quantity_change);
    });

    const productTypeArray = Object.keys(productTypes).map((name) => ({
      name,
      value: productTypes[name],
    }));
    setProductTypeData(productTypeArray);

    // Process change type data
    const changeTypes = {};
    data.forEach((item) => {
      if (!changeTypes[item.change_type]) {
        changeTypes[item.change_type] = 0;
      }
      changeTypes[item.change_type] += Math.abs(item.quantity_change);
    });

    const changeTypeArray = Object.keys(changeTypes).map((type) => ({
      name: getChangeTypeLabel(type),
      value: changeTypes[type],
    }));
    setChangeTypeData(changeTypeArray);
  };

  const handleExportPdf = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.change_type && filters.change_type !== "all")
        queryParams.append("change_type", filters.change_type);

      const queryString = queryParams.toString();
      console.log(
        "Exporting PDF with URL:",
        `product-history/export/pdf/${queryString ? `?${queryString}` : ""}`
      );

      const response = await getProductStockHistoryExportPdf(queryString);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("Gagal mengekspor PDF. Silakan coba lagi.");
    }
  };

  const handleExportExcel = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.change_type && filters.change_type !== "all")
        queryParams.append("change_type", filters.change_type);

      const queryString = queryParams.toString();
      console.log(
        "Exporting Excel with URL:",
        `product-history/export/excel/${queryString ? `?${queryString}` : ""}`
      );

      const response = await getProductStockHistoryExportExcel(queryString);
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `product_history_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      setError("Gagal mengekspor Excel. Silakan coba lagi.");
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      start_date: startDate,
      end_date: endDate,
      change_type: changeType,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setChangeType("");
    const reset = {};
    setFilters(reset);
    fetchData(reset);
  };

  const getChangeTypeLabel = (changeType) => {
    const labels = {
      sold: "Terjual",
      produced: "Diproduksi",
      expired: "Kadaluarsa",
      damaged: "Rusak",
      contamination: "Kontaminasi",
      returned: "Dikembalikan",
    };
    return labels[changeType] || changeType;
  };

  const getChangeTypeClass = (changeType) => {
    const classes = {
      sold: "bg-success",
      produced: "bg-info",
      expired: "bg-danger",
      damaged: "bg-warning",
      contamination: "bg-danger",
      returned: "bg-secondary",
    };
    return classes[changeType] || "bg-primary";
  };

  // Card component for summary metrics
  const Card = ({ title, value, percentage, icon, bgColor }) => {
    return (
      <div className="col-md-4">
        {" "}
        {/* Ubah menjadi col-md-4 agar konsisten */}
        <div className="card" style={{ height: "346px" }}>
          {" "}
          {/* Tinggi sama dengan card donut chart */}
          <div className="card-body d-flex flex-column justify-content-center">
            <h5 className="card-title mb-4 text-center">{title}</h5>
            <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
              <h2 className="mb-3 display-5">{value}</h2>
              <div
                className={`avatar-md rounded-circle ${bgColor} p-3 mx-auto mb-3`}
              >
                <span className="avatar-title rounded-circle h3 mb-0">
                  {icon}
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={`badge ${
                    percentage >= 0 ? "bg-success" : "bg-danger"
                  } fw-bold font-size-12 me-2`}
                >
                  <i
                    className={`bx ${
                      percentage >= 0 ? "bx-up-arrow-alt" : "bx-down-arrow-alt"
                    } me-1 align-middle`}
                  ></i>
                  {Math.abs(percentage)}%
                </span>
                <span className="text-muted font-size-12">
                {t('product.from_previous_period')}

                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Configure chart options
  const productTypeChartOptions = {
    series: productTypeData.map((item) => item.value),
    options: {
      chart: {
        type: "donut",
      },
      labels: productTypeData.map((item) => item.name),
      legend: {
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  const changeTypeChartOptions = {
    series: changeTypeData.map((item) => item.value),
    options: {
      chart: {
        type: "donut",
      },
      labels: changeTypeData.map((item) => item.name),
      colors: ["#28a745", "#17a2b8", "#dc3545", "#ffc107", "#6c757d"],
      legend: {
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
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

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

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
    <div className="p-4">
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 m-1">
          {t('product.product_history')}

          </h2>
          <p className="text-gray-600">{t('product.product_history_description')}
          </p>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Filter & Export</h4>
                <form onSubmit={handleFilterSubmit}>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="form-group">
                        <label>{t('product.start_date')}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="form-group">
                        <label>{t('product.end_date')}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="form-group">
                        <label>{t('product.change_type')}
                        </label>
                        <select
                          className="form-select"
                          value={changeType}
                          onChange={(e) => setChangeType(e.target.value)}
                        >
                          <option value="">{t('product.all')}
                          </option>
                          <option value="sold">{t('product.sold')}
                          </option>
                          <option value="produced">{t('product.produced')}
                          </option>
                          <option value="expired">{t('product.expired')}
                          </option>
                          <option value="damaged">{t('product.damaged')}
                          </option>
                          <option value="contamination">{t('product.contaminated')}
                          </option>
                          <option value="returned">{t('product.returned')}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3 d-flex align-items-end">
                      <div className="form-group w-100">
                        <button type="submit" className="btn btn-primary me-2">
                          <i className="bx bx-filter-alt me-1"></i> Filter
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={resetFilters}
                        >
                          <i className="bx bx-reset me-1"></i> Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row mt-4">
                  <div className="col-md-12 text-end">
                    <button
                      className="btn btn-success me-2"
                      onClick={handleExportExcel}
                    >
                      <i className="bx bxs-file-export me-1"></i> Export Excel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleExportPdf}
                    >
                      <i className="bx bxs-file-pdf me-1"></i> Export PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards Row */}
        {!loading && !error && (
          <div className="row">
            {/* Total Quantity Card */}
            <Card
              title="Total Quantity Changed"
              value={formatNumber(totalQuantity)}
              percentage={quantityPercentage}
              icon="🥛"
              bgColor=""
            />

            {/* Product Type Distribution */}
            <div className="col-md-4">
              <div className="card" style={{ height: "346px" }}>
                <div className="card-body">
                  <h4 className="card-title mb-4">{t('product.product_type_distribution')}
                  </h4>
                  <div style={{ height: "280px" }}>
                    {productTypeData.length > 0 ? (
                      <ReactApexChart
                        options={productTypeChartOptions.options}
                        series={productTypeChartOptions.series}
                        type="donut"
                        height="280"
                      />
                    ) : (
                      <div className="text-center my-5">{t('product.no_data_available')}
</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Type Distribution */}
            <div className="col-md-4">
              <div className="card" style={{ height: "346px" }}>
                <div className="card-body">
                  <h4 className="card-title mb-4">{t('product.product_type_distribution')}
                  </h4>
                  <div style={{ height: "280px" }}>
                    {productTypeData.length > 0 ? (
                      <ReactApexChart
                        options={productTypeChartOptions.options}
                        series={productTypeChartOptions.series}
                        type="donut"
                        height="280"
                      />
                    ) : (
                      <div className="text-center my-5">{t('product.no_data_available')}
</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card">
            <div className="card-body text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="mt-3">{t('product.loading_product_history')}
              ...</h5>
            </div>
          </div>
        ) : historyData.length === 0 ? (
          <div className="card">
            <div className="card-body text-center p-5">
              <i className="bx bx-info-circle font-size-24 text-muted"></i>
              <h5 className="mt-3">
              {t('product.no_product_history')}
              </h5>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">{t('product.product_history_data')}
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
                progressPending={loading}
                noHeader
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHistoryPage;
