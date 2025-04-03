import { fetchAPI } from "../apiClient1";

export const getProductTypes = () => fetchAPI("product-type");
export const getProductTypeById = (id) => fetchAPI(`product-type/${id}`);
export const createProductType = (data) => fetchAPI("product-type", "POST", data);
export const updateProductType = (id, data) => fetchAPI(`product-type/${id}`, "PUT", data);
export const deleteProductType = (id) => fetchAPI(`product-type${id}/`, "DELETE");
