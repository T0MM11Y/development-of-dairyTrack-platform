import { fetchAPI } from "../apiClient1";

export const getProductStocks = () => fetchAPI("product-stock");
// export const getProductStockHistorys = () => fetchAPI("product-history/");
// export const getProductStockHistoryExportPdf = () =>
//   fetchAPI("product-history/export/pdf/");
// export const getProductStockHistoryExportExcel = () =>
//   fetchAPI("product-history/export/excel/");

export const getProductStockHistorys = (queryString = "") =>
  fetchAPI(`product-history/${queryString ? `?${queryString}` : ""}`);

export const getProductStockHistoryExportPdf = (queryString = "") =>
  fetchAPI(
    `product-history/export/pdf/${queryString ? `?${queryString}` : ""}`,
    "GET",
    null,
    true
  ); // true = isBlob

export const getProductStockHistoryExportExcel = (queryString = "") =>
  fetchAPI(
    `product-history/export/excel/${queryString ? `?${queryString}` : ""}`,
    "GET",
    null,
    true
  ); // true = isBlob

export const getProductStockById = (id) => fetchAPI(`product-stock/${id}`);
export const createProductStock = (data) =>
  fetchAPI("product-stock", "POST", data);
export const updateProductStock = (id, data) =>
  fetchAPI(`product-stock/${id}/`, "PUT", data);
export const deleteProductStock = (id) =>
  fetchAPI(`product-stock/${id}/`, "DELETE");
