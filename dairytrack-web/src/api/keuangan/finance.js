import { fetchAPI } from "../apiClient1";

// export const getFinances = () => fetchAPI("finance/finance/");
export const getFinances = (queryString = "") =>
    fetchAPI(`finance/finance/${queryString ? `?${queryString}` : ""}`);

export const getFinanceExportPdf = (queryString = "") =>
    fetchAPI(
      `finance/export/pdf/${queryString ? `?${queryString}` : ""}`,
      "GET",
      null,
      true
    ); // true = isBlob
  
  export const getFinanceExportExcel = (queryString = "") =>
    fetchAPI(
      `finance/export/excel/${queryString ? `?${queryString}` : ""}`,
      "GET",
      null,
      true
    ); // true = isBlob