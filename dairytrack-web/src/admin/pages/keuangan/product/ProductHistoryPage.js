import { useEffect, useState } from "react";
import {
  getProductStocks,
  getProductStockHistorys,
} from "../../../../api/keuangan/product";
import { getProductTypes } from "../../../../api/keuangan/productType";

const ProductHistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [productStocks, setProductStocks] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, productsRes, productTypesRes] = await Promise.all([
        getProductStockHistorys(), // Using the existing API function
        getProductStocks(),
        getProductTypes(),
      ]);

      setHistoryData(historyRes);
      setProductStocks(productsRes);
      setProductTypes(productTypesRes);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const getProductTypeInfo = (productStockId) => {
    const productStock = productStocks.find(
      (stock) => stock.id === productStockId
    );
    if (!productStock) return { name: "Unknown", quantity: "N/A" };

    const productType = productTypes.find(
      (type) => type.id === productStock.product_type
    );
    return {
      name: productType ? productType.product_name : "Unknown",
      quantity: productStock.quantity,
    };
  };

  const getChangeTypeLabel = (changeType) => {
    const labels = {
      sold: "Terjual",
      produced: "Diproduksi",
      expired: "Kadaluarsa",
      damaged: "Rusak",
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
      returned: "bg-secondary",
    };
    return classes[changeType] || "bg-primary";
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">Product History</h2>
        <p className="text-gray-600">Riwayat perubahan stok produk</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading product history data...</p>
        </div>
      ) : historyData.length === 0 ? (
        <p className="text-gray-500">No product history data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Product History Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Product Type</th>
                      <th>Change Type</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => {
                      const productInfo = getProductTypeInfo(
                        item.product_stock
                      );
                      return (
                        <tr key={item.id}>
                          <th scope="row">{index + 1}</th>
                          <td>
                            {new Date(item.change_date).toLocaleString("id-ID")}
                          </td>
                          <td>{productInfo.name}</td>
                          <td>
                            <span
                              className={`badge ${getChangeTypeClass(
                                item.change_type
                              )}`}
                            >
                              {getChangeTypeLabel(item.change_type)}
                            </span>
                          </td>
                          <td
                            className={
                              item.change_type === "sold" ||
                              item.change_type === "expired"
                                ? item.change_type === "sold"
                                  ? "text-success"
                                  : "text-danger"
                                : ""
                            }
                          >
                            {Math.abs(item.quantity_change)}
                          </td>
                          <td>
                            {parseFloat(item.total_price) > 0
                              ? `Rp ${parseFloat(
                                  item.total_price
                                ).toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductHistoryPage;
