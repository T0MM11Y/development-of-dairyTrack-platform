// src/components/IncomeTable.jsx
import React from "react";

const IncomeTable = ({ incomes, formatRupiah, onEdit, onDelete, loading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-left text-sm font-nunito font-medium text-gray-600">
            <th className="py-3 px-4 w-12 text-center">#</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((income, index) => (
            <tr key={income.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4 text-center font-medium">{index + 1}</td>
              <td className="py-3 px-4 font-medium">
                {income.description || "N/A"}
              </td>
              <td className="py-3 px-4 font-medium">
                {income.income_type_detail?.name || "Unknown"}
              </td>
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-1 rounded bg-green-500 text-white font-roboto text-xs">
                  +{formatRupiah(income.amount)}
                </span>
              </td>
              <td className="py-3 px-4 font-medium">
                {new Date(income.transaction_date).toLocaleString("id-ID")}
              </td>
              <td className="py-3 px-4 flex space-x-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  onClick={() => onEdit(income)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => onDelete(income.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && incomes.length === 0 ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : incomes.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 font-nunito">No incomes found.</p>
        </div>
      ) : null}
    </div>
  );
};

export default IncomeTable;
