import { fetchAPI } from "../apiClient1";

export const getProductStocks = () => fetchAPI("product-stock/");
export const getProductStockById = (id) => fetchAPI(`product-stock/${id}/`);
export const createProductStock = (data) => fetchAPI("product-stock/", "POST", data);
export const updateProductStock = (id, data) => fetchAPI(`product-stock/${id}/`, "PUT", data);
export const deleteProductStock = (id) => fetchAPI(`product-stock/${id}/`, "DELETE");
