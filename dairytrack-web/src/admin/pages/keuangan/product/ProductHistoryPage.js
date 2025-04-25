// ProductHistoryPage.jsx - Main container component
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getProductStockHistorys,
  getProductStockHistoryExportPdf,
  getProductStockHistoryExportExcel,
} from "../../../../api/keuangan/product";

// Import smaller components
import FilterSection from "./components/FilterSection";
import SummaryCards from "./components/SummaryCard";
import ProductHistoryTable from "./components/ProductHistoryTable";
import LoadingCard from "./components/LoadingCard";
import EmptyDataCard from "./components/EmptyCard";

const ProductHistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const [summaryData, setSummaryData] = useState({
    totalQuantity: 0,
    quantityPercentage: 0,
    productTypeData: [],
    changeTypeData: [],
    changeTypeSummary: {
      sold: 0,
      expired: 0,
      contamination: 0,
    },
  });

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

    // For demonstration, set a random percentage change
    // In a real app, you would compare with previous period data
    const quantityPercentage = Math.floor(Math.random() * 30) - 10;

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

    // Process change type data
    const changeTypes = {};
    const changeTypeSummary = { sold: 0, expired: 0, contamination: 0 };

    data.forEach((item) => {
      if (!changeTypes[item.change_type]) {
        changeTypes[item.change_type] = 0;
      }
      changeTypes[item.change_type] += Math.abs(item.quantity_change);

      // Update specific change type counters
      if (changeTypeSummary.hasOwnProperty(item.change_type)) {
        changeTypeSummary[item.change_type] += Math.abs(item.quantity_change);
      }
    });

    const changeTypeArray = Object.keys(changeTypes).map((type) => ({
      name: getChangeTypeLabel(type),
      value: changeTypes[type],
    }));

    setSummaryData({
      totalQuantity: totalQty,
      quantityPercentage,
      productTypeData: productTypeArray,
      changeTypeData: changeTypeArray,
      changeTypeSummary,
    });
  };

  const handleExportPdf = async () => {
    try {
      const queryParams = buildQueryParams();
      console.log(
        "Exporting PDF with URL:",
        `product-history/export/pdf/${queryParams ? `?${queryParams}` : ""}`
      );

      const response = await getProductStockHistoryExportPdf(queryParams);
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
      const queryParams = buildQueryParams();
      console.log(
        "Exporting Excel with URL:",
        `product-history/export/excel/${queryParams ? `?${queryParams}` : ""}`
      );

      const response = await getProductStockHistoryExportExcel(queryParams);
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

  const buildQueryParams = () => {
    const queryParams = new URLSearchParams();
    if (filters.start_date)
      queryParams.append("start_date", filters.start_date);
    if (filters.end_date) queryParams.append("end_date", filters.end_date);
    if (filters.change_type && filters.change_type !== "all")
      queryParams.append("change_type", filters.change_type);

    return queryParams.toString();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  // Helper function that will be passed to components
  const getChangeTypeLabel = (changeType) => {
    const labels = {
      sold: "Terjual",
      expired: "Kadaluarsa",
      contamination: "Kontaminasi",
    };
    return labels[changeType] || changeType;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 m-1">
            {t("product.product_history")}
          </h2>
          <p className="text-gray-600">
            {t("product.product_history_description")}
          </p>
        </div>

        <FilterSection
          onFilterChange={handleFilterChange}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          t={t}
        />

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <SummaryCards
            summaryData={summaryData}
            t={t}
            getChangeTypeLabel={getChangeTypeLabel}
          />
        )}

        {loading ? (
          <LoadingCard t={t} />
        ) : historyData.length === 0 ? (
          <EmptyDataCard t={t} />
        ) : (
          <ProductHistoryTable
            historyData={historyData}
            filters={filters}
            getChangeTypeLabel={getChangeTypeLabel}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default ProductHistoryPage;
